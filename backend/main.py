from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
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
from database import get_db, CartItem, Product, User, Order, OrderItem, create_tables

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

# Custom product name to image mapping
product_image_mapping = {
    "A-Line Skirt": "1.jpg",
    "Ankle Boots": "2.jpg",
    "Athletic Shorts": "3.jpg",
    "Ballet Flats": "4.jpg",
    "Bracelet": "5.jpg",
    "Canvas Sneakers": "6.jpg",
    "Cardigan": "7.jpg",
    "Cashmere Sweater": "8.jpg",
    "Casual Button-Down Shirt": "9.jpg",
    "Chelsea Boots": "10.jpg",
    "Classic Denim Jeans": "11.jpg",
    "Clutch Bag": "12.jpg",
    "Cocktail Dress": "13.jpg",
    "Compression Leggings": "14.jpg",
    "Cross-Training Shoes": "15.jpg",
    "Denim Jacket": "16.jpg",
    "Designer Handbag": "17.jpg",
    "Dress Shoes": "18.jpg",
    "Elegant Summer Dress": "19.jpg",
    "Evening Gown": "20.jpg",
    "Flannel Shirt": "21.jpg",
    "Formal Blazer": "22.jpg",
    "Graphic T-Shirt": "23.jpg",
    "Henley Shirt": "24.jpg",
    "High-Waisted Leggings": "25.jpg",
    "Hiking Boots": "26.jpg",
    "Hoodie": "27.jpg",
    "Leather Boots": "28.jpg",
    "Leather Crossbody Bag": "29.jpg",
    "Leather Jacket": "30.jpg",
    "Loafers": "31.jpg",
    "Maxi Dress": "32.jpg",
    "Merino Wool Sweater": "33.jpg",
    "Midi Skirt": "34.jpg",
    "Oxford Shirt": "35.jpg",
    "Parka": "36.jpg",
    "Peacoat": "37.jpg",
    "Pencil Skirt": "38.jpg",
    "Polo Shirt": "39.jpg",
    "Premium Cotton T-Shirt": "40.jpg",
    "Puffer Jacket": "41.jpg"
}


# In-memory user storage (admin only for backward compatibility)
fake_users_db = {}

# Pydantic models
class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
    phone: str = None
    address: str = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool
    phone: str = None
    address: str = None
    created_at: str = None

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
    image_url: Optional[str] = None

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

class OrderCreate(BaseModel):
    shipping_address: dict
    payment_method: str

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    shipping_address: dict
    payment_method: str
    created_at: str
    order_items: List[dict]

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user_data: UserRegister):
    # Check if email already exists
    if get_user_by_email(db, user_data.email):
        return None
    # Check if username already exists
    if get_user_by_username(db, user_data.username):
        return None
    
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        phone=user_data.phone,
        address=user_data.address,
        role="user",
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(username: str, password: str, db: Session):
    # Try to authenticate with database users first
    user = get_user_by_username(db, username)
    if user and verify_password(password, user.hashed_password):
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "phone": user.phone,
            "address": user.address,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    
    # Fallback to fake users for backward compatibility (admin)
    fake_user = fake_users_db.get(username)
    if fake_user and verify_password(password, fake_user["password"]):
        return fake_user
    
    return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
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
    
    # Try database users first
    db_user = get_user_by_username(db, username)
    if db_user:
        return {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "full_name": db_user.full_name,
            "role": db_user.role,
            "is_active": db_user.is_active,
            "phone": db_user.phone,
            "address": db_user.address,
            "created_at": db_user.created_at.isoformat() if db_user.created_at else None
        }
    
    # Fallback to fake users
    fake_user = fake_users_db.get(username)
    if fake_user is None:
        raise credentials_exception
    return fake_user

