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

class ProductFeatures(BaseModel):
    category: str
    brand: str
    inventory_level: int
    competitor_price: float
    sales_velocity: float
    seasonality_factor: float

class PredictionResponse(BaseModel):
    predicted_price: float
    confidence_score: float
    feature_importance: Dict[str, float]

def load_dataset():
    """Load and return the dataset"""
    data = {
        'product_id': range(1, 66),
        'category': ['Electronics', 'Clothing', 'Home', 'Sports', 'Books'] * 13,
        'brand': ['BrandA', 'BrandB', 'BrandC', 'BrandD', 'BrandE'] * 13,
        'inventory_level': np.random.randint(10, 500, 65),
        'competitor_price': np.random.uniform(20, 200, 65),
        'sales_velocity': np.random.uniform(0.1, 10.0, 65),
        'seasonality_factor': np.random.uniform(0.8, 1.5, 65),
        'base_price': np.random.uniform(25, 180, 65)
    }
    
    df = pd.DataFrame(data)
    # Create realistic price based on features
    df['price'] = (df['base_price'] * df['seasonality_factor'] + 
                   df['competitor_price'] * 0.3 + 
                   df['sales_velocity'] * 2 - 
                   df['inventory_level'] * 0.05 + 
                   np.random.normal(0, 5, 65))
    
    return df

def preprocess_data(df):
    """Preprocess the data for training"""
    global label_encoders, feature_columns
    
    # Create a copy to avoid modifying original
    df_processed = df.copy()
    
    # Encode categorical variables
    categorical_columns = ['category', 'brand']
    label_encoders = {}
    
    for col in categorical_columns:
        le = LabelEncoder()
        df_processed[col + '_encoded'] = le.fit_transform(df_processed[col])
        label_encoders[col] = le
    
    # Define feature columns
    feature_columns = ['category_encoded', 'brand_encoded', 'inventory_level', 
                      'competitor_price', 'sales_velocity', 'seasonality_factor']
    
    return df_processed

def train_model():
    """Train the ML model"""
    global model, model_metrics
    
    # Load and preprocess data
    df = load_dataset()
    df_processed = preprocess_data(df)
    
    # Prepare features and target
    X = df_processed[feature_columns]
    y = df_processed['price']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    model_metrics = {
        'mse': float(mse),
        'rmse': float(rmse),
        'r2_score': float(r2),
        'feature_importance': dict(zip(feature_columns, model.feature_importances_.tolist()))
    }
    
    # Save model
    joblib.dump(model, 'model.pkl')
    joblib.dump(label_encoders, 'label_encoders.pkl')
    
    return model_metrics

def load_model():
    """Load the trained model"""
    global model, label_encoders
    
    if os.path.exists('model.pkl') and os.path.exists('label_encoders.pkl'):
        model = joblib.load('model.pkl')
        label_encoders = joblib.load('label_encoders.pkl')
        return True
    return False

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup"""
    if not load_model():
        print("Training new model...")
        train_model()
        print("Model trained successfully!")

@app.get("/")
async def root():
    return {"message": "AI Dynamic Pricing API is running!"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_price(features: ProductFeatures):
    """Predict price for given product features"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Encode categorical features
        category_encoded = label_encoders['category'].transform([features.category])[0]
        brand_encoded = label_encoders['brand'].transform([features.brand])[0]
        
        # Prepare feature vector
        feature_vector = np.array([[
            category_encoded,
            brand_encoded,
            features.inventory_level,
            features.competitor_price,
            features.sales_velocity,
            features.seasonality_factor
        ]])
        
        # Make prediction
        predicted_price = model.predict(feature_vector)[0]
        
        # Calculate confidence score (simplified)
        confidence_score = min(0.95, max(0.6, model_metrics.get('r2_score', 0.8)))
        
        return PredictionResponse(
            predicted_price=float(predicted_price),
            confidence_score=float(confidence_score),
            feature_importance=model_metrics.get('feature_importance', {})
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@app.post("/train")
async def retrain_model():
    """Retrain the model"""
    try:
        metrics = train_model()
        return {"message": "Model retrained successfully", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")

@app.get("/metrics")
async def get_model_metrics():
    """Get current model performance metrics"""
    if not model_metrics:
        raise HTTPException(status_code=404, detail="No model metrics available")
    return model_metrics

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
        required_columns = ['category', 'brand', 'inventory_level', 'competitor_price', 
                          'sales_velocity', 'seasonality_factor', 'price']
        
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(status_code=400, detail=f"CSV must contain columns: {required_columns}")
        
        # Save uploaded data (in production, you'd save to database)
        df.to_csv('uploaded_data.csv', index=False)
        
        return {"message": f"Data uploaded successfully. {len(df)} records processed."}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)