Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting VYBE Application (Backend + Frontend)   " -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "backend"
$frontendDir = Join-Path $PSScriptRoot "frontend"

Write-Host "[1/2] Launching Backend on http://localhost:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; python manage.py migrate; python manage.py seed_moods; python manage.py seed_songs --limit 5; python manage.py runserver 8000"

Write-Host "[2/2] Launching Frontend on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev"

Write-Host ""
Write-Host "Both servers launched in dedicated windows!" -ForegroundColor Green
Write-Host "  - Frontend Web App: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  - Backend API Docs: http://localhost:8000/api/v1/docs/" -ForegroundColor Cyan
Write-Host "  - Backend Health:   http://localhost:8000/api/v1/health/" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
