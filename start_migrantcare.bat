@echo off
echo ========================================================
echo   Launching MIGRANTCARE (Healthcare Technology Platform)
echo ========================================================
echo.

:: 1. Launch FastAPI Backend in its own window
start "MigrantCare Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

:: 2. Wait 3 seconds
timeout /t 3 /nobreak >nul

:: 3. Launch Vite React Frontend in its own window
start "MigrantCare Frontend (React)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev -- --host 127.0.0.1 --port 5173"

:: 4. Wait 3 seconds and automatically open browser
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo MigrantCare servers are now active!
echo App URL:     http://localhost:5173
echo API Docs:    http://127.0.0.1:8000/docs
echo.
echo Keep the backend and frontend terminal windows open while using the app.
echo.
pause
