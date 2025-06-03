from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Fix the admin user by setting a username'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Get the admin user by email
        admin_email = 'admin@example.com'
        try:
            admin = User.objects.get(email=admin_email)
            
            # Set username if it's not set or is an empty string
            if not admin.username or admin.username == '':
                admin.username = 'admin'
                admin.save()
                self.stdout.write(self.style.SUCCESS(f'Successfully set username for admin user {admin_email}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Admin user {admin_email} already has a username: {admin.username}'))
                
            # Ensure the admin is a superuser and staff
            if not admin.is_superuser or not admin.is_staff:
                admin.is_superuser = True
                admin.is_staff = True
                admin.save()
                self.stdout.write(self.style.SUCCESS('Set admin user as superuser and staff'))
                
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Admin user with email {admin_email} does not exist'))
            # Create the admin user if it doesn't exist
            admin = User.objects.create_superuser(
                username='admin',
                email=admin_email,
                password='admin123'
            )
            self.stdout.write(self.style.SUCCESS(f'Created admin user with email {admin_email} and username: admin'))
