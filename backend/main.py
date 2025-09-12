from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import json
import os
from typing import Dict, Any, List
import uvicorn

app = FastAPI(title="AI Dynamic Pricing API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and encoders
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
    try:
        df = pd.read_csv('dataset.csv')
        print(f"Loaded dataset with {len(df)} rows")
        
        # Handle categorical variables
        categorical_columns = ['category', 'season', 'brand_tier']
        
        for col in categorical_columns:
            if col not in label_encoders:
                label_encoders[col] = LabelEncoder()
                df[col + '_encoded'] = label_encoders[col].fit_transform(df[col])
            else:
                df[col + '_encoded'] = label_encoders[col].transform(df[col])
        
        # Define features
        global feature_columns
        feature_columns = [
            'base_price', 'inventory_level', 'competitor_avg_price', 
            'sales_last_30_days', 'rating', 'review_count', 'material_cost',
            'category_encoded', 'season_encoded', 'brand_tier_encoded'
        ]
        
        X = df[feature_columns]
        y = df['target_price']
        
        return X, y, df
    except Exception as e:
        print(f"Error loading data: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading dataset: {str(e)}")

def train_model():
    """Train the ML model"""
    global model, model_metrics
    
    try:
        X, y, df = load_and_preprocess_data()
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train Random Forest model
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X_train, y_train)
        
        # Make predictions
        y_pred = model.predict(X_test)
        
        # Calculate metrics
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)
        
        # Feature importance
        feature_importance = dict(zip(feature_columns, model.feature_importances_))
        
        model_metrics = {
            'mse': float(mse),
            'rmse': float(rmse),
            'r2_score': float(r2),
            'model_type': 'Random Forest Regressor',
            'training_samples': len(X_train),
            'feature_importance': {k: float(v) for k, v in feature_importance.items()}
        }
        
        # Save the model
        joblib.dump(model, 'pricing_model.pkl')
        joblib.dump(label_encoders, 'label_encoders.pkl')
        
        print(f"Model trained successfully!")
        print(f"MSE: {mse:.4f}")
        print(f"RMSE: {rmse:.4f}")
        print(f"R² Score: {r2:.4f}")
        
        return model_metrics
        
    except Exception as e:
        print(f"Error training model: {e}")
        raise HTTPException(status_code=500, detail=f"Error training model: {str(e)}")

def load_model():
    """Load the trained model"""
    global model, label_encoders
    
    try:
        if os.path.exists('pricing_model.pkl'):
            model = joblib.load('pricing_model.pkl')
            label_encoders = joblib.load('label_encoders.pkl')
            print("Model loaded successfully!")
        else:
            print("No saved model found, training new model...")
            train_model()
    except Exception as e:
        print(f"Error loading model: {e}")
        train_model()

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup"""
    load_model()

@app.get("/")
async def root():
    return {"message": "AI Dynamic Pricing API", "status": "running"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_price(product: ProductInput):
    """Predict optimal price for a product"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Prepare input data
        input_data = {
            'base_price': product.base_price,
            'inventory_level': product.inventory_level,
            'competitor_avg_price': product.competitor_avg_price,
            'sales_last_30_days': product.sales_last_30_days,
            'rating': product.rating,
            'review_count': product.review_count,
            'material_cost': product.material_cost,
        }
        
        # Encode categorical variables
        for col in ['category', 'season', 'brand_tier']:
            value = getattr(product, col)
            if col in label_encoders:
                try:
                    encoded_value = label_encoders[col].transform([value])[0]
                except ValueError:
                    # Handle unseen categories
                    encoded_value = 0
            else:
                encoded_value = 0
            input_data[f'{col}_encoded'] = encoded_value
        
        # Create DataFrame with correct column order
        input_df = pd.DataFrame([input_data])[feature_columns]
        
        # Make prediction
        predicted_price = model.predict(input_df)[0]
        
        # Calculate confidence score (based on feature importance and data quality)
        confidence_score = min(0.95, max(0.65, 
            0.8 + (product.review_count / 1000) * 0.1 + 
            (min(product.rating, 5.0) / 5.0) * 0.05
        ))
        
        # Calculate price change percentage
        price_change_percentage = ((predicted_price - product.base_price) / product.base_price) * 100
        
        # Generate recommendation
        if price_change_percentage > 5:
            recommendation = "Increase price - high demand and favorable market conditions"
        elif price_change_percentage < -5:
            recommendation = "Decrease price - stimulate demand and clear inventory"
        else:
            recommendation = "Maintain current pricing - optimal market position"
        
        return PredictionResponse(
            predicted_price=round(float(predicted_price), 2),
            confidence_score=round(confidence_score, 3),
            price_change_percentage=round(price_change_percentage, 2),
            recommendation=recommendation
        )
        
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/train")
async def retrain_model():
    """Retrain the model with current data"""
    try:
        metrics = train_model()
        return {
            "message": "Model retrained successfully",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")

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

@app.post("/upload-data")
async def upload_data(file: UploadFile = File(...)):
    """Upload new training data"""
    try:
        contents = await file.read()
        
        # Save uploaded file
        with open("dataset.csv", "wb") as f:
            f.write(contents)
        
        # Retrain model with new data
        metrics = train_model()
        
        return {
            "message": "Data uploaded and model retrained successfully",
            "filename": file.filename,
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)