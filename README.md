# Epic Battle Application

This is a full-stack application with a Spring Boot backend and Angular frontend.

## Prerequisites

- Java 17 or higher
- Node.js and npm
- MySQL database

You can check if you have all the prerequisites installed by running:
- Windows: `check_prerequisites.bat`
- Linux/Mac: `chmod +x check_prerequisites.sh && ./check_prerequisites.sh`

## Database Setup

1. Ensure MySQL is running on localhost:3306
2. Create a database named `epicb_db` using one of these methods:
   - Run the provided SQL script: `mysql -u root -p < initialize_database.sql`
   - Or manually create the database in MySQL
3. The application will automatically create the necessary tables when it starts

## Starting the Applications

### Option 1: Using the Scripts

#### Windows
1. Run the `start_applications.bat` file by double-clicking it
2. This will start both the backend and frontend applications

#### Linux/Mac
1. Make the script executable: `chmod +x start_applications.sh`
2. Run the script: `./start_applications.sh`
3. This will attempt to start both the backend and frontend applications in separate terminal windows

### Option 2: Manual Start

#### Backend (Spring Boot)

1. Open a command prompt in the project root directory
2. Run: `mvnw spring-boot:run`
3. The backend will start on port 8081

#### Frontend (Angular)

1. Open a command prompt in the `frontend/epicb-frontend` directory
2. Run: `npm install` (first time only, to install dependencies)
3. Run: `npm start`
4. The frontend will start on port 4200

## Accessing the Application

- Backend API: http://localhost:8081/api
- Frontend: http://localhost:4200

## Project Scope

### Implemented Features
- Battle System
- User Authentication
- Character Management
- Global Ranking
- Battle History

### Out of Scope
- Social Media Integration
- Native Mobile Application
- Payment System or Online Store

## Troubleshooting

- If the backend fails to start, ensure MySQL is running and the database `epicb_db` exists
- If the frontend fails to start, ensure Node.js and npm are installed correctly
- Check the console output for any error messages
