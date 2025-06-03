import os
import sys
import json
import django

# Explicitly set the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
django.setup()

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.test import APIClient

def test_login_endpoint():
    """
    Simulate a login request and diagnose potential issues
    """
    print("=== Login Endpoint Diagnostic Tool ===")
    
    # Test credentials
    username = 'admin_dashboard'
    password = 'start123#'
    
    # Direct authentication check
    print("\n1. Direct Authentication Check:")
    user = authenticate(username=username, password=password)
    if user:
        print(f"Authentication successful for user: {user.username}")
        print(f"User is staff: {user.is_staff}")
        print(f"User is superuser: {user.is_superuser}")
    else:
        print("Authentication failed")
    
    # API Client test
    print("\n2. API Client Login Test:")
    client = APIClient()
    
    # Prepare login payload
    login_data = {
        'username': username,
        'password': password
    }
    
    # Try different URL variations
    login_urls = [
        '/login/',
        '/api/login/',
        'login/',
        'api/login/'
    ]
    
    for url in login_urls:
        print(f"\nTesting URL: {url}")
        response = client.post(url, login_data, format='json')
        
        print(f"Status Code: {response.status_code}")
        print("Response Content:")
        try:
            print(json.dumps(response.data, indent=2))
        except Exception as e:
            print(f"Could not parse response: {e}")
            print(response.content)

def list_users():
    """
    List all users in the system
    """
    print("\n=== Registered Users ===")
    for user in User.objects.all():
        print(f"Username: {user.username}, Email: {user.email}, Staff: {user.is_staff}, Superuser: {user.is_superuser}")

if __name__ == '__main__':
    test_login_endpoint()
    list_users()
