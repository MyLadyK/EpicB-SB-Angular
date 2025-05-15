@echo off
echo Starting Epic Battle applications...

echo.
echo Starting MySQL database...
echo Please ensure MySQL is running on localhost:3306 with database 'epicb_db'
echo.

echo Starting Spring Boot backend...
start cmd /k "cd /d %~dp0 && mvnw spring-boot:run"

echo.
echo Waiting for backend to start...
timeout /t 10 /nobreak

echo.
echo Starting Angular frontend...
start cmd /k "cd /d %~dp0frontend\epicb-frontend && npm start"

echo.
echo Applications are starting...
echo Backend will be available at: http://localhost:8081
echo Frontend will be available at: http://localhost:4200
echo.
echo Press any key to exit this window...
pause > nul