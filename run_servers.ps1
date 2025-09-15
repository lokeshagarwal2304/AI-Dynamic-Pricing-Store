# AI Dynamic Pricing System - Server Startup Script
Write-Host "Starting AI Dynamic Pricing System..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Yellow

# Start backend server in a new PowerShell window
Write-Host "Starting Backend Server (Port 8000)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server in a new PowerShell window
Write-Host "Starting Frontend Server (Port 5173)..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npm run dev"

# Wait for servers to initialize
Write-Host "Waiting for servers to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Display status
Write-Host ""
Write-Host "Both servers are starting up!" -ForegroundColor Green
Write-Host "Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Admin Credentials:" -ForegroundColor Cyan
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to open the frontend in your browser..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open the frontend in default browser
Start-Process "http://localhost:5173"

Write-Host "System is running! Check the browser window." -ForegroundColor Green