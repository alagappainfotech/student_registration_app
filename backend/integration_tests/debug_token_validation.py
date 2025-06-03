import os
import sys
import django

# Explicitly set the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
django.setup()

from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.contrib.auth.models import User

def generate_tokens_for_user(username):
    """
    Generate tokens for a specific user
    """
    try:
        user = User.objects.get(username=username)
        
        print(f"=== Token Generation for {username} ===")
        
        # Generate refresh token
        refresh = RefreshToken.for_user(user)
        
        print("Refresh Token:")
        print(f"Token: {str(refresh)}")
        print(f"Payload: {refresh.payload}")
        
        # Generate access token
        access = refresh.access_token
        
        print("\nAccess Token:")
        print(f"Token: {str(access)}")
        print(f"Payload: {access.payload}")
        
        return refresh, access
    
    except User.DoesNotExist:
        print(f"User {username} not found!")
        return None, None

def validate_token(token_str, token_type='access'):
    """
    Validate a token and print its details
    """
    print(f"\n=== Token Validation ({token_type.upper()} Token) ===")
    try:
        if token_type == 'access':
            token = AccessToken(token_str)
        else:
            token = RefreshToken(token_str)
        
        print("Token is valid!")
        print(f"Payload: {token.payload}")
        print(f"Token Type: {token_type}")
        
        return token
    except Exception as e:
        print(f"Token validation failed: {e}")
        return None

def main():
    # Test token generation and validation for different users
    test_users = ['admin_dashboard', 'faculty_user', 'student_user']
    
    for username in test_users:
        refresh, access = generate_tokens_for_user(username)
        
        if refresh and access:
            # Validate both tokens
            validate_token(str(refresh), 'refresh')
            validate_token(str(access), 'access')

if __name__ == '__main__':
    main()
