#!/bin/bash

# Project root and backend directory
PROJECT_ROOT="/Users/acharyathiyagarajan/CascadeProjects/student_registration_app"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diagnostic checks
echo -e "${YELLOW}Backend Diagnostic Script${NC}"

# Check Python version
echo -e "\n${GREEN}Python Version:${NC}"
python3 --version

# Check virtual environment
echo -e "\n${GREEN}Virtual Environment:${NC}"
if [ -d "$BACKEND_DIR/venv" ]; then
    echo "Virtual environment exists ✓"
else
    echo -e "${RED}Virtual environment missing!${NC}"
fi

# Check dependencies
echo -e "\n${GREEN}Dependencies:${NC}"
cd "$BACKEND_DIR"
source venv/bin/activate
pip list | grep -E "django|rest_framework|cors"

# Check port availability
echo -e "\n${GREEN}Port 8000 Status:${NC}"
lsof -i:8000 || echo "Port 8000 is available"

# Attempt to run migrations
echo -e "\n${GREEN}Database Migrations:${NC}"
python manage.py makemigrations
python manage.py migrate

# Create superuser if not exists
echo -e "\n${GREEN}Admin User Check:${NC}"
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@aae.com', 'adminpass')
    print('Admin user created')
else:
    print('Admin user already exists')
"

echo -e "\n${YELLOW}Diagnostic Complete. Ready to start server.${NC}"
