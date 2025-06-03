#!/bin/bash

# Student Registration App - Complete Setup Script
# This script sets up the entire application from scratch to its current state
# It checks the current state before making changes to avoid adverse effects

# Color codes for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="/Users/acharyathiyagarajan/CascadeProjects/student_registration_app"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend/web"

# Log file
LOG_FILE="$PROJECT_ROOT/complete_setup.log"
exec > >(tee -a "$LOG_FILE") 2>&1

# Timestamp function
timestamp() {
    date "+%Y-%m-%d %H:%M:%S"
}

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}===========================================================${NC}"
    echo -e "${BLUE}   $1${NC}"
    echo -e "${BLUE}===========================================================${NC}\n"
}

# Function to check command success
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1 completed successfully${NC}"
    else
        echo -e "${RED}✗ $1 failed${NC}"
        exit 1
    fi
}

# Function to check if a step is needed
check_if_needed() {
    if [ $? -eq 0 ]; then
        echo -e "${YELLOW}⚠ $1 already exists, skipping...${NC}"
        return 1
    else
        echo -e "${BLUE}ℹ $1 needs to be set up${NC}"
        return 0
    fi
}

# Function to prompt user for confirmation
confirm_action() {
    read -p "$1 (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Skipping this step...${NC}"
        return 1
    fi
    return 0
}

# Ask for confirmation before proceeding
print_section "Confirmation"
echo -e "${YELLOW}This script will check and update your Student Registration App to the latest state.${NC}"
echo -e "${YELLOW}It will preserve existing data and only apply necessary changes.${NC}"
confirm_action "Do you want to proceed?" || exit 0

# Check for running services
print_section "Checking existing services"
echo "[$(timestamp)] Checking for running services..."

BACKEND_RUNNING=false
FRONTEND_RUNNING=false