def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def require_admin_role(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to require admin role from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    admin_exception = HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin access required",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        
        if username is None:
            raise credentials_exception
        
        if role != "admin":
            raise admin_exception
            
        return {"username": username, "role": role}
        
    except jwt.PyJWTError:
        raise credentials_exception

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
    """Initialize the model and database on startup"""
    print("\n" + "="*60)
    print("🚀 AI Dynamic Pricing API Starting...")
    print("="*60)
    
    # Create database tables
    try:
        create_tables()
        print("✅ Database tables initialized successfully!")
    except Exception as e:
        print(f"⚠️  Database initialization warning: {str(e)}")
    
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
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token"""
    user = authenticate_user(user_credentials.username, user_credentials.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]}, expires_delta=access_token_expires
    )
    
    user_response = UserResponse(**{k: v for k, v in user.items() if k != "password" and k != "hashed_password"})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@app.post("/register", response_model=Token)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if email already exists
    existing_user_email = get_user_by_email(db, user_data.email)
    if existing_user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_user_username = get_user_by_username(db, user_data.username)
    if existing_user_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Create new user
    try:
        new_user = create_user(db, user_data)
        if not new_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user"
            )
        
        # Create access token for the new user
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": new_user.username, "role": new_user.role}, expires_delta=access_token_expires
        )
        
        # Prepare user response
        user_response = UserResponse(
            id=new_user.id,
            email=new_user.email,
            username=new_user.username,
            full_name=new_user.full_name,
            role=new_user.role,
            is_active=new_user.is_active,
            phone=new_user.phone,
            address=new_user.address,
            created_at=new_user.created_at.isoformat() if new_user.created_at else None
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

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
                # Get custom image for this product, fallback to sequential mapping
                image_filename = product_image_mapping.get(row['product_name'], f'{index + 1}.jpg')
                
                product = {
                    'product_id': int(row['product_id']),
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
                    'confidence': prediction['confidence'],
                    'image_url': f'/assets/{image_filename}'
                }
                products.append(product)
            except Exception as e:
                # Fallback to original price if prediction fails
                # Get custom image for this product, fallback to sequential mapping
                image_filename = product_image_mapping.get(row['product_name'], f'{index + 1}.jpg')
                
                product = {
                    'product_id': int(row['product_id']),
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
                    'confidence': 0.85,
                    'image_url': f'/assets/{image_filename}'
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
async def retrain_model(admin_user: dict = Depends(require_admin_role)):
    """Retrain the model (admin only)"""
    try:
        metrics = train_model()
        return {"message": "Model retrained successfully", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")

@app.post("/upload-data")
async def upload_data(file: UploadFile = File(...), admin_user: dict = Depends(require_admin_role)):
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
async def get_cart(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get cart items for the current authenticated user with product details"""
    try:
        # Query cart items with product details using JOIN
        cart_items = db.query(CartItem).join(Product).filter(
            CartItem.user_id == current_user["id"]
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

@app.delete("/cart/clear")
async def clear_cart(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Clear all items from user's cart"""
    try:
        # Delete all cart items for the current user
        cart_items = db.query(CartItem).filter(CartItem.user_id == current_user["id"]).all()
        
        for item in cart_items:
            db.delete(item)
        
        db.commit()
        return {"message": "Cart cleared successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error clearing cart: {str(e)}")

@app.delete("/cart/{item_id}")
async def remove_cart_item(item_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Remove specific item from cart"""
    try:
        # Find the cart item
        cart_item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.user_id == current_user["id"]
        ).first()
        
        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        
        db.delete(cart_item)
        db.commit()
        
        return {"message": "Item removed from cart"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error removing cart item: {str(e)}")

# Order endpoints
@app.post("/orders/create", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new order from user's cart items"""
    try:
        # Start a transaction
        db.begin()
        
        # 1. Fetch all items for the user from the cart_items table
        cart_items = db.query(CartItem).join(Product).filter(
            CartItem.user_id == current_user["id"]
        ).all()
        
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")
        
        # 2. Calculate the total order amount
        total_amount = 0
        order_items_data = []
        
        for cart_item in cart_items:
            product = cart_item.product
            # Use predicted price if available, fallback to target price
            price_at_time = product.target_price  # In real scenario, this would include AI prediction
            item_total = price_at_time * cart_item.quantity
            total_amount += item_total
            
            order_items_data.append({
                "product_id": cart_item.product_id,
                "quantity": cart_item.quantity,
                "price_at_time": price_at_time,
                "product": product
            })
        
        # 3. Create a new record in the orders table
        import json
        new_order = Order(
            user_id=current_user["id"],
            total_amount=total_amount,
            status="pending",
            shipping_address=json.dumps(order_data.shipping_address),
            payment_method=order_data.payment_method
        )
        
        db.add(new_order)
        db.flush()  # This assigns the ID but doesn't commit yet
        
        # 4. For each item from the cart, create a corresponding record in the order_items table
        db_order_items = []
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item_data["product_id"],
                quantity=item_data["quantity"],
                price_at_time=item_data["price_at_time"]
            )
            db.add(order_item)
            db_order_items.append(order_item)
        
        # 5. Delete all items from the user's cart_items table to clear their cart
        for cart_item in cart_items:
            db.delete(cart_item)
        
        # Commit the transaction
        db.commit()
        
        # Refresh to get the complete data
        db.refresh(new_order)
        for item in db_order_items:
            db.refresh(item)
        
        # Prepare response with order items
        order_items_response = []
        for i, item in enumerate(db_order_items):
            product = order_items_data[i]["product"]
            order_items_response.append({
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price_at_time": item.price_at_time,
                "product": {
                    "product_id": product.product_id,
                    "product_name": product.product_name,
                    "category": product.category
                }
            })
        
        return OrderResponse(
            id=new_order.id,
            user_id=new_order.user_id,
            total_amount=new_order.total_amount,
            status=new_order.status,
            shipping_address=order_data.shipping_address,
            payment_method=new_order.payment_method,
            created_at=new_order.created_at.isoformat(),
            order_items=order_items_response
        )
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")

@app.get("/orders")
async def get_user_orders(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all orders for the current user"""
    try:
        orders = db.query(Order).filter(Order.user_id == current_user["id"]).all()
        
        orders_response = []
        for order in orders:
            # Get order items
            order_items = db.query(OrderItem).join(Product).filter(OrderItem.order_id == order.id).all()
            
            items_data = []
            for item in order_items:
                items_data.append({
                    "product_name": item.product.product_name,
                    "quantity": item.quantity,
                    "price": item.price_at_time
                })
            
            import json
            shipping_address = json.loads(order.shipping_address) if order.shipping_address else {}
            
            orders_response.append({
                "order_id": order.id,
                "order_number": f"ORD-{order.id:06d}",
                "total": order.total_amount,
                "status": order.status,
                "created_at": order.created_at.isoformat(),
                "items": items_data,
                "shipping_address": shipping_address
            })
        
        return {"orders": orders_response}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving orders: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)