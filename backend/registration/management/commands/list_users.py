from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from registration.models import Profile

class Command(BaseCommand):
    help = 'List all users with their roles and profile information'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Get all users with their profiles
        users = User.objects.select_related('profile').all()
        
        if not users.exists():
            self.stdout.write(self.style.WARNING('No users found in the database.'))
            return
        
        # Print header
        self.stdout.write('\n' + '='*80)
        self.stdout.write('{:^5} | {:<30} | {:<20} | {:<20}'.format(
            'ID', 'Email', 'Is Staff', 'Is Superuser'))
        self.stdout.write('-'*80)
        
        # Print each user
        for user in users:
            self.stdout.write('{:5} | {:<30} | {:<20} | {:<20}'.format(
                user.id,
                user.email,
                'Yes' if user.is_staff else 'No',
                'Yes' if user.is_superuser else 'No'
            ))
            
            # Print profile information if it exists
            try:
                if hasattr(user, 'profile'):
                    profile = user.profile
                    self.stdout.write('     | - Role: {}'.format(profile.role if hasattr(profile, 'role') else 'Not set'))
                    self.stdout.write('     | - First Name: {}'.format(user.first_name or 'Not set'))
                    self.stdout.write('     | - Last Name: {}'.format(user.last_name or 'Not set'))
                    self.stdout.write('     | - Phone: {}'.format(profile.phone_number or 'Not set'))
                    self.stdout.write('     | - Address: {}'.format(profile.address or 'Not set'))
                else:
                    self.stdout.write('     | - No profile found')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'     | Error fetching profile: {str(e)}'))
            
            self.stdout.write('-'*80)
        
        self.stdout.write('='*80 + '\n')
        self.stdout.write(self.style.SUCCESS(f'Found {users.count()} user(s) in the database.'))
