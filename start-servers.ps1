# AI Dynamic Pricing - Start Both Servers
Write-Host "Starting AI Dynamic Pricing Application..." -ForegroundColor Green
Write-Host ""

# Start Backend Server in new PowerShell window
Write-Host "Starting Backend Server (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\NARENDER REDDY\Desktop\AI-Driven_DynamicPricingQuoteForProducts\backend'; Write-Host 'Starting FastAPI Backend...' -ForegroundColor Green; python run.py"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server in new PowerShell window
Write-Host "Starting Frontend Server (React + Vite)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\NARENDER REDDY\Desktop\AI-Driven_DynamicPricingQuoteForProducts\frontend'; Write-Host 'Starting React Frontend...' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "Both servers are starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "Access points:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Two new PowerShell windows will open with the servers." -ForegroundColor Yellow
Write-Host "Close those windows to stop the servers." -ForegroundColor Yellow
