import os
import sys
import django
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.core.wsgi import get_wsgi_application

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
application = get_wsgi_application()
User = get_user_model()

def check_user_password(username, password):
    try:
        user = User.objects.get(username=username)
        print(f"User found: {username}")
        print(f"Password hash: {user.password}")
        
        # Check password
        is_correct = check_password(password, user.password)
        print(f"Password correct: {is_correct}")
        
        return is_correct
    except User.DoesNotExist:
        print(f"No user found with username {username}")
        return False

# Test admin_dashboard login
result = check_user_password('admin_dashboard', 'start123#')
print(f"\nPassword Check Result: {'Passed' if result else 'Failed'}")
