@echo off
echo 🚀 Starting AI Dynamic Pricing Backend Server...
echo ================================================

cd backend
echo 📍 Current directory: %cd%

echo 🔄 Starting FastAPI server on port 8000...
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause