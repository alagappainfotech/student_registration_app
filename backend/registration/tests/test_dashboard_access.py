from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from registration.models import Profile, Student, Faculty, Organization, Class, Section

User = get_user_model()

class DashboardAccessTestSuite(TestCase):
    def setUp(self):
        # Create test users for each role
        self.client = APIClient()
        
        # Create default organization
        self.org = Organization.objects.create(
            name='Test Organization', 
            address='Test Address'
        )
        
        # Create a test class and section
        self.test_class = Class.objects.create(
            name='Test Class', 
            organization=self.org
        )
        self.test_section = Section.objects.create(
            name='Test Section', 
            class_obj=self.test_class
        )
        
        # Admin User
        self.admin_user = User.objects.create_user(
            username='admin_test', 
            password='admin_password'
        )
        Profile.objects.create(
            user=self.admin_user, 
            role='admin', 
            is_admin=True
        )
        
        # Faculty User
        self.faculty_user = User.objects.create_user(
            username='faculty_test', 
            password='faculty_password'
        )
        Faculty.objects.create(
            user=self.faculty_user,
            organization=self.org,
            name='Test Faculty',
            email='faculty@test.com',
            phone='1234567890'
        )
        Profile.objects.create(
            user=self.faculty_user, 
            role='faculty', 
            is_faculty=True
        )
        
        # Student User
        self.student_user = User.objects.create_user(
            username='student_test', 
            password='student_password'
        )
        Student.objects.create(
            user=self.student_user,
            organization=self.org,
            class_obj=self.test_class,
            section=self.test_section,
            name='Test Student',
            email='student@test.com',
            phone='9876543210',
            date_of_birth='2000-01-01',
            address='Test Student Address'
        )
        Profile.objects.create(
            user=self.student_user, 
            role='student', 
            is_student=True
        )

    def _login_and_check_dashboard(self, username, password, expected_dashboard_url):
        # Find the user
        user = User.objects.get(username=username)
        
        # Find the user's profile
        profile = Profile.objects.get(user=user)
        
        # Ensure the profile has the correct role based on the dashboard URL
        if '/admin/' in expected_dashboard_url:
            user.is_staff = True
            user.is_superuser = True
            profile.is_admin = True
            profile.role = 'admin'
        elif '/student/' in expected_dashboard_url:
            profile.is_student = True
            profile.role = 'student'
        elif '/faculty/' in expected_dashboard_url:
            profile.is_faculty = True
            profile.role = 'faculty'
        
        user.save()
        profile.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        # Set the authorization header
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Check dashboard access
        print(f"Attempting to access dashboard: {expected_dashboard_url}")
        dashboard_response = self.client.get(
            expected_dashboard_url, 
            format='json'
        )
        
        # Print dashboard response details
        print(f"Dashboard Response Status: {dashboard_response.status_code}")
        print(f"Dashboard Response Content: {dashboard_response.content}")
        print(f"Dashboard Response Headers: {dashboard_response.headers}")
        
        # Assertions
        self.assertEqual(dashboard_response.status_code, 200, 
            f"Dashboard access failed for {username} at {expected_dashboard_url}")
        
        return dashboard_response

    def test_admin_dashboard_access(self):
        dashboard_response = self._login_and_check_dashboard(
            'admin_test', 
            'admin_password', 
            '/dashboard/admin/'
        )
        
        # Additional admin-specific checks
        self.assertIn('courses', dashboard_response.data)
        self.assertIn('course_details', dashboard_response.data)
        self.assertIn('users', dashboard_response.data)
        
        # Verify course details
        course_details = dashboard_response.data.get('course_details', [])
        self.assertTrue(isinstance(course_details, list), "Course details should be a list")
        
        # Verify each course detail has expected fields
        for course in course_details:
            self.assertIn('id', course)
            self.assertIn('name', course)
            self.assertIn('student_count', course)
            self.assertIn('faculty_count', course)

    def test_faculty_dashboard_access(self):
        dashboard_response = self._login_and_check_dashboard(
            'faculty_test', 
            'faculty_password', 
            '/dashboard/faculty/'
        )
        
        # Additional faculty-specific checks
        self.assertIn('courses', dashboard_response.data)
        self.assertIn('students', dashboard_response.data)

    def test_student_dashboard_access(self):
        dashboard_response = self._login_and_check_dashboard(
            'student_test', 
            'student_password', 
            '/dashboard/student/'
        )
        
        # Additional student-specific checks
        self.assertIn('courses', dashboard_response.data)
        self.assertIn('enrollments', dashboard_response.data)
        self.assertIn('grades', dashboard_response.data)

    def test_unauthorized_dashboard_access(self):
        # Test that users cannot access dashboards they're not authorized for
        
        # Admin tries to access student dashboard
        admin_user = User.objects.get(username='admin_test')
        admin_refresh = RefreshToken.for_user(admin_user)
        admin_token = str(admin_refresh.access_token)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        student_dashboard_response = self.client.get('/dashboard/student/')
        self.assertEqual(student_dashboard_response.status_code, 403)
        
        # Student tries to access admin dashboard
        student_user = User.objects.get(username='student_test')
        student_refresh = RefreshToken.for_user(student_user)
        student_token = str(student_refresh.access_token)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {student_token}')
        admin_dashboard_response = self.client.get('/dashboard/admin/')
        self.assertEqual(admin_dashboard_response.status_code, 403)
