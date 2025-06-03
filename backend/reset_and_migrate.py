import os
import sys
import django
from django.conf import settings
from django.db import connection

def reset_and_migrate():
    # Delete all tables
    with connection.cursor() as cursor:
        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        
        # Disable foreign key checks
        cursor.execute('PRAGMA foreign_keys = OFF;')
        
        # Drop all tables
        for table in tables:
            if table != 'sqlite_sequence':
                try:
                    cursor.execute(f'DROP TABLE "{table}";')
                    print(f'Dropped table: {table}')
                except Exception as e:
                    print(f'Error dropping table {table}: {str(e)}')
        
        # Re-enable foreign key checks
        cursor.execute('PRAGMA foreign_keys = ON;')
    
    print('\nRunning migrations...')
    os.system('python manage.py migrate')
    
    print('\nCreating superuser...')
    os.system('python manage.py createsuperuser --username=admin --email=admin@example.com --noinput')
    
    # Set password for the superuser
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        user = User.objects.get(username='admin')
        user.set_password('admin123')
        user.save()
        print('\nSuperuser created/updated successfully!')
        print('Username: admin')
        print('Password: admin123')
    except User.DoesNotExist:
        print('\nError: Could not create superuser')

if __name__ == '__main__':
    # Set up Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()
    
    # Run the reset and migration
    reset_and_migrate()
