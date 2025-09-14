# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a full-stack AI-driven dynamic pricing e-commerce system that uses machine learning to predict optimal product prices in real-time. The system consists of a FastAPI backend with a Random Forest ML model and a React frontend with TypeScript.

## Development Commands

### Backend Development
```powershell
# Navigate to backend and install dependencies
cd backend
pip install -r requirements.txt

# Start development server (includes auto-reload)
python run.py

# Alternative: Direct uvicorn command
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Test single endpoint
curl http://localhost:8000/
```

### Frontend Development
```powershell
# Navigate to frontend and install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint TypeScript/React code
npm run lint

# Preview production build
npm run preview
```

### Full Stack Development
Start both servers simultaneously:
```powershell
# Terminal 1 - Backend
cd backend && python run.py

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

## Architecture

### Backend (`/backend`)
- **Framework**: FastAPI with automatic OpenAPI docs at `/docs`
- **ML Model**: Random Forest Regressor (scikit-learn) with 100 estimators, max depth 10
- **Model Persistence**: Models and encoders saved as `.pkl` files using joblib
- **Data Pipeline**: Label encoding for categorical features (category, season, brand_tier)
- **Key Files**:
  - `main.py` - FastAPI app with ML prediction endpoints
  - `run.py` - Development server launcher with helpful startup messages
  - `dataset.csv` - 65+ product training dataset with pricing features
  - `pricing_model.pkl` - Trained Random Forest model (auto-generated)
  - `label_encoders.pkl` - Categorical encoders (auto-generated)

### Frontend (`/frontend/src`)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Architecture**: Component-based with service layer
- **Key Components**:
  - `App.tsx` - Main app with tab navigation (Products/Dashboard/ML Performance)
  - `components/ProductListing.tsx` - Customer-facing product display with AI pricing
  - `components/AdminDashboard.tsx` - Model management and data upload interface
  - `components/ModelPerformance.tsx` - ML metrics visualization
  - `services/apiService.ts` - Centralized API communication layer

### ML Model Features
The Random Forest model uses 10 engineered features:
- Numerical: `base_price`, `inventory_level`, `competitor_avg_price`, `sales_last_30_days`, `rating`, `review_count`, `material_cost`
- Encoded Categorical: `category_encoded`, `season_encoded`, `brand_tier_encoded`

Target variable: `target_price` (optimal price prediction)

## API Endpoints

### Core ML Endpoints
- `POST /predict` - Price prediction for product features
- `GET /metrics` - Model performance (R², RMSE, MSE, feature importance)
- `POST /train` - Retrain model with current dataset
- `POST /upload-data` - Upload new CSV training data and auto-retrain

### Data Endpoints
- `GET /products` - Retrieve all products from dataset
- `GET /` - API status and available endpoints

## Data Schema

### Product Input Schema (for predictions)
```json
{
  "product_name": "string",
  "category": "string",
  "base_price": "float",
  "inventory_level": "integer", 
  "competitor_avg_price": "float",
  "sales_last_30_days": "integer",
  "rating": "float (1.0-5.0)",
  "review_count": "integer",
  "season": "string (Summer|Fall|Winter|Spring|All-Season)",
  "brand_tier": "string (Budget|Mid-Range|Premium|Luxury)",
  "material_cost": "float"
}
```

### Dataset CSV Schema
Must contain all prediction fields plus:
- `product_id` (integer)
- `target_price` (float) - ground truth for training

## Development Notes

### Model Training Behavior
- Model auto-trains on startup if no saved model exists
- Training uses 80/20 train/test split with `random_state=42`
- Model and encoders are automatically saved after training
- New data uploads trigger immediate model retraining

### CORS Configuration
Backend allows requests from:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`

### Error Handling
- API uses proper HTTP status codes and detailed error messages
- Frontend has centralized error handling in `apiService.ts`
- Model predictions include confidence scores based on R² performance

### Performance Benchmarks
Current model performance on included dataset:
- R² Score: ~0.87 (87% variance explained)
- RMSE: ~$2.34 (average prediction error)
- Training time: <5 seconds
- Prediction time: <100ms per product

## Testing Data

Use these sample categories for testing predictions:
- **Categories**: "T-Shirts", "Jeans", "Dresses", "Jackets", "Shoes", "Accessories", "Sweaters", "Shirts", "Activewear", "Shorts", "Pants", "Skirts"
- **Seasons**: "Summer", "Fall", "Winter", "Spring", "All-Season"  
- **Brand Tiers**: "Budget", "Mid-Range", "Premium", "Luxury"

## Common Development Tasks

### Adding New Features to ML Model
1. Update feature columns in `load_and_preprocess_data()` function
2. Ensure new features exist in dataset CSV
3. Retrain model via `/train` endpoint or restart backend
4. Update `ProductInput` schema in both backend and frontend TypeScript interfaces

### Debugging ML Issues
- Check model metrics at `http://localhost:8000/metrics`
- View feature importance to understand model behavior
- Use FastAPI docs at `http://localhost:8000/docs` for interactive API testing
- Monitor server logs for training/prediction errors

### Frontend API Integration
- All API calls go through `services/apiService.ts`
- TypeScript interfaces ensure type safety between frontend/backend
- Error handling includes user-friendly messages for API failures
- Loading states are managed per component for better UX