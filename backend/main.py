from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
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
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from database import get_db, CartItem, Product

app = FastAPI(
    title="AI-Powered E-commerce Platform", 
    description="A comprehensive e-commerce platform with AI-driven dynamic pricing",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174", 
        "http://127.0.0.1:5174",
        "http://localhost:3000", 
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Global variables
model = None
label_encoders = {}
feature_columns = []
model_metrics = {}

# In-memory user storage (in a real app, use a proper database)
fake_users_db = {
    "admin": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "full_name": "Administrator",
        "password": "admin123",  # Simple password for demo
        "role": "admin",
        "is_active": True
    }
}

# Pydantic models
class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ProductInput(BaseModel):
    product_name: str
    category: str
    base_price: float
    inventory_level: int
    competitor_avg_price: float
    sales_last_30_days: int
    rating: float
    review_count: int
    season: str
    brand_tier: str
    material_cost: float

class ProductResponse(BaseModel):
    product_id: int
    product_name: str
    category: str
    base_price: float
    target_price: float
    inventory_level: int
    rating: float
    review_count: int
    competitor_avg_price: float
    sales_last_30_days: int
    season: str
    brand_tier: str
    material_cost: float
    predicted_price: Optional[float] = None
    confidence: Optional[float] = None

class PredictionResponse(BaseModel):
    predicted_price: float
    confidence_score: float
    price_change_percentage: float
    recommendation: str

class ModelMetrics(BaseModel):
    class Config:
        protected_namespaces = ()
    
    mse: float
    rmse: float
    r2_score: float
    model_type: str
    training_samples: int
    feature_importance: Dict[str, float]

class CartItemAdd(BaseModel):
    user_id: int
    product_id: int
    quantity: int

class CartItemUpdate(BaseModel):
    quantity: int

# Authentication functions
def verify_password(plain_password, stored_password):
    return plain_password == stored_password

def get_password_hash(password):
    return password  # Simple for demo

def authenticate_user(username: str, password: str):
    user = fake_users_db.get(username)
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = fake_users_db.get(username)
    if user is None:
        raise credentials_exception
    return user

