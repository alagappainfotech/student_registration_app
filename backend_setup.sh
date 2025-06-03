#!/bin/bash

# Strict error handling
set -e
set -o pipefail

# Project root and backend directory
PROJECT_ROOT="/Users/acharyathiyagarajan/CascadeProjects/student_registration_app"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Logging
LOG_FILE="$PROJECT_ROOT/backend_setup.log"
exec > >(tee -a "$LOG_FILE") 2>&1

# Timestamp function
timestamp() {
    date "+%Y-%m-%d %H:%M:%S"
}

# Kill any existing processes on port 8000
echo "[$(timestamp)] Killing existing processes on port 8000..."
lsof -ti:8000 | xargs kill -9 || true

# Navigate to backend directory
cd "$BACKEND_DIR"

# Create and activate virtual environment
echo "[$(timestamp)] Setting up virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Upgrade pip and setuptools
pip install --upgrade pip setuptools

# Install dependencies
echo "[$(timestamp)] Installing dependencies..."
pip install -r requirements.txt

# Apply migrations
echo "[$(timestamp)] Checking and applying database migrations..."
python manage.py makemigrations
python manage.py migrate

# Collect static files
echo "[$(timestamp)] Collecting static files..."
python manage.py collectstatic --noinput

# Start Django development server
echo "[$(timestamp)] Starting Django server..."
python manage.py runserver 0.0.0.0:8000
