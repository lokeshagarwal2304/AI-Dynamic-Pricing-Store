# AI Dynamic Pricing System - Server Startup Script
Write-Host "🚀 Starting AI Dynamic Pricing System..." -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Yellow

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Check if ports are available
Write-Host "🔍 Checking port availability..." -ForegroundColor Cyan
if (Test-Port 8000) {
    Write-Host "❌ Port 8000 is already in use. Please stop any existing backend server." -ForegroundColor Red
    Read-Host "Press Enter to continue anyway or Ctrl+C to exit"
}

if (Test-Port 5173) {
    Write-Host "❌ Port 5173 is already in use. Please stop any existing frontend server." -ForegroundColor Red
    Read-Host "Press Enter to continue anyway or Ctrl+C to exit"
}

# Start backend server in a new PowerShell window
Write-Host "🔧 Starting Backend Server (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '🚀 Backend Server Starting...' -ForegroundColor Green; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server in a new PowerShell window
Write-Host "🎨 Starting Frontend Server (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '🎨 Frontend Server Starting...' -ForegroundColor Green; npm run dev"

# Wait for servers to initialize
Write-Host "⏳ Waiting for servers to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Display status
Write-Host ""
Write-Host "✅ Both servers are starting up!" -ForegroundColor Green
Write-Host "📍 Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "📍 Frontend App: http://localhost:5173" -ForegroundColor White
Write-Host "📍 API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Admin Credentials:" -ForegroundColor Cyan
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "📋 Instructions:" -ForegroundColor Yellow
Write-Host "1. Wait for both servers to fully start" -ForegroundColor White
Write-Host "2. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "3. Use the admin credentials to log in" -ForegroundColor White
Write-Host "4. Both servers will run in separate windows" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to open the frontend in your browser..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open the frontend in default browser
Start-Process "http://localhost:5173"

Write-Host "🎉 System is running! Check the browser window that just opened." -ForegroundColor Green