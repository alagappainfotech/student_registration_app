#!/bin/bash

# Change to the backend directory
cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Ensure the Django server is running
python3 manage.py runserver 8000 &
SERVER_PID=$!

# Wait a moment for the server to start
sleep 3

# Run integration tests
python3 integration_tests/test_user_roles.py

# Kill the server
kill $SERVER_PID

deactivate
