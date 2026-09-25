@echo off
echo ========================================================
echo   Setting up MIGRANTCARE on this system...
echo ========================================================
echo.

:: 1. Check Python
echo [1/3] Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH. Please install Python 3.10+ from python.org.
    pause
    exit /b
)

:: 2. Check Node / npm
echo.
echo [2/3] Checking Node.js installation...
node -v
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js from nodejs.org.
    pause
    exit /b
)

:: 3. Install Backend Dependencies
echo.
echo [3/3] Installing Python backend dependencies...
python -m pip install -r backend\requirements.txt

:: 4. Install Frontend Dependencies
echo.
echo [4/4] Installing Frontend npm packages...
cd frontend
call npm install
cd ..

echo.
echo ========================================================
echo   SETUP COMPLETE!
echo   You can now launch the app anytime by double-clicking:
echo   start_migrantcare.bat
echo ========================================================
echo.
pause
