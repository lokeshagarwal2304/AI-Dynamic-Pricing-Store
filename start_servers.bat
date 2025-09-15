@echo off
echo ============================================================
echo 🚀 Starting AI Dynamic Pricing Platform
echo ============================================================
echo.

REM Start Backend Server
echo 🔧 Starting Backend Server (FastAPI)...
cd backend
start "Backend Server" powershell -Command "python run_server.py; Read-Host 'Backend server stopped. Press Enter to close'"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend Server
echo 🎨 Starting Frontend Server (React)...
cd ..\frontend
start "Frontend Server" powershell -Command "npm run dev; Read-Host 'Frontend server stopped. Press Enter to close'"

echo.
echo ============================================================
echo ✅ Both servers are starting up!
echo.
echo 📡 Backend API: http://localhost:8000
echo 📚 API Documentation: http://localhost:8000/docs
echo 🌐 Frontend App: http://localhost:5173
echo 🔐 Admin Login: admin / admin123
echo.
echo 💡 CSV Upload Feature:
echo    - Go to Admin Dashboard → System Tab
echo    - Upload CSV with all 13 required columns
echo    - Model will retrain automatically
echo.
echo ============================================================
echo 📝 Close this window when you're done using the application
echo ============================================================
pause