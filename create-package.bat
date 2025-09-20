@echo off
echo Creating Arduino Dashboard Package for Friend...
echo.

REM Create package directory
if not exist "arduino-package" mkdir "arduino-package"

REM Copy essential files
echo Copying essential files...
copy "package.json" "arduino-package\"
copy "server.js" "arduino-package\"
copy "arduino-dashboard.html" "arduino-package\"
copy "morse-dashboard.html" "arduino-package\"
copy "arduino-unified.html" "arduino-package\"
copy "remote-demo.html" "arduino-package\"
copy "arduino-script.js" "arduino-package\"
copy "morse-script.js" "arduino-package\"
copy "arduino-styles.css" "arduino-package\"
copy "morse-styles.css" "arduino-package\"
copy "morse-test.html" "arduino-package\"
copy "index.html" "arduino-package\"
copy "arduino-examples.ino" "arduino-package\"
copy "arduino-morse-code.ino" "arduino-package\"
copy "friend-setup.md" "arduino-package\"
copy "README.md" "arduino-package\"

REM Create a simple start script
echo Creating start script...
echo @echo off > "arduino-package\start-server.bat"
echo echo Starting Arduino Dashboard Server... >> "arduino-package\start-server.bat"
echo echo. >> "arduino-package\start-server.bat"
echo echo Installing dependencies... >> "arduino-package\start-server.bat"
echo npm install >> "arduino-package\start-server.bat"
echo echo. >> "arduino-package\start-server.bat"
echo echo Starting server... >> "arduino-package\start-server.bat"
echo npm start >> "arduino-package\start-server.bat"
echo pause >> "arduino-package\start-server.bat"

REM Create a demo start script
echo Creating demo script...
echo @echo off > "arduino-package\start-demo.bat"
echo echo Starting Arduino Dashboard Demo... >> "arduino-package\start-demo.bat"
echo echo. >> "arduino-package\start-demo.bat"
echo echo Opening demo in browser... >> "arduino-package\start-demo.bat"
echo start remote-demo.html >> "arduino-package\start-demo.bat"
echo pause >> "arduino-package\start-demo.bat"

echo.
echo Package created successfully!
echo.
echo Files in arduino-package folder:
dir "arduino-package" /b
echo.
echo Instructions for your friend:
echo 1. Send the arduino-package folder to your friend
echo 2. Your friend should read friend-setup.md
echo 3. For quick demo: run start-demo.bat
echo 4. For full setup: run start-server.bat
echo.
pause
