@echo off
echo Checking prerequisites for Epic Battle application...
echo.

echo Checking Java...
java -version 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java is not installed or not in PATH. Please install Java 17 or higher.
) else (
    echo [OK] Java is installed.
)

echo.
echo Checking Node.js...
node -v 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js.
) else (
    echo [OK] Node.js is installed.
)

echo.
echo Checking npm...
npm -v 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed or not in PATH. Please install npm.
) else (
    echo [OK] npm is installed.
)

echo.
echo Checking MySQL...
mysql --version 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] MySQL is not installed or not in PATH. Please install MySQL.
) else (
    echo [OK] MySQL is installed.
)

echo.
echo Prerequisite check completed.
echo.
echo Press any key to exit...
pause > nul