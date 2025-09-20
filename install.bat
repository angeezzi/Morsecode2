@echo off
echo ========================================
echo Arduino Web Communication Setup
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo Installing Node.js dependencies...
npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Upload arduino-examples.ino to your Arduino
echo 2. Run: npm start
echo 3. Open: http://localhost:3000
echo.
echo For detailed instructions, see SETUP.md
echo.
pause
