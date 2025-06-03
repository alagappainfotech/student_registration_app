import os
import sys
import django
from django.conf import settings
from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.urls import reverse

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

class UserRoleIntegrationTest(TestCase):
    def setUp(self):
        """Create test users with different permissions"""
        # Admin user (staff and superuser)
        self.admin_user = User.objects.create_user(
            username='admin_dashboard', 
            password='start123#', 
            is_staff=True, 
            is_superuser=True
        )
        
        # Staff user
        self.staff_user = User.objects.create_user(
            username='staff_user', 
            password='start123#', 
            is_staff=True
        )
        
        # Regular users
        self.faculty_user = User.objects.create_user(
            username='faculty_user', 
            password='start123#'
        )
        
        self.student_user = User.objects.create_user(
            username='student_user', 
            password='start123#'
        )

        # Create test client
        self.client = Client()

    def _login(self, username, password):
        """Helper method to login and return login data"""
        response = self.client.post('/login/', {
            'username': username,
            'password': password
        })
        
        return response if response.status_code == 200 else None

    def _test_dashboard_access(self, user):
        """Helper method to test dashboard access"""
        # Log in the user
        self.client.force_login(user)
        
        # Try to access dashboard
        response = self.client.get('/dashboard/')
        return response

    def test_admin_dashboard_access(self):
        """Test dashboard access for admin user"""
        # Attempt login
        login_response = self._login('admin_dashboard', 'start123#')
        self.assertIsNotNone(login_response, "Admin login failed")
        
        # Test dashboard access
        dashboard_response = self._test_dashboard_access(self.admin_user)
        self.assertEqual(dashboard_response.status_code, 200, 
                         f"Admin dashboard access failed: {dashboard_response.content}")

    def test_staff_dashboard_access(self):
        """Test dashboard access for staff user"""
        # Attempt login
        login_response = self._login('staff_user', 'start123#')
        self.assertIsNotNone(login_response, "Staff login failed")
        
        # Test dashboard access
        dashboard_response = self._test_dashboard_access(self.staff_user)
        self.assertEqual(dashboard_response.status_code, 200, 
                         f"Staff dashboard access failed: {dashboard_response.content}")

    def test_faculty_dashboard_access(self):
        """Test dashboard access for faculty user"""
        # Attempt login
        login_response = self._login('faculty_user', 'start123#')
        self.assertIsNotNone(login_response, "Faculty user login failed")
        
        # Test dashboard access
        dashboard_response = self._test_dashboard_access(self.faculty_user)
        self.assertEqual(dashboard_response.status_code, 403, 
                         f"Faculty dashboard access should be forbidden: {dashboard_response.content}")

    def test_student_dashboard_access(self):
        """Test dashboard access for student user"""
        # Attempt login
        login_response = self._login('student_user', 'start123#')
        self.assertIsNotNone(login_response, "Student user login failed")
        
        # Test dashboard access
        dashboard_response = self._test_dashboard_access(self.student_user)
        self.assertEqual(dashboard_response.status_code, 403, 
                         f"Student dashboard access should be forbidden: {dashboard_response.content}")

    def test_admin_dashboard_login_details(self):
        """Detailed test for admin_dashboard user login"""
        # Check user exists
        try:
            admin_user = User.objects.get(username='admin_dashboard')
            print("Admin User Details:")
            print(f"  Username: {admin_user.username}")
            print(f"  Is Active: {admin_user.is_active}")
            print(f"  Is Staff: {admin_user.is_staff}")
            print(f"  Is Superuser: {admin_user.is_superuser}")
            print(f"  Password Check: {admin_user.check_password('start123#')}")
        except User.DoesNotExist:
            self.fail("Admin user admin_dashboard does not exist")

        # Attempt authentication
        user = authenticate(username='admin_dashboard', password='start123#')
        self.assertIsNotNone(user, "Authentication failed for admin_dashboard")
        
        # Verify user properties
        self.assertTrue(user.is_active, "Admin user is not active")
        self.assertTrue(user.is_staff, "Admin user is not staff")
        self.assertTrue(user.is_superuser, "Admin user is not a superuser")
        
        # Attempt login via client
        login_response = self._login('admin_dashboard', 'start123#')
        self.assertIsNotNone(login_response, "Login via client failed")
        self.assertEqual(login_response.status_code, 200, 
                         f"Login failed with response: {login_response.content}")
        
        # Test dashboard access
        dashboard_response = self._test_dashboard_access(self.admin_user)
        self.assertEqual(dashboard_response.status_code, 200, 
                         f"Admin dashboard access failed: {dashboard_response.content}")
