#!/bin/bash

# Change to the project directory
cd /Users/acharyathiyagarajan/CascadeProjects/student_registration_app

# Activate virtual environment
source venv/bin/activate

# Backend: Navigate to backend directory
cd backend

# Apply migrations
python manage.py makemigrations
python manage.py migrate

# Load fixtures
python manage.py loaddata registration/fixtures/users.json
python manage.py loaddata registration/fixtures/profiles.json
python manage.py loaddata registration/fixtures/organizations.json
python manage.py loaddata registration/fixtures/courses.json

# Start backend server in background
python manage.py runserver 8000 &
BACKEND_PID=$!

# Change to frontend directory
cd ../frontend/web

# Install frontend dependencies
npm install

# Start frontend server in background
npm run dev &
FRONTEND_PID=$!

# Print PIDs
echo "Backend server started with PID: $BACKEND_PID"
echo "Frontend server started with PID: $FRONTEND_PID"

# Optional: Wait for user input to terminate
read -p "Press Enter to stop servers..."

# Terminate servers
kill $BACKEND_PID
kill $FRONTEND_PID

# Deactivate virtual environment
deactivate
