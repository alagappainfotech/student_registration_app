# Student Registration System - Backend

Django REST Framework (DRF) backend for the Student Registration System. Provides a robust API for user authentication, registration management, and student information management.

## 🚀 Features

- **User Authentication**
  - JWT-based authentication
  - Role-based access control (Admin, Faculty, Student)
  - Password reset functionality

- **Registration Management**
  - Student registration requests
  - Admin approval workflow
  - Email notifications

- **Student Management**
  - Student profiles and records
  - Class and section management
  - Academic tracking

- **API Endpoints**
  - RESTful API design
  - Comprehensive documentation (Swagger/ReDoc)
  - Rate limiting and throttling

## 🛠 Tech Stack

- **Framework**: Django 4.2 & Django REST Framework
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Documentation**: drf-yasg (Swagger/OpenAPI)
- **Testing**: pytest, factory-boy
- **Containerization**: Docker

## 📦 Prerequisites

- Python 3.9+
- pip (Python package manager)
- SQLite3 (development)
- PostgreSQL (production)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student_registration_app/backend
   ```

2. **Set up a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```env
   DEBUG=True
   SECRET_KEY=your-secret-key
   DATABASE_URL=sqlite:///db.sqlite3
   EMAIL_BACKEND=django.core.mail.console.EmailBackend
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the development server**
   ```bash
   python manage.py runserver
   ```

## 📚 API Documentation

Once the server is running, access the API documentation at:
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

## 🧪 Running Tests

```bash
# Install test dependencies
pip install -r requirements-test.txt

# Run all tests
pytest

# Run tests with coverage
pytest --cov=.

```

## 🐳 Docker Setup

1. **Build the Docker image**
   ```bash
   docker-compose build
   ```

2. **Run the application**
   ```bash
   docker-compose up
   ```

The application will be available at http://localhost:8000

## 🏗 Project Structure

```
backend/
├── core/                  # Django project settings
├── registration/          # Main app
│   ├── migrations/       # Database migrations
│   ├── models/           # Database models
│   ├── serializers/      # API serializers
│   ├── tests/            # Test files
│   ├── urls.py          # App URLs
│   └── views/           # API views
├── .env                 # Environment variables
├── manage.py            # Django management script
└── requirements.txt     # Python dependencies
```

## 🔒 Authentication

The API uses JWT for authentication. To authenticate:

1. Obtain a token by making a POST request to `/api/token/` with username and password
2. Include the token in the `Authorization` header: `Bearer <token>`

## 🔄 API Endpoints

### Authentication
- `POST /api/token/` - Obtain JWT token
- `POST /api/token/refresh/` - Refresh JWT token

### Users
- `GET /api/users/` - List users (admin only)
- `POST /api/users/` - Create new user
- `GET /api/users/{id}/` - Retrieve user details
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user (admin only)

### Registration Requests
- `GET /api/registration/` - List registration requests
- `POST /api/registration/` - Create registration request
- `POST /api/registration/{id}/approve/` - Approve request (admin)
- `POST /api/registration/{id}/reject/` - Reject request (admin)

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DEBUG | Enable debug mode | False |
| SECRET_KEY | Django secret key | - |
| DATABASE_URL | Database connection URL | sqlite:///db.sqlite3 |
| ALLOWED_HOSTS | Allowed hostnames | ['*'] |
| CORS_ALLOWED_ORIGINS | Allowed CORS origins | [] |
| EMAIL_BACKEND | Email backend | console |
| DEFAULT_FROM_EMAIL | Default sender email | webmaster@localhost |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please contact the development team at support@example.com