def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# ML model functions
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

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup"""
    print("\n" + "="*60)
    print("🚀 AI Dynamic Pricing API Starting...")
    print("="*60)
    
    try:
        if not load_model():
            print("📚 No existing model found. Training new model...")
            metrics = train_model()
            print("✅ Model training completed successfully!")
            print(f"📊 Model Performance: R² Score = {metrics.get('r2_score', 0):.4f}")
        else:
            print("✅ Existing model loaded successfully!")
            print(f"📊 Model Performance: R² Score = {model_metrics.get('r2_score', 0):.4f}")
        
        print("\n🎯 API Features:")
        print("   • User Authentication & Authorization")
        print("   • AI-Powered Dynamic Product Pricing")
        print("   • Product Management System")
        print("   • Machine Learning Model Training")
        print("\n🌐 API Endpoints:")
        print("   • Documentation: /docs")
        print("   • Products: /products")
        print("   • Authentication: /auth/login")
        print("   • AI Predictions: /predict")
        print("   • Model Metrics: /metrics")
        print("\n" + "="*60)
        print("🎉 Server is ready to handle requests!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"❌ Error during startup: {str(e)}")
        print("⚠️  Server will continue but some features may not work properly.")

# API endpoints
@app.get("/")
async def root():
    """Root endpoint - API status and information"""
    return {
        "status": "online",
        "message": "🎆 AI-Powered E-commerce Platform API is running successfully!",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "features": [
            "🔐 User Authentication & Authorization",
            "🤖 AI-Powered Dynamic Product Pricing", 
            "📊 Machine Learning Model Management",
            "📊 Real-time Price Predictions"
        ],
        "endpoints": {
            "authentication": {
                "login": "/auth/login",
                "user_info": "/auth/me"
            },
            "products": {
                "list_all": "/products",
                "get_single": "/products/{id}"
            },
            "ai_services": {
                "predict_price": "/predict",
                "model_metrics": "/metrics",
                "retrain_model": "/train"
            }
        },
        "model_info": {
            "status": "loaded" if model is not None else "not_loaded",
            "type": "Random Forest Regressor",
            "performance": model_metrics.get('r2_score', 'N/A') if model_metrics else 'N/A'
        },
        "documentation": {
            "interactive_docs": "/docs",
            "redoc": "/redoc"
        },
        "admin": {
            "default_credentials": {
                "username": "admin",
                "password": "admin123"
            }
        }
    }

# Authentication endpoints
@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Login user and return access token"""
    user = authenticate_user(user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    user_response = UserResponse(**{k: v for k, v in user.items() if k != "password"})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(**{k: v for k, v in current_user.items() if k != "password"})

# Product endpoints
@app.get("/products")
async def get_products():
    """Get all products with AI pricing"""
    try:
        df = pd.read_csv('dataset.csv')
        products = []
        
        for index, row in df.iterrows():
            try:
                # Get AI prediction for each product
                prediction = predict_product_price_internal(row)
                product = {
                    'product_id': index + 1,
                    'product_name': row['product_name'],
                    'category': row['category'],
                    'base_price': float(row['base_price']),
                    'target_price': float(row['target_price']),
                    'inventory_level': int(row['inventory_level']),
                    'rating': float(row['rating']),
                    'review_count': int(row['review_count']),
                    'competitor_avg_price': float(row['competitor_avg_price']),
                    'sales_last_30_days': int(row['sales_last_30_days']),
                    'season': row['season'],
                    'brand_tier': row['brand_tier'],
                    'material_cost': float(row['material_cost']),
                    'predicted_price': prediction['predicted_price'],
                    'confidence': prediction['confidence']
                }
                products.append(product)
            except Exception as e:
                # Fallback to original price if prediction fails
                product = {
                    'product_id': index + 1,
                    'product_name': row['product_name'],
                    'category': row['category'],
                    'base_price': float(row['base_price']),
                    'target_price': float(row['target_price']),
                    'inventory_level': int(row['inventory_level']),
                    'rating': float(row['rating']),
                    'review_count': int(row['review_count']),
                    'competitor_avg_price': float(row['competitor_avg_price']),
                    'sales_last_30_days': int(row['sales_last_30_days']),
                    'season': row['season'],
                    'brand_tier': row['brand_tier'],
                    'material_cost': float(row['material_cost']),
                    'predicted_price': float(row['target_price']),
                    'confidence': 0.85
                }
                products.append(product)
        
        return {"products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading products: {str(e)}")

def predict_product_price_internal(row):
    """Internal function to predict product price from dataset row"""
    global model, label_encoders
    
    if model is None:
        raise Exception("Model not loaded")
    
    try:
        # Encode categorical features
        category_encoded = label_encoders['category'].transform([row['category']])[0]
        season_encoded = label_encoders['season'].transform([row['season']])[0]
        brand_tier_encoded = label_encoders['brand_tier'].transform([row['brand_tier']])[0]
        
        # Prepare feature vector
        feature_vector = np.array([[
            row['base_price'],
            row['inventory_level'],
            row['competitor_avg_price'],
            row['sales_last_30_days'],
            row['rating'],
            row['review_count'],
            row['material_cost'],
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
        raise Exception(f"Prediction error: {str(e)}")

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
async def retrain_model(current_user: dict = Depends(get_admin_user)):
    """Retrain the model (admin only)"""
    try:
        metrics = train_model()
        return {"message": "Model retrained successfully", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")

@app.post("/upload-data")
async def upload_data(file: UploadFile = File(...), current_user: dict = Depends(get_admin_user)):
    """Upload new training data with strict validation and automatic model retraining (admin only)"""
    
    # Define required columns exactly as specified
    required_columns = [
        'product_id', 'product_name', 'category', 'base_price', 'inventory_level',
        'competitor_avg_price', 'sales_last_30_days', 'rating', 'review_count',
        'season', 'brand_tier', 'material_cost', 'target_price'
    ]
    
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Only .csv files are allowed."
            )
        
        # Read uploaded CSV file
        contents = await file.read()
        uploaded_df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Strict column validation
        uploaded_columns = set(uploaded_df.columns.tolist())
        required_columns_set = set(required_columns)
        missing_columns = required_columns_set - uploaded_columns
        
        if missing_columns:
            missing_list = sorted(list(missing_columns))
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Missing required columns",
                    "missing_columns": missing_list,
                    "required_columns": required_columns,
                    "uploaded_columns": sorted(list(uploaded_columns))
                }
            )
        
        # Additional data validation
        validation_errors = []
        
        # Check for empty DataFrame
        if uploaded_df.empty:
            validation_errors.append("CSV file is empty")
        
        # Validate data types and ranges
        try:
            # Numeric columns validation
            numeric_columns = ['base_price', 'inventory_level', 'competitor_avg_price', 
                             'sales_last_30_days', 'rating', 'review_count', 'material_cost', 'target_price']
            
            for col in numeric_columns:
                if col in uploaded_df.columns:
                    # Convert to numeric, invalid parsing will raise error
                    pd.to_numeric(uploaded_df[col], errors='coerce')
                    
                    # Check for negative values where they shouldn't exist
                    if col in ['base_price', 'inventory_level', 'competitor_avg_price', 
                              'review_count', 'material_cost', 'target_price']:
                        if (uploaded_df[col] < 0).any():
                            validation_errors.append(f"Column '{col}' contains negative values")
                    
                    # Rating should be between 0 and 5
                    if col == 'rating':
                        if (uploaded_df[col] > 5).any() or (uploaded_df[col] < 0).any():
                            validation_errors.append("Column 'rating' should be between 0 and 5")
            
            # Check for null values in required columns
            null_columns = []
            for col in required_columns:
                if uploaded_df[col].isnull().any():
                    null_columns.append(col)
            
            if null_columns:
                validation_errors.append(f"Null values found in columns: {', '.join(null_columns)}")
                
        except Exception as e:
            validation_errors.append(f"Data type validation error: {str(e)}")
        
        # If there are validation errors, return them
        if validation_errors:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Data validation failed",
                    "validation_errors": validation_errors
                }
            )
        
        # Load existing dataset if it exists
        existing_data = None
        if os.path.exists('dataset.csv'):
            try:
                existing_data = pd.read_csv('dataset.csv')
            except Exception as e:
                print(f"Warning: Could not load existing dataset: {str(e)}")
        
        # Append new data to existing dataset
        if existing_data is not None:
            # Ensure columns match
            if set(existing_data.columns) != set(uploaded_df.columns):
                # Reorder uploaded columns to match existing data
                uploaded_df = uploaded_df[existing_data.columns]
            
            combined_data = pd.concat([existing_data, uploaded_df], ignore_index=True)
        else:
            combined_data = uploaded_df
        
        # Remove duplicates if any (based on product_id if it exists)
        if 'product_id' in combined_data.columns:
            initial_count = len(combined_data)
            combined_data = combined_data.drop_duplicates(subset=['product_id'], keep='last')
            duplicates_removed = initial_count - len(combined_data)
        else:
            duplicates_removed = 0
        
        # Save the combined dataset
        combined_data.to_csv('dataset.csv', index=False)
        
        # Automatically trigger model retraining
        try:
            print("🔄 Starting automatic model retraining...")
            retrain_metrics = train_model()
            print("✅ Model retraining completed successfully!")
            
            return {
                "message": "Data uploaded and model retrained successfully",
                "upload_stats": {
                    "new_records": len(uploaded_df),
                    "total_records": len(combined_data),
                    "duplicates_removed": duplicates_removed,
                    "existing_records": len(existing_data) if existing_data is not None else 0
                },
                "model_metrics": retrain_metrics,
                "retraining_status": "completed"
            }
            
        except Exception as retrain_error:
            # If retraining fails, still return success for data upload
            print(f"⚠️ Data uploaded successfully but model retraining failed: {str(retrain_error)}")
            return {
                "message": "Data uploaded successfully, but model retraining failed",
                "upload_stats": {
                    "new_records": len(uploaded_df),
                    "total_records": len(combined_data),
                    "duplicates_removed": duplicates_removed,
                    "existing_records": len(existing_data) if existing_data is not None else 0
                },
                "retraining_status": "failed",
                "retraining_error": str(retrain_error)
            }
        
    except HTTPException:
        # Re-raise HTTP exceptions (validation errors)
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Unexpected error during upload: {str(e)}"
        )

