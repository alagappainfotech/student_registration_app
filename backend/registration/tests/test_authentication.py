from django.contrib.auth.models import User
from django.urls import reverse
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from registration.models import Profile, Student, Faculty, Class, Organization, Section, Course, Enrollment, Grade

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create organization
        self.test_org = Organization.objects.create(
            name='Test Organization',
            address='Test Address'
        )
        
        # Create class
        self.test_class = Class.objects.create(
            name='Test Class',
            organization=self.test_org
        )
        
        # Create section
        self.test_section = Section.objects.create(
            name='A',
            class_obj=self.test_class
        )
        
        # Create admin user
        self.admin_user = User.objects.create_superuser(
            username='admin', 
            email='admin@test.com', 
            password='admin123'
        )
        Profile.objects.create(user=self.admin_user, role='admin')

        # Create faculty user
        self.faculty_user = User.objects.create_user(
            username='faculty1', 
            email='faculty1@test.com', 
            password='faculty123'
        )
        self.faculty_user.is_staff = True
        self.faculty_user.save()
        Profile.objects.create(user=self.faculty_user, role='faculty', is_faculty=True)
        Faculty.objects.create(
            user=self.faculty_user,
            organization=self.test_org,
            name='Test Faculty',
            email='faculty1@test.com',
            phone='9876543210',
            address='Test Faculty Address'
        )

        # Create student user
        self.student_user = User.objects.create_user(
            username='student1', 
            email='student1@test.com', 
            password='student123'
        )
        Profile.objects.create(user=self.student_user, role='student')
        Student.objects.create(
            user=self.student_user, 
            date_of_birth='2000-01-01',
            class_obj=self.test_class,
            section=self.test_section,
            organization=self.test_org,
            name='Test Student',
            email='student1@test.com',
            phone='1234567890',
            address='Test Address'
        )

    def test_admin_login(self):
        """Test login for admin user"""
        url = '/login/'
        data = {
            'username': 'admin',
            'password': 'admin123'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        self.assertIn('refresh_token', response.data)
        self.assertEqual(response.data['role'], 'admin')

    def test_faculty_login(self):
        """Test login for faculty user"""
        url = '/login/'
        data = {
            'username': 'faculty1',
            'password': 'faculty123'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        self.assertIn('refresh_token', response.data)
        self.assertEqual(response.data['role'], 'faculty')

    def test_student_login(self):
        """Test login for student user"""
        url = '/login/'
        data = {
            'username': 'student1',
            'password': 'student123'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        self.assertIn('refresh_token', response.data)
        self.assertEqual(response.data['role'], 'student')

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        url = '/login/'
        data = {
            'username': 'nonexistent',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('tokens', response.data)

    def test_logout(self):
        """Test logout functionality"""
        # First, log in
        login_url = '/login/'
        login_data = {
            'username': 'student1',
            'password': 'student123'
        }
        login_response = self.client.post(login_url, login_data, format='json')
        
        # Verify login was successful
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        
        # Extract access and refresh tokens
        access_token = login_response.data['access_token']
        refresh_token = login_response.data['refresh_token']
        
        # Get the user for force_authenticate
        user = User.objects.get(username='student1')
        
        # Force authentication
        self.client.force_authenticate(user=user)
        
        # Logout
        logout_url = '/logout/'
        logout_data = {
            'refresh': refresh_token
        }
        logout_response = self.client.post(logout_url, logout_data, format='json')
        
        self.assertEqual(logout_response.status_code, status.HTTP_205_RESET_CONTENT)
        
        # Verify token is no longer valid
        refresh_url = '/token/refresh/'
        refresh_data = {
            'refresh_token': refresh_token
        }
        refresh_response = self.client.post(refresh_url, refresh_data, format='json')
        
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        """Test token refresh functionality"""
        # First, log in
        login_url = '/login/'
        login_data = {
            'username': 'faculty1',
            'password': 'faculty123'
        }
        login_response = self.client.post(login_url, login_data, format='json')
        
        # Extract refresh token
        refresh_token = login_response.data['refresh_token']
        
        # Refresh token
        refresh_url = '/token/refresh/'
        refresh_data = {
            'refresh_token': refresh_token
        }
        refresh_response = self.client.post(refresh_url, refresh_data, format='json')
        
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', refresh_response.data)

class DashboardAccessTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create organization
        self.test_org = Organization.objects.create(
            name='Test Organization',
            address='Test Address'
        )
        
        # Create class
        self.test_class = Class.objects.create(
            name='Test Class',
            organization=self.test_org
        )
        
        # Create section
        self.test_section = Section.objects.create(
            name='A',
            class_obj=self.test_class
        )
        
        # Create admin user
        self.admin_user = User.objects.create_superuser(
            username='admin', 
            email='admin@test.com', 
            password='admin123'
        )
        Profile.objects.create(user=self.admin_user, role='admin', is_admin=True)

        # Create student user
        self.student_user = User.objects.create_user(
            username='student1', 
            email='student1@test.com', 
            password='student123'
        )
        Profile.objects.create(user=self.student_user, role='student', is_student=True)
        Student.objects.create(
            user=self.student_user, 
            date_of_birth='2000-01-01',
            class_obj=self.test_class,
            section=self.test_section,
            organization=self.test_org,
            name='Test Student',
            email='student@test.com',
            phone='1234567890',
            address='Test Address'
        )

        # Create faculty user
        self.faculty_user = User.objects.create_user(
            username='faculty1', 
            email='faculty1@test.com', 
            password='faculty123'
        )
        Profile.objects.create(user=self.faculty_user, role='faculty', is_faculty=True)
        Faculty.objects.create(
            user=self.faculty_user,
            organization=self.test_org,
            name='Test Faculty',
            email='faculty@test.com',
            phone='9876543210',
            address='Test Faculty Address'
        )

    def test_admin_dashboard_access(self):
        # Force authenticate admin user
        login_url = '/login/'
        login_data = {
            'username': 'admin',
            'password': 'admin123'
        }
        login_response = self.client.post(login_url, login_data, format='json')
        login_response_data = login_response.json()
        self.assertIn('access_token', login_response_data, f'Login response: {login_response_data}')
        access_token = login_response_data['access_token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Attempt to access admin dashboard
        dashboard_url = '/dashboard/admin/'
        dashboard_response = self.client.get(dashboard_url)
        
        # Verify dashboard access
        self.assertEqual(dashboard_response.status_code, 200)
        
        # Verify dashboard data
        dashboard_data = dashboard_response.json()
        self.assertIn('users', dashboard_data)
        self.assertIn('courses', dashboard_data)
        # Verify the structure of users and courses
        self.assertIn('students', dashboard_data['users'])
        self.assertIn('faculty', dashboard_data['users'])
        self.assertIn('total', dashboard_data['courses'])
        self.assertIn('totalFees', dashboard_data['courses'])
        
        # Print dashboard response details for debugging
        print('=' * 50)
        print('DASHBOARD RESPONSE DETAILS')
        print('=' * 50)
        print(f'Dashboard Response Status: {dashboard_response.status_code}')
        print(f'Dashboard Response Headers: {dashboard_response.headers}')

    def test_student_dashboard_access(self):
        # Login with student credentials
        login_url = '/login/'
        login_data = {
            'username': 'student1',
            'password': 'student123'
        }
        login_response = self.client.post(login_url, login_data, format='json')
        login_response_data = login_response.json()
        self.assertIn('access_token', login_response_data, f'Login response: {login_response_data}')
        access_token = login_response_data['access_token']
            
        # Set authorization header for subsequent requests
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
            
        # Check student dashboard access
        dashboard_response = self.client.get('/dashboard/student/')
            
        # Print dashboard response details for debugging
        print('=' * 50)
        print('DASHBOARD RESPONSE DETAILS')
        print('=' * 50)
        print(f'Dashboard Response Status: {dashboard_response.status_code}')
        print(f'Dashboard Response Headers: {dashboard_response.headers}')
        print(f'Dashboard Response Content: {dashboard_response.content}')
        
        self.assertEqual(dashboard_response.status_code, 200)
        
        # Verify dashboard data
        dashboard_data = dashboard_response.json()
        self.assertIn('enrollments', dashboard_data)
        self.assertIn('grades', dashboard_data)
        # Ensure the lists are valid (might be empty)
        self.assertIsInstance(dashboard_data['enrollments'], list)
        self.assertIsInstance(dashboard_data['grades'], list)

    def test_faculty_dashboard_access(self):
        # Force authenticate faculty user
        login_url = '/login/'
        login_data = {
            'username': 'faculty1',
            'password': 'faculty123'
        }
        login_response = self.client.post(login_url, login_data, format='json')
        login_response_data = login_response.json()
        self.assertIn('access_token', login_response_data, f'Login response: {login_response_data}')
        access_token = login_response_data['access_token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Attempt to access faculty dashboard
        dashboard_url = '/dashboard/faculty/'
        dashboard_response = self.client.get(dashboard_url)
        
        # Verify dashboard access
        self.assertEqual(dashboard_response.status_code, 200, f'Response content: {dashboard_response.content}')
        
        # Verify dashboard data
        dashboard_data = dashboard_response.json()
        self.assertIn('courses', dashboard_data)
        self.assertIn('students', dashboard_data)
        # Ensure the lists are valid (might be empty)
        self.assertIsInstance(dashboard_data['courses'], list)
        self.assertIsInstance(dashboard_data['students'], list)
