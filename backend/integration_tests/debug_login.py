import os
import sys
import django
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def test_login(username, password):
    print(f"Attempting to authenticate: {username}")
    
    # Check if user exists
    try:
        user = User.objects.get(username=username)
        print("User found:")
        print(f"  Username: {user.username}")
        print(f"  Is Active: {user.is_active}")
        print(f"  Is Staff: {user.is_staff}")
        print(f"  Is Superuser: {user.is_superuser}")
        print(f"  Password valid: {user.check_password(password)}")
    except User.DoesNotExist:
        print(f"No user found with username {username}")
        return False
    
    # Attempt authentication
    auth_user = authenticate(username=username, password=password)
    
    if auth_user:
        print("Authentication successful!")
        return True
    else:
        print("Authentication failed!")
        return False

# Test admin_dashboard login
result = test_login('admin_dashboard', 'start123#')
print(f"\nLogin Result: {'Success' if result else 'Failure'}")