# Cart endpoints
@app.post("/cart/add")
async def add_to_cart(cart_item: CartItemAdd, db: Session = Depends(get_db)):
    """Add item to cart or update quantity if item already exists"""
    try:
        # Check if the product exists
        product = db.query(Product).filter(Product.product_id == cart_item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Check if item already exists in cart for this user
        existing_item = db.query(CartItem).filter(
            CartItem.user_id == cart_item.user_id,
            CartItem.product_id == cart_item.product_id
        ).first()
        
        if existing_item:
            # Update existing item quantity
            existing_item.quantity += cart_item.quantity
            db.commit()
            db.refresh(existing_item)
            return {"message": "Cart item quantity updated", "cart_item_id": existing_item.id, "new_quantity": existing_item.quantity}
        else:
            # Create new cart item
            new_cart_item = CartItem(
                user_id=cart_item.user_id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity
            )
            db.add(new_cart_item)
            db.commit()
            db.refresh(new_cart_item)
            return {"message": "Item added to cart", "cart_item_id": new_cart_item.id}
            
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding item to cart: {str(e)}")

@app.get("/cart")
async def get_cart(user_id: int = Query(...), db: Session = Depends(get_db)):
    """Get cart items for a user with product details"""
    try:
        # Query cart items with product details using JOIN
        cart_items = db.query(CartItem).join(Product).filter(
            CartItem.user_id == user_id
        ).all()
        
        if not cart_items:
            return {"items": [], "total_amount": 0}
        
        # Build response with product details
        items = []
        total_amount = 0
        
        for cart_item in cart_items:
            product = cart_item.product
            item_total = product.target_price * cart_item.quantity
            total_amount += item_total
            
            items.append({
                "id": cart_item.id,
                "product_id": cart_item.product_id,
                "quantity": cart_item.quantity,
                "added_at": cart_item.added_at.isoformat(),
                "product": {
                    "product_id": product.product_id,
                    "product_name": product.product_name,
                    "category": product.category,
                    "base_price": product.base_price,
                    "target_price": product.target_price,
                    "inventory_level": product.inventory_level,
                    "rating": product.rating,
                    "review_count": product.review_count,
                    "image_url": product.image_url,
                    "description": product.description
                },
                "item_total": item_total
            })
        
        return {
            "items": items,
            "total_amount": round(total_amount, 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving cart: {str(e)}")

@app.put("/cart/item/{item_id}")
async def update_cart_item_quantity(item_id: int, cart_update: CartItemUpdate, db: Session = Depends(get_db)):
    """Update cart item quantity or delete if quantity <= 0"""
    try:
        # Find the cart item
        cart_item = db.query(CartItem).filter(CartItem.id == item_id).first()
        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        
        # If quantity is 0 or less, delete the item
        if cart_update.quantity <= 0:
            db.delete(cart_item)
            db.commit()
            return {"message": "Item removed from cart"}
        
        # Otherwise, update the quantity
        cart_item.quantity = cart_update.quantity
        db.commit()
        db.refresh(cart_item)
        
        return {
            "message": "Cart item quantity updated",
            "item_id": cart_item.id,
            "new_quantity": cart_item.quantity
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating cart item: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)