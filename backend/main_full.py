from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
from datetime import timedelta
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os
import json
from typing import Dict, Any, List, Optional
import io

# Import our new modules
from database import get_db, create_tables, User, Product, CartItem, Order, OrderItem, Review
from auth import (
    authenticate_user, create_access_token, get_current_active_user, 
    get_admin_user, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
)
from schemas import (
    UserCreate, UserLogin, UserResponse, UserUpdate, Token,
    ProductCreate, ProductUpdate, ProductResponse, ProductFilter,
    CartItemCreate, CartItemUpdate, CartResponse, CartItemResponse,
    OrderCreate, OrderResponse, ReviewCreate, ReviewResponse,
    DashboardStats, ProductInput, PredictionResponse, ModelMetrics
)

app = FastAPI(
    title="AI-Powered E-commerce Platform",
    description="A comprehensive e-commerce platform with AI-driven dynamic pricing",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for ML model
model = None
label_encoders = {}
feature_columns = []
model_metrics = {}

# Create database tables
create_tables()

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize the model and create admin user on startup"""
    if not load_model():
        print("Training new model...")
        train_model()
        print("Model ready!")
    
    # Create default admin user if not exists
    db = next(get_db())
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        admin_user = User(
            email="admin@example.com",
            username="admin",
            full_name="Administrator",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        print("Default admin user created: username=admin, password=admin123")
    
    db.close()

# =================================
# AUTHENTICATION ENDPOINTS
# =================================

@app.post("/auth/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        phone=user.phone,
        address=user.address,
        hashed_password=get_password_hash(user.password),
        role="user"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token"""
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user

@app.put("/auth/me", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

# =================================
# PRODUCT ENDPOINTS
# =================================

@app.get("/products", response_model=Dict[str, List[ProductResponse]])
async def get_products(
    filters: ProductFilter = Depends(),
    db: Session = Depends(get_db)
):
    """Get products with filtering, searching, and pagination"""
    query = db.query(Product).filter(Product.is_active == True)
    
    # Apply filters
    if filters.category:
        query = query.filter(Product.category == filters.category)
    if filters.brand_tier:
        query = query.filter(Product.brand_tier == filters.brand_tier)
    if filters.season:
        query = query.filter(Product.season == filters.season)
    if filters.min_price:
        query = query.filter(Product.base_price >= filters.min_price)
    if filters.max_price:
        query = query.filter(Product.base_price <= filters.max_price)
    if filters.min_rating:
        query = query.filter(Product.rating >= filters.min_rating)
    if filters.search:
        search_term = f"%{filters.search}%"
        query = query.filter(
            or_(
                Product.product_name.ilike(search_term),
                Product.category.ilike(search_term)
            )
        )
    
    # Apply sorting
    if filters.sort_by == "price_low":
        query = query.order_by(asc(Product.base_price))
    elif filters.sort_by == "price_high":
        query = query.order_by(desc(Product.base_price))
    elif filters.sort_by == "rating":
        query = query.order_by(desc(Product.rating))
    elif filters.sort_by == "newest":
        query = query.order_by(desc(Product.created_at))
    else:  # popularity
        query = query.order_by(desc(Product.sales_last_30_days))
    
    # Pagination
    offset = (filters.page - 1) * filters.limit
    products = query.offset(offset).limit(filters.limit).all()
    
    # Add AI predictions
    products_with_predictions = []
    for product in products:
        try:
            # Get AI prediction
            prediction = predict_product_price(product)
            product_dict = ProductResponse.from_orm(product).dict()
            product_dict.update(prediction)
            products_with_predictions.append(ProductResponse(**product_dict))
        except:
            product_dict = ProductResponse.from_orm(product).dict()
            product_dict['predicted_price'] = product.target_price
            product_dict['confidence'] = 0.85
            products_with_predictions.append(ProductResponse(**product_dict))
    
    return {"products": products_with_predictions}

@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product"""
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Add AI prediction
    try:
        prediction = predict_product_price(product)
        product_dict = ProductResponse.from_orm(product).dict()
        product_dict.update(prediction)
        return ProductResponse(**product_dict)
    except:
        product_dict = ProductResponse.from_orm(product).dict()
        product_dict['predicted_price'] = product.target_price
        product_dict['confidence'] = 0.85
        return ProductResponse(**product_dict)

# Admin-only product management
@app.post("/admin/products", response_model=ProductResponse)
async def create_product(
    product: ProductCreate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new product (admin only)"""
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/admin/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update a product (admin only)"""
    db_product = db.query(Product).filter(Product.product_id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for field, value in product_update.dict(exclude_unset=True).items():
        setattr(db_product, field, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/admin/products/{product_id}")
async def delete_product(
    product_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a product (admin only)"""
    db_product = db.query(Product).filter(Product.product_id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db_product.is_active = False
    db.commit()
    return {"message": "Product deleted successfully"}

# =================================
# CART ENDPOINTS
# =================================

@app.get("/cart", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's cart"""
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    
    # Calculate total
    total_amount = 0
    items_response = []
    for item in cart_items:
        # Get AI prediction for current price
        try:
            prediction = predict_product_price(item.product)
            price = prediction['predicted_price']
        except:
            price = item.product.target_price
        
        total_amount += price * item.quantity
        
        # Add prediction to product
        product_dict = ProductResponse.from_orm(item.product).dict()
        product_dict['predicted_price'] = price
        product_dict['confidence'] = 0.85
        
        item_response = CartItemResponse.from_orm(item).dict()
        item_response['product'] = ProductResponse(**product_dict)
        items_response.append(CartItemResponse(**item_response))
    
    return CartResponse(items=items_response, total_amount=total_amount)

@app.post("/cart", response_model=CartItemResponse)
async def add_to_cart(
    item: CartItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add item to cart"""
    # Check if product exists
    product = db.query(Product).filter(Product.product_id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    existing_item = db.query(CartItem).filter(
        and_(CartItem.user_id == current_user.id, CartItem.product_id == item.product_id)
    ).first()
    
    if existing_item:
        existing_item.quantity += item.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
    else:
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)
        return cart_item

@app.put("/cart/{item_id}", response_model=CartItemResponse)
async def update_cart_item(
    item_id: int,
    item_update: CartItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update cart item quantity"""
    cart_item = db.query(CartItem).filter(
        and_(CartItem.id == item_id, CartItem.user_id == current_user.id)
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    cart_item.quantity = item_update.quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item

@app.delete("/cart/{item_id}")
async def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove item from cart"""
    cart_item = db.query(CartItem).filter(
        and_(CartItem.id == item_id, CartItem.user_id == current_user.id)
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}

@app.delete("/cart/clear")
async def clear_cart(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Clear user's cart"""
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Cart cleared"}

# =================================
# ORDER ENDPOINTS
# =================================

@app.post("/orders", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create order from cart"""
    # Get cart items
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total and create order
    total_amount = 0
    order = Order(
        user_id=current_user.id,
        total_amount=0,  # Will calculate below
        shipping_address=order_data.shipping_address,
        payment_method=order_data.payment_method
    )
    db.add(order)
    db.flush()  # Get order ID
    
    # Create order items
    for cart_item in cart_items:
        try:
            prediction = predict_product_price(cart_item.product)
            price = prediction['predicted_price']
        except:
            price = cart_item.product.target_price
        
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price_at_time=price
        )
        db.add(order_item)
        total_amount += price * cart_item.quantity
    
    # Update order total
    order.total_amount = total_amount
    
    # Clear cart
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    
    db.commit()
    db.refresh(order)
    return order

@app.get("/orders", response_model=List[OrderResponse])
async def get_user_orders(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's orders"""
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(desc(Order.created_at)).all()
    return orders

@app.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific order"""
    order = db.query(Order).filter(
        and_(Order.id == order_id, Order.user_id == current_user.id)
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# =================================
# WISHLIST ENDPOINTS
# =================================

@app.post("/wishlist/{product_id}")
async def add_to_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add product to wishlist"""
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product not in current_user.wishlists:
        current_user.wishlists.append(product)
        db.commit()
    
    return {"message": "Product added to wishlist"}

@app.delete("/wishlist/{product_id}")
async def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove product from wishlist"""
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product in current_user.wishlists:
        current_user.wishlists.remove(product)
        db.commit()
    
    return {"message": "Product removed from wishlist"}

@app.get("/wishlist", response_model=List[ProductResponse])
async def get_wishlist(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's wishlist"""
    products_with_predictions = []
    for product in current_user.wishlists:
        try:
            prediction = predict_product_price(product)
            product_dict = ProductResponse.from_orm(product).dict()
            product_dict.update(prediction)
            products_with_predictions.append(ProductResponse(**product_dict))
        except:
            product_dict = ProductResponse.from_orm(product).dict()
            product_dict['predicted_price'] = product.target_price
            product_dict['confidence'] = 0.85
            products_with_predictions.append(ProductResponse(**product_dict))
    
    return products_with_predictions

# =================================
# REVIEW ENDPOINTS
# =================================

@app.post("/reviews", response_model=ReviewResponse)
async def create_review(
    review: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a product review"""
    # Check if product exists
    product = db.query(Product).filter(Product.product_id == review.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if user already reviewed this product
    existing_review = db.query(Review).filter(
        and_(Review.user_id == current_user.id, Review.product_id == review.product_id)
    ).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")
    
    db_review = Review(
        user_id=current_user.id,
        product_id=review.product_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@app.get("/products/{product_id}/reviews", response_model=List[ReviewResponse])
async def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    """Get reviews for a product"""
    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(desc(Review.created_at)).all()
    return reviews

# =================================
# ADMIN DASHBOARD ENDPOINTS
# =================================

@app.get("/admin/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics (admin only)"""
    total_users = db.query(User).count()
    total_products = db.query(Product).filter(Product.is_active == True).count()
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
    
    # Recent orders
    recent_orders = db.query(Order).order_by(desc(Order.created_at)).limit(5).all()
    
    # Top products by sales
    top_products = db.query(Product).filter(Product.is_active == True).order_by(desc(Product.sales_last_30_days)).limit(5).all()
    
    return DashboardStats(
        total_users=total_users,
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=total_revenue,
        recent_orders=recent_orders,
        top_products=top_products
    )

@app.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    users = db.query(User).all()
    return users

@app.get("/admin/orders", response_model=List[OrderResponse])
async def get_all_orders(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all orders (admin only)"""
    orders = db.query(Order).order_by(desc(Order.created_at)).all()
    return orders

# =================================
# ML MODEL ENDPOINTS (keeping existing functionality)
# =================================

def predict_product_price(product):
    """Helper function to predict product price"""
    global model, label_encoders
    
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Encode categorical features
        category_encoded = label_encoders['category'].transform([product.category])[0]
        season_encoded = label_encoders['season'].transform([product.season])[0]
        brand_tier_encoded = label_encoders['brand_tier'].transform([product.brand_tier])[0]
        
        # Prepare feature vector
        feature_vector = np.array([[
            product.base_price,
            product.inventory_level,
            product.competitor_avg_price,
            product.sales_last_30_days,
            product.rating,
            product.review_count,
            product.material_cost,
            category_encoded,
            season_encoded,
            brand_tier_encoded
        ]])
        
        # Make prediction
        predicted_price = model.predict(feature_vector)[0]
        
        # Calculate confidence score based on model performance
        confidence_score = min(0.95, max(0.6, model_metrics.get('r2_score', 0.8)))
        
        return {
            'predicted_price': round(float(predicted_price), 2),
            'confidence': round(float(confidence_score), 3)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@app.post("/predict", response_model=PredictionResponse)
async def predict_price(product: ProductInput):
    """Predict price for given product features"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Encode categorical features
        category_encoded = label_encoders['category'].transform([product.category])[0]
        season_encoded = label_encoders['season'].transform([product.season])[0]
        brand_tier_encoded = label_encoders['brand_tier'].transform([product.brand_tier])[0]
        
        # Prepare feature vector
        feature_vector = np.array([[
            product.base_price,
            product.inventory_level,
            product.competitor_avg_price,
            product.sales_last_30_days,
            product.rating,
            product.review_count,
            product.material_cost,
            category_encoded,
            season_encoded,
            brand_tier_encoded
        ]])
        
        # Make prediction
        predicted_price = model.predict(feature_vector)[0]
        
        # Calculate price change percentage
        price_change = ((predicted_price - product.base_price) / product.base_price) * 100
        
        # Generate recommendation
        if price_change > 5:
            recommendation = "Price increase recommended due to market conditions"
        elif price_change < -5:
            recommendation = "Price reduction suggested to boost sales"
        else:
            recommendation = "Current pricing is optimal"
        
        # Calculate confidence score based on model performance
        confidence_score = min(0.95, max(0.6, model_metrics.get('r2_score', 0.8)))
        
        return PredictionResponse(
            predicted_price=round(float(predicted_price), 2),
            confidence_score=round(float(confidence_score), 3),
            price_change_percentage=round(float(price_change), 2),
            recommendation=recommendation
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@app.get("/metrics", response_model=ModelMetrics)
async def get_model_metrics():
    """Get current model performance metrics"""
    if not model_metrics:
        raise HTTPException(status_code=404, detail="No model metrics available")
    return ModelMetrics(**model_metrics)

@app.post("/train")
async def retrain_model(current_user: User = Depends(get_admin_user)):
    """Retrain the model (admin only)"""
    try:
        # Load products from database and convert to CSV format for training
        db = next(get_db())
        products = db.query(Product).filter(Product.is_active == True).all()
        
        # Convert to pandas DataFrame
        data = []
        for product in products:
            data.append({
                'product_name': product.product_name,
                'category': product.category,
                'base_price': product.base_price,
                'inventory_level': product.inventory_level,
                'competitor_avg_price': product.competitor_avg_price,
                'sales_last_30_days': product.sales_last_30_days,
                'rating': product.rating,
                'review_count': product.review_count,
                'season': product.season,
                'brand_tier': product.brand_tier,
                'material_cost': product.material_cost,
                'target_price': product.target_price
            })
        
        df = pd.DataFrame(data)
        if len(df) > 0:
            df.to_csv('dataset.csv', index=False)
        
        metrics = train_model()
        return {"message": "Model retrained successfully", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")

# ML model functions (keeping existing implementation)
def load_and_preprocess_data():
    """Load and preprocess the dataset"""
    global label_encoders, feature_columns
    
    # Load dataset
    df = pd.read_csv('dataset.csv')
    
    # Create label encoders for categorical variables
    categorical_columns = ['category', 'season', 'brand_tier']
    label_encoders = {}
    
    for col in categorical_columns:
        le = LabelEncoder()
        df[col + '_encoded'] = le.fit_transform(df[col])
        label_encoders[col] = le
    
    # Define feature columns (excluding target)
    feature_columns = [
        'base_price', 'inventory_level', 'competitor_avg_price', 
        'sales_last_30_days', 'rating', 'review_count', 'material_cost',
        'category_encoded', 'season_encoded', 'brand_tier_encoded'
    ]
    
    return df

def train_model():
    """Train the ML model"""
    global model, model_metrics
    
    # Load and preprocess data
    df = load_and_preprocess_data()
    
    # Prepare features and target
    X = df[feature_columns]
    y = df['target_price']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    # Get feature importance
    feature_importance = dict(zip(feature_columns, model.feature_importances_))
    
    model_metrics = {
        'mse': float(mse),
        'rmse': float(rmse),
        'r2_score': float(r2),
        'model_type': 'Random Forest Regressor',
        'training_samples': len(X_train),
        'feature_importance': feature_importance
    }
    
    # Save model and encoders
    joblib.dump(model, 'pricing_model.pkl')
    joblib.dump(label_encoders, 'label_encoders.pkl')
    
    print(f"Model trained successfully!")
    print(f"R² Score: {r2:.4f}")
    print(f"RMSE: ${rmse:.2f}")
    print(f"MSE: {mse:.2f}")
    
    return model_metrics

def load_model():
    """Load the trained model"""
    global model, label_encoders, model_metrics
    
    if os.path.exists('pricing_model.pkl') and os.path.exists('label_encoders.pkl'):
        model = joblib.load('pricing_model.pkl')
        label_encoders = joblib.load('label_encoders.pkl')
        
        # Load feature columns
        if os.path.exists('dataset.csv'):
            df = pd.read_csv('dataset.csv')
            feature_columns = [
                'base_price', 'inventory_level', 'competitor_avg_price', 
                'sales_last_30_days', 'rating', 'review_count', 'material_cost',
                'category_encoded', 'season_encoded', 'brand_tier_encoded'
            ]
            
            # Calculate metrics on existing data
            df = load_and_preprocess_data()
            X = df[feature_columns]
            y = df['target_price']
            y_pred = model.predict(X)
            
            mse = mean_squared_error(y, y_pred)
            rmse = np.sqrt(mse)
            r2 = r2_score(y, y_pred)
            
            model_metrics = {
                'mse': float(mse),
                'rmse': float(rmse),
                'r2_score': float(r2),
                'model_type': 'Random Forest Regressor',
                'training_samples': len(X),
                'feature_importance': dict(zip(feature_columns, model.feature_importances_))
            }
        
        return True
    return False

@app.get("/")
async def root():
    return {
        "message": "AI-Powered E-commerce Platform API is running!",
        "version": "2.0.0",
        "features": [
            "User Authentication & Authorization",
            "Product Management with AI Pricing",
            "Shopping Cart & Orders",
            "Wishlist & Reviews",
            "Admin Dashboard",
            "ML Model Management"
        ],
        "endpoints": {
            "auth": ["/auth/register", "/auth/login", "/auth/me"],
            "products": ["/products", "/products/{id}"],
            "cart": ["/cart", "/cart/{id}"],
            "orders": ["/orders", "/orders/{id}"],
            "wishlist": ["/wishlist/{product_id}"],
            "reviews": ["/reviews"],
            "admin": ["/admin/dashboard", "/admin/products"],
            "ml": ["/predict", "/metrics", "/train"]
        },
        "docs": "Visit /docs for interactive API documentation"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)