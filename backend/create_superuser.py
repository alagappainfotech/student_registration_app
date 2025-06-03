import os
import django

def create_superuser():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()
    
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    # Check if a user with this email already exists
    if not User.objects.filter(email='admin@example.com').exists():
        # Create superuser
        user = User.objects.create_superuser(
            email='admin@example.com',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )
        print('Superuser created successfully!')
        print(f'Email: admin@example.com')
        print(f'Password: admin123')
    else:
        # Update existing user
        user = User.objects.get(email='admin@example.com')
        user.set_password('admin123')
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print('Superuser updated successfully!')

if __name__ == '__main__':
    create_superuser()
