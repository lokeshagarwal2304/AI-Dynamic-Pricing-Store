from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
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
from typing import Dict, Any
import io

app = FastAPI(title="AI Dynamic Pricing API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
model = None
label_encoders = {}
feature_columns = []
model_metrics = {}

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

class PredictionResponse(BaseModel):
    predicted_price: float
    confidence_score: float
    price_change_percentage: float
    recommendation: str

class ModelMetrics(BaseModel):
    mse: float
    rmse: float
    r2_score: float
    model_type: str
    training_samples: int
    feature_importance: Dict[str, float]

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

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup"""
    if not load_model():
        print("Training new model...")
        train_model()
        print("Model ready!")

@app.get("/")
async def root():
    return {
        "message": "AI Dynamic Pricing API is running!",
        "endpoints": ["/predict", "/train", "/metrics", "/products", "/upload-data"],
        "docs": "Visit /docs for API documentation"
    }

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

@app.get("/products")
async def get_products():
    """Get all products from dataset"""
    try:
        df = pd.read_csv('dataset.csv')
        products = df.to_dict('records')
        return {"products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading products: {str(e)}")

@app.post("/train")
async def retrain_model():
    """Retrain the model"""
    try:
        metrics = train_model()
        return {"message": "Model retrained successfully", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")

@app.post("/upload-data")
async def upload_data(file: UploadFile = File(...)):
    """Upload new training data"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        # Read uploaded file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Validate required columns
        required_columns = [
            'product_name', 'category', 'base_price', 'inventory_level', 
            'competitor_avg_price', 'sales_last_30_days', 'rating', 
            'review_count', 'season', 'brand_tier', 'material_cost', 'target_price'
        ]
        
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(status_code=400, detail=f"CSV must contain columns: {required_columns}")
        
        # Save uploaded data
        df.to_csv('dataset.csv', index=False)
        
        # Retrain model with new data
        metrics = train_model()
        
        return {
            "message": f"Data uploaded and model retrained successfully. {len(df)} records processed.",
            "filename": file.filename,
            "metrics": metrics
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)