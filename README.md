# Student Registration System

A comprehensive, full-stack application for managing student registrations in educational institutions. Built with Django REST Framework (backend) and React (frontend).

## 🚀 Key Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Staff, Student)
  - Secure password management

- **Registration Management**
  - Online registration requests
  - Admin approval workflow
  - Email notifications

- **Student Management**
  - Student profiles and records
  - Class and section management
  - Academic tracking

- **Admin Dashboard**
  - User management
  - Registration request approval/rejection
  - System configuration

## 🏗 System Architecture

### Backend (Django REST Framework)
- **Framework**: Django 4.2
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful endpoints
- **Testing**: Django TestCase, pytest

### Frontend (React)
- **Framework**: React 18
- **State Management**: React Context API
- **UI Components**: Material-UI
- **Routing**: React Router
- **Testing**: Jest, React Testing Library

### Database Schema
See [database/README.md](backend/database/README.md) for detailed schema documentation.

## 📦 Installation

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn
- SQLite3

### Backend Setup

```bash
# Clone the repository
git clone <repository-url>
cd student_registration_app/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (follow prompts)
python manage.py createsuperuser

# Run the development server
python manage.py runserver
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend/web

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔒 Authentication

The application uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Obtain a token by making a POST request to `/api/token/` with username and password
2. Include the token in the `Authorization` header: `Bearer <token>`

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend/web
npm test
```

## 📚 API Documentation

API documentation is available at `/api/docs/` when running the development server.

## 🔄 Deployment

### Production Checklist
- [ ] Set up a production database (PostgreSQL recommended)
- [ ] Configure environment variables in `.env`
- [ ] Set `DEBUG=False` in production
- [ ] Configure a production web server (Nginx + Gunicorn recommended)
- [ ] Set up SSL/TLS
- [ ] Configure email backend

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please contact the development team at support@example.com

---

## Admin User Access

### Login Credentials
- **Username:** admin
- **Email:** admin@university.edu
- **Password:** admin123

### Admin Permissions
The superadmin has full access to the system, including:
- Complete dashboard visibility
- User management (create, modify, delete users)
- Organization management
- Course and enrollment management
- Full system configuration access

### Frontend Dashboard Access
- The admin can access all dashboard views and perform comprehensive system management
- Role-based access control is implemented to restrict other user roles

## Structure
- `database/`: SQLite database schema and migration scripts.
- `backend/`: Django REST API for student registration.
- `frontend/`: React (web) and React Native (mobile) frontend.

## Project Setup and Deployment

### Testing Strategy

#### Frontend Testing
- **Framework**: Jest with React Testing Library
- **Coverage**: Comprehensive unit and integration tests

**Running Frontend Tests:**
```bash
# Navigate to frontend directory
cd frontend/web

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

**Backend Testing:**
- **Framework**: Django TestCase
- **Coverage**: Comprehensive authentication and API tests

**Running Backend Tests:**
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
source venv/bin/activate

# Run all tests
python manage.py test

# Run specific test module
python manage.py test registration.tests
```

**Test Best Practices:**
- Write tests for all critical user flows
- Cover edge cases and error scenarios
- Maintain at least 80% test coverage
- Run tests before each commit

### Shell Scripts Overview

The project includes several shell scripts to manage services and diagnose the application:

1. **`manage_services.sh`**
   - Purpose: Centralized service management script
   - Commands:
     ```bash
     ./manage_services.sh start    # Start all services
     ./manage_services.sh stop     # Stop all services
     ./manage_services.sh restart  # Restart all services
     ./manage_services.sh status   # Check service status
     ```

2. **`backend_setup.sh`**
   - Purpose: Set up backend environment
   - Actions:
     - Create virtual environment
     - Install dependencies
     - Apply database migrations
     - Load sample data
     - Prepare backend for development

3. **`backend_diagnose.sh`**
   - Purpose: Diagnostic tool for backend
   - Checks:
     - Python version
     - Virtual environment status
     - Installed dependencies
     - Database migration status
     - Port availability
     - Admin user configuration

4. **`restart_servers.sh`**
   - Purpose: Comprehensive server restart script
   - Actions:
     - Activate virtual environment
     - Install/upgrade requirements
     - Apply migrations
     - Load sample data
     - Start backend and frontend servers

### Quick Start Guide

#### Backend Setup
```bash
# Navigate to project root
cd student_registration_app

# Run backend setup script
./backend_setup.sh

# Diagnose backend (optional)
./backend_diagnose.sh
```

#### Start Services
```bash
# Start all services
./manage_services.sh start

# Or restart services
./manage_services.sh restart
```

### Login Credentials

| Role     | Username  | Password    | Dashboard URL                        |
|----------|-----------|-------------|--------------------------------------|
| Admin    | admin     | admin123    | http://localhost:5173/admin          |
| Faculty1 | faculty1  | faculty123  | http://localhost:5173/faculty        |
| Faculty2 | faculty2  | faculty123  | http://localhost:5173/faculty        |
| Student1 | student1  | student123  | http://localhost:5173/student        |
| Student2 | student2  | student123  | http://localhost:5173/student        |

> **Note:** Credentials are pre-configured in sample data fixtures.

### Troubleshooting
- Ensure all dependencies are installed
- Check virtual environment activation
- Verify database migrations
- Review diagnostic script output for any issues

---

## Backend (Django)

### 1. Setup Virtual Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Apply Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser (Admin)
```bash
python manage.py createsuperuser
```

### 5. Run Django Server
```bash
python manage.py runserver 0.0.0.0:8000
```

---

## Frontend (React)

### 1. Install Node Dependencies
```bash
cd ../frontend/web
npm install
```

### 2. Start React Dev Server
```bash
npm run dev -- --port 5173
```

The frontend will be available at [http://localhost:5173](http://localhost:5173) (or another port if 5173 is busy).

---

## Sample Login Credentials
- **Admin:** (created via createsuperuser)
- **Faculty:**  
  - Username: `faculty1`  
  - Password: `faculty123`
- **Student:**  
  - Username: `student1`  
  - Password: `student123`

---

## Password Reset (Development Mode)
- Use the "Forgot Password?" link on the login page.
- The reset link will be printed in the Django backend server console (not sent via real email).

---

## Troubleshooting
- If you see a blank page or error, check the browser console and backend terminal for error messages.
- Ensure both backend and frontend servers are running.
- For API issues, verify the backend is running on port 8000 and frontend is proxying requests correctly.

---