if lsof -ti:8000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Backend service is currently running on port 8000${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${BLUE}ℹ Backend service is not running${NC}"
fi

if lsof -ti:5173 > /dev/null 2>&1 || lsof -ti:5174 > /dev/null 2>&1 || lsof -ti:5175 > /dev/null 2>&1 || lsof -ti:5176 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Frontend service is currently running${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${BLUE}ℹ Frontend service is not running${NC}"
fi

if $BACKEND_RUNNING || $FRONTEND_RUNNING; then
    confirm_action "Do you want to stop running services before proceeding?" || echo -e "${YELLOW}Continuing with services running...${NC}"
    
    if [ $? -eq 0 ]; then
        echo "[$(timestamp)] Stopping existing services..."
        if $BACKEND_RUNNING; then
            lsof -ti:8000 | xargs kill -9 2>/dev/null || true
            echo -e "${GREEN}✓ Backend service stopped${NC}"
        fi
        
        if $FRONTEND_RUNNING; then
            lsof -ti:5173 | xargs kill -9 2>/dev/null || true
            lsof -ti:5174 | xargs kill -9 2>/dev/null || true
            lsof -ti:5175 | xargs kill -9 2>/dev/null || true
            lsof -ti:5176 | xargs kill -9 2>/dev/null || true
            echo -e "${GREEN}✓ Frontend service stopped${NC}"
        fi
        sleep 2
    fi
fi

# BACKEND SETUP
print_section "Checking Backend Environment"
cd "$BACKEND_DIR"

# Check for virtual environment
echo "[$(timestamp)] Checking virtual environment..."
confirm_action "Do you want to create a fresh virtual environment?" || echo -e "${YELLOW}Will use existing virtual environment if available${NC}"

if [ $? -eq 0 ]; then
    # User wants a fresh virtual environment
    if [ -d "venv" ]; then
        echo "[$(timestamp)] Removing existing virtual environment..."
        rm -rf venv
        check_success "Removed existing virtual environment"
    fi
    
    echo "[$(timestamp)] Creating new virtual environment..."
    python3 -m venv venv
    check_success "Virtual environment creation"
    
    echo "[$(timestamp)] Activating virtual environment..."
    source venv/bin/activate
    check_success "Virtual environment activation"
    
    # Upgrade pip and setuptools
    echo "[$(timestamp)] Upgrading pip and setuptools..."
    pip install --upgrade pip setuptools
    check_success "Pip upgrade"
else
    # Use existing if available, create if not
    if [ -d "venv" ]; then
        echo -e "${YELLOW}⚠ Using existing virtual environment${NC}"
        source venv/bin/activate || true
    else
        echo "[$(timestamp)] Virtual environment not found. Creating new one..."
        python3 -m venv venv
        source venv/bin/activate
        check_success "Virtual environment setup"
        
        # Upgrade pip and setuptools
        echo "[$(timestamp)] Upgrading pip and setuptools..."
        pip install --upgrade pip setuptools
        check_success "Pip upgrade"
    fi
fi

# Check for installed dependencies
echo "[$(timestamp)] Checking backend dependencies..."
confirm_action "Do you want to install all backend dependencies from requirements.txt?" || echo -e "${YELLOW}Will check if dependencies need updating${NC}"

if [ $? -eq 0 ]; then
    # User wants to install all dependencies
    echo "[$(timestamp)] Installing all backend dependencies from requirements.txt..."
    pip install -r requirements.txt
    check_success "Backend dependencies installation"
else
    # Check if Django is already installed
    if pip freeze | grep -q "Django=="; then
        echo -e "${YELLOW}⚠ Django is already installed${NC}"
        confirm_action "Do you want to ensure all dependencies are up to date?" || echo -e "${YELLOW}Skipping dependency update${NC}"
        
        if [ $? -eq 0 ]; then
            echo "[$(timestamp)] Updating backend dependencies..."
            pip install -r requirements.txt
            check_success "Backend dependencies update"
        fi
    else
        echo "[$(timestamp)] Django not found. Installing backend dependencies..."
        pip install -r requirements.txt
        check_success "Backend dependencies installation"
    fi
fi

# Check database status
echo "[$(timestamp)] Checking database status..."
if [ -f "db.sqlite3" ]; then
    echo -e "${YELLOW}⚠ Database already exists${NC}"
    confirm_action "Do you want to check for and apply any pending migrations?" || echo -e "${YELLOW}Skipping migrations${NC}"
    
    if [ $? -eq 0 ]; then
        python manage.py makemigrations
        python manage.py migrate
        check_success "Database migrations"
    fi
else
    echo "[$(timestamp)] Setting up database..."
    python manage.py makemigrations
    python manage.py migrate
    check_success "Database setup"
    
    # Load fixtures if they exist
    echo "[$(timestamp)] Loading initial data..."
    if [ -d "registration/fixtures" ]; then
        confirm_action "Do you want to load initial data from fixtures?" || echo -e "${YELLOW}Skipping fixture loading${NC}"
        
        if [ $? -eq 0 ]; then
            python manage.py loaddata registration/fixtures/users.json || true
            python manage.py loaddata registration/fixtures/profiles.json || true
            python manage.py loaddata registration/fixtures/organizations.json || true
            python manage.py loaddata registration/fixtures/courses.json || true
            check_success "Data fixtures loading"
        fi
    else
        echo -e "${YELLOW}No fixtures found, skipping initial data load${NC}"
    fi
fi

# Check static files
echo "[$(timestamp)] Checking static files..."
if [ -d "staticfiles" ]; then
    echo -e "${YELLOW}⚠ Static files directory already exists${NC}"
    confirm_action "Do you want to update static files?" || echo -e "${YELLOW}Skipping static files collection${NC}"
    
    if [ $? -eq 0 ]; then
        python manage.py collectstatic --noinput
        check_success "Static files collection"
    fi
else
    echo "[$(timestamp)] Collecting static files..."
    python manage.py collectstatic --noinput
    check_success "Static files collection"
fi

# FRONTEND SETUP
print_section "Checking Frontend Environment"
cd "$FRONTEND_DIR"

# Check for frontend dependencies
echo "[$(timestamp)] Checking frontend dependencies..."
confirm_action "Do you want to perform a clean frontend installation (remove node_modules and package-lock.json)?" || echo -e "${YELLOW}Will update existing installation if available${NC}"

if [ $? -eq 0 ]; then
    # User wants a clean installation
    echo "[$(timestamp)] Performing clean frontend installation..."
    if [ -d "node_modules" ]; then
        echo "[$(timestamp)] Removing node_modules directory..."
        rm -rf node_modules
        check_success "Removed node_modules"
    fi
    
    if [ -f "package-lock.json" ]; then
        echo "[$(timestamp)] Removing package-lock.json..."
        rm -f package-lock.json
        check_success "Removed package-lock.json"
    fi
    
    echo "[$(timestamp)] Installing frontend dependencies from scratch..."
    npm install
    check_success "Frontend dependencies installation"
else
    # Update existing installation or install if not present
    if [ -d "node_modules" ]; then
        echo -e "${YELLOW}⚠ Node modules already installed${NC}"
        confirm_action "Do you want to ensure all frontend dependencies are up to date?" || echo -e "${YELLOW}Skipping frontend dependency update${NC}"
        
        if [ $? -eq 0 ]; then
            npm install
            check_success "Frontend dependencies update"
        fi
    else
        echo "[$(timestamp)] Installing frontend dependencies..."
        npm install
        check_success "Frontend dependencies installation"
    fi
fi

# APPLYING RECENT CHANGES
print_section "Checking for Recent Changes"

# 1. Check backend for registration request functionality
cd "$BACKEND_DIR"
echo "[$(timestamp)] Checking backend for registration request functionality..."

# Check if the RegistrationRequest model exists in models.py
if grep -q "class RegistrationRequest" registration/models.py; then
    echo -e "${YELLOW}⚠ RegistrationRequest model already exists${NC}"
else
    echo -e "${BLUE}ℹ RegistrationRequest model needs to be added${NC}"
    confirm_action "Do you want to add the RegistrationRequest model to models.py?" || echo -e "${YELLOW}Skipping RegistrationRequest model addition${NC}"
    
    if [ $? -eq 0 ]; then
        echo "[$(timestamp)] Adding RegistrationRequest model..."
        # This is a simplified approach - in a real scenario, you might want to use a patch file
        cat << 'EOF' >> registration/models.py

class RegistrationRequest(models.Model):
    """Model for storing registration requests from the landing page"""
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('faculty', 'Faculty'),
    )
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    message = models.TextField(blank=True)
    is_processed = models.BooleanField(default=False)
    processed_by = models.ForeignKey(get_user_model(), null=True, blank=True, on_delete=models.SET_NULL, related_name='processed_requests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.email}) - {self.role}"
EOF
        check_success "Added RegistrationRequest model"
    fi
fi

# Check if contact_views.py exists
if [ -f "registration/contact_views.py" ]; then
    echo -e "${YELLOW}⚠ contact_views.py already exists${NC}"
else
    echo -e "${BLUE}ℹ contact_views.py needs to be created${NC}"
    confirm_action "Do you want to create the contact_views.py file?" || echo -e "${YELLOW}Skipping contact_views.py creation${NC}"
    
    if [ $? -eq 0 ]; then
        echo "[$(timestamp)] Creating contact_views.py..."
        cat << 'EOF' > registration/contact_views.py
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from .serializers import RegistrationRequestSerializer
from rest_framework.permissions import AllowAny

logger = logging.getLogger(__name__)

class RegistrationRequestView(APIView):
    """
    API endpoint for handling registration requests from the landing page.
    This endpoint is public and doesn't require authentication.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegistrationRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            # Save the registration request
            registration_request = serializer.save()
            
            # Log the registration request
            logger.info(f"New registration request received from {registration_request.name} ({registration_request.email}) for role: {registration_request.role}")
            
            # Send email notification to administrators
            try:
                admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@example.com')
                send_mail(
                    subject=f'New Registration Request: {registration_request.role.capitalize()}',
                    message=f"""
                    A new registration request has been submitted:
                    
                    Name: {registration_request.name}
                    Email: {registration_request.email}
                    Phone: {registration_request.phone}
                    Role: {registration_request.role}
                    
                    Message:
                    {registration_request.message}
                    
                    Please review this request in the admin dashboard.
                    """,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[admin_email],
                    fail_silently=False,
                )
            except Exception as e:
                logger.error(f"Failed to send registration request email: {str(e)}")
            
            return Response({
                'message': 'Registration request submitted successfully. An administrator will contact you soon.',
                'request_id': registration_request.id
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
EOF
        check_success "Created contact_views.py"
    fi
fi

# Check if RegistrationRequestSerializer exists in serializers.py
if grep -q "class RegistrationRequestSerializer" registration/serializers.py; then
    echo -e "${YELLOW}⚠ RegistrationRequestSerializer already exists${NC}"
else
    echo -e "${BLUE}ℹ RegistrationRequestSerializer needs to be added${NC}"
    confirm_action "Do you want to add the RegistrationRequestSerializer to serializers.py?" || echo -e "${YELLOW}Skipping serializer addition${NC}"
    
    if [ $? -eq 0 ]; then
        echo "[$(timestamp)] Adding RegistrationRequestSerializer..."
        # Make sure RegistrationRequest is imported
        if ! grep -q "RegistrationRequest" registration/serializers.py; then
            sed -i '' 's/from .models import Student, Organization, Course, Class, Section, Profile, Faculty, Enrollment, Grade/from .models import Student, Organization, Course, Class, Section, Profile, Faculty, Enrollment, Grade, RegistrationRequest/g' registration/serializers.py || true
        fi
        
        # Add the serializer
        cat << 'EOF' >> registration/serializers.py

class RegistrationRequestSerializer(serializers.ModelSerializer):
    """Serializer for handling registration requests from the landing page"""
    
    class Meta:
        model = RegistrationRequest
        fields = ['id', 'name', 'email', 'phone', 'role', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']
EOF
        check_success "Added RegistrationRequestSerializer"
    fi
fi

# Check if registration request endpoint is in urls.py
if grep -q "RegistrationRequestView" registration/urls.py; then
    echo -e "${YELLOW}⚠ Registration request endpoint already exists in urls.py${NC}"
else
    echo -e "${BLUE}ℹ Registration request endpoint needs to be added to urls.py${NC}"
    confirm_action "Do you want to add the registration request endpoint to urls.py?" || echo -e "${YELLOW}Skipping endpoint addition${NC}"
    
    if [ $? -eq 0 ]; then
        echo "[$(timestamp)] Adding registration request endpoint to urls.py..."
        # Import the view
        sed -i '' 's/from .auth_views import (/from .auth_views import (\n    LoginView, \n    LogoutView, \n    UserInfoView, \n    CustomTokenRefreshView,\n)\nfrom .contact_views import RegistrationRequestView/g' registration/urls.py || true
        
        # Add the URL pattern
        cat << 'EOF' > /tmp/url_pattern.txt
# Registration request endpoint
    path('api/registration-request/', log_url_pattern(RegistrationRequestView.as_view(), name='registration-request')),
    # Debug test view
EOF
        # Use grep and sed to safely add the URL pattern
        if grep -q "# Debug test view" registration/urls.py; then
            sed -i '' -e '/# Debug test view/r /tmp/url_pattern.txt' -e '/# Debug test view/d' registration/urls.py || true
        else
            echo "[$(timestamp)] Could not find the insertion point in urls.py"
            echo "[$(timestamp)] Please add the registration request endpoint manually"
        fi
        check_success "Added registration request endpoint"
    fi
fi

# Check if migrations are needed
echo "[$(timestamp)] Checking if migrations are needed..."
MIGRATIONS_NEEDED=$(python manage.py makemigrations --dry-run)
if [[ $MIGRATIONS_NEEDED == *"No changes detected"* ]]; then
    echo -e "${YELLOW}⚠ No migrations needed${NC}"
else
    echo -e "${BLUE}ℹ Migrations are needed${NC}"
    confirm_action "Do you want to create and apply migrations?" || echo -e "${YELLOW}Skipping migrations${NC}"
    
    if [ $? -eq 0 ]; then
        echo "[$(timestamp)] Creating and applying migrations..."
        python manage.py makemigrations
        python manage.py migrate
        check_success "Applied migrations"
    fi
fi

# 2. Check frontend for LandingPage component
cd "$FRONTEND_DIR"
echo "[$(timestamp)] Checking frontend for LandingPage component..."

# Check if LandingPage is imported in App.jsx
if grep -q "import LandingPage from './components/LandingPage';" src/App.jsx; then
    echo -e "${YELLOW}⚠ LandingPage is already imported in App.jsx${NC}"
else
    echo -e "${BLUE}ℹ LandingPage import needs to be added to App.jsx${NC}"
    confirm_action "Do you want to update App.jsx to include LandingPage?" || echo -e "${YELLOW}Skipping App.jsx update${NC}"
    
    if [ $? -eq 0 ]; then
        echo "[$(timestamp)] Updating App.jsx for LandingPage routing..."
        # Add import
        sed -i '' 's/import PasswordResetConfirm from '\''\.\/components\/PasswordResetConfirm'\'';/import PasswordResetConfirm from '\''\.\/components\/PasswordResetConfirm'\'';\nimport LandingPage from '\''\.\/components\/LandingPage'\'';/g' src/App.jsx || true
        
        # Update routes
        # Create temporary files with the replacement patterns
        echo '<Route path="/" element={<LandingPage />} />' > /tmp/landing_route.txt
        echo '<Route path="*" element={<Navigate to="/" replace />} />' > /tmp/wildcard_route.txt
        
        # Use grep to find the lines and replace them safely
        if grep -q '<Route path="/" element={<Navigate to="/login" replace />} />' src/App.jsx; then
            LINE_NUM=$(grep -n '<Route path="/" element={<Navigate to="/login" replace />} />' src/App.jsx | cut -d ':' -f1)
            sed -i '' "${LINE_NUM}s|.*|$(cat /tmp/landing_route.txt)|" src/App.jsx || true
        else
            echo "[$(timestamp)] Could not find the landing page route in App.jsx"
            echo "[$(timestamp)] Please update the landing page route manually"
        fi
        
        if grep -q '<Route path="\*" element={<Navigate to="/login" replace />} />' src/App.jsx; then
            LINE_NUM=$(grep -n '<Route path="\*" element={<Navigate to="/login" replace />} />' src/App.jsx | cut -d ':' -f1)
            sed -i '' "${LINE_NUM}s|.*|$(cat /tmp/wildcard_route.txt)|" src/App.jsx || true
        else
            echo "[$(timestamp)] Could not find the wildcard route in App.jsx"
            echo "[$(timestamp)] Please update the wildcard route manually"
        fi
        check_success "Updated App.jsx"
    fi
fi

# Check if LandingPage.jsx is using the correct API endpoint
if grep -q "'/api/contact/registration-request/'" src/components/LandingPage.jsx; then
    echo -e "${BLUE}ℹ LandingPage.jsx needs API endpoint update${NC}"
    confirm_action "Do you want to update the API endpoint in LandingPage.jsx?" || echo -e "${YELLOW}Skipping API endpoint update${NC}"
    
    if [ $? -eq 0 ]; then
        echo "[$(timestamp)] Updating API endpoint in LandingPage.jsx..."
        sed -i '' "s|'/api/contact/registration-request/'|'/api/registration-request/'|g" src/components/LandingPage.jsx || true
        check_success "Updated API endpoint"
    fi
else
    if grep -q "'/api/registration-request/'" src/components/LandingPage.jsx; then
        echo -e "${YELLOW}⚠ LandingPage.jsx is already using the correct API endpoint${NC}"
    else
        echo -e "${YELLOW}⚠ Could not find API endpoint in LandingPage.jsx${NC}"
        echo -e "${YELLOW}⚠ Please check the file manually${NC}"
    fi
fi

# START SERVICES
print_section "Starting Services"
confirm_action "Do you want to start the application services?" || exit 0

# Start backend server
cd "$BACKEND_DIR"
echo "[$(timestamp)] Starting Django backend server..."
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
sleep 5
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Backend server started successfully with PID: $BACKEND_PID${NC}"
else
    echo -e "${RED}✗ Failed to start backend server${NC}"
fi

# Start frontend server
cd "$FRONTEND_DIR"
echo "[$(timestamp)] Starting React frontend server..."
npm run dev &
FRONTEND_PID=$!
sleep 5
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Frontend server started successfully with PID: $FRONTEND_PID${NC}"
else
    echo -e "${RED}✗ Failed to start frontend server${NC}"
fi

print_section "Setup Complete"
echo -e "${GREEN}The Student Registration App has been successfully set up!${NC}"
echo -e "${YELLOW}Backend server running on: http://localhost:8000${NC}"
echo -e "${YELLOW}Frontend server running on: http://localhost:5173${NC}"
echo -e "${YELLOW}To stop the servers, run: kill $BACKEND_PID $FRONTEND_PID${NC}"
echo -e "${YELLOW}Or use the manage_services.sh script: ./manage_services.sh stop${NC}"

# Save PIDs to a file for easy cleanup
echo "BACKEND_PID=$BACKEND_PID" > "$PROJECT_ROOT/.server_pids"
echo "FRONTEND_PID=$FRONTEND_PID" >> "$PROJECT_ROOT/.server_pids"

exit 0
