#!/bin/bash

echo "Starting Epic Battle applications..."

echo ""
echo "Starting MySQL database..."
echo "Please ensure MySQL is running on localhost:3306 with database 'epicb_db'"
echo ""

echo "Starting Spring Boot backend..."
gnome-terminal -- bash -c "cd $(pwd) && ./mvnw spring-boot:run; exec bash" || \
xterm -e "cd $(pwd) && ./mvnw spring-boot:run" || \
open -a Terminal.app "$(pwd)/mvnw spring-boot:run" || \
echo "Could not open a terminal window. Please start the backend manually."

echo ""
echo "Waiting for backend to start..."
sleep 10

echo ""
echo "Starting Angular frontend..."
gnome-terminal -- bash -c "cd $(pwd)/frontend/epicb-frontend && npm start; exec bash" || \
xterm -e "cd $(pwd)/frontend/epicb-frontend && npm start" || \
open -a Terminal.app "$(pwd)/frontend/epicb-frontend/npm start" || \
echo "Could not open a terminal window. Please start the frontend manually."

echo ""
echo "Applications are starting..."
echo "Backend will be available at: http://localhost:8081"
echo "Frontend will be available at: http://localhost:4200"
echo ""
echo "Press Enter to exit this window..."
read