@echo off
title VYBE Full Stack Launcher
echo ===================================================
echo   Starting VYBE Application (Backend + Frontend)
echo ===================================================

echo [1/2] Launching Backend (Django on port 8000)...
start "VYBE Backend (Django API :8000)" cmd /k "cd /d "%~dp0backend" && python manage.py migrate && python manage.py seed_moods && python manage.py seed_songs --limit 5 && python manage.py runserver 8000"

echo [2/2] Launching Frontend (Next.js on port 3000)...
start "VYBE Frontend (Next.js :3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================
echo   Both services are now booting up!
echo.
echo   Frontend Web App: http://localhost:3000
echo   Backend API Docs: http://localhost:8000/api/v1/docs/
echo   Backend Health:   http://localhost:8000/api/v1/health/
echo ===================================================
pause
