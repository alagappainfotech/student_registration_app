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

def check_and_reset_passwords(default_password='start123#'):
    users = User.objects.all()
    
    print("Checking and resetting passwords for all users:")
    for user in users:
        print(f"\nUser: {user.username}")
        print(f"  Current password hash: {user.password}")
        
        # Check if password is already set to default
        is_correct = check_password(default_password, user.password)
        
        if not is_correct:
            print(f"  Resetting password to: {default_password}")
            user.set_password(default_password)
            user.save()
            print("  Password reset complete")
        else:
            print("  Password already set correctly")

# Run the password check and reset
check_and_reset_passwords()
