@echo off
echo ========================================================
echo   Launching MIGRANTCARE (Healthcare Technology Platform)
echo ========================================================
echo.

:: 1. Launch FastAPI Backend
start "MigrantCare Backend (FastAPI)" /min cmd /c "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

:: 2. Wait 2 seconds
timeout /t 2 /nobreak >nul

:: 3. Launch Vite React Frontend
start "MigrantCare Frontend (React)" /min cmd /c "cd /d %~dp0frontend && npm.cmd run dev -- --host 127.0.0.1 --port 5173"

:: 4. Wait 2 seconds and automatically open browser
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo MigrantCare is now running!
echo App URL:     http://localhost:5173
echo API Docs:    http://127.0.0.1:8000/docs
echo.
echo Press any key to exit this launcher window...
pause >nul
