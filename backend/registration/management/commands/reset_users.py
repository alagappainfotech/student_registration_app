from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from registration.models import Profile

class Command(BaseCommand):
    help = 'Reset users, keeping only the superadmin'

    def handle(self, *args, **kwargs):
        # Find the superadmin
        superadmin = User.objects.filter(is_superuser=True).first()
        
        if not superadmin:
            self.stdout.write(self.style.ERROR('No superadmin found!'))
            return

        # Delete all other users and their profiles
        users_to_delete = User.objects.exclude(pk=superadmin.pk)
        profiles_to_delete = Profile.objects.exclude(user=superadmin)

        # Log the number of users and profiles to be deleted
        user_count = users_to_delete.count()
        profile_count = profiles_to_delete.count()

        # Delete profiles first to avoid foreign key constraints
        profiles_to_delete.delete()
        users_to_delete.delete()

        # Create sample users
        users_data = [
            {
                'username': 'admin_faculty',
                'email': 'admin_faculty@university.edu',
                'password': 'faculty123',
                'first_name': 'Admin',
                'last_name': 'Faculty',
                'is_staff': True,
                'role': 'faculty'
            },
            {
                'username': 'student1',
                'email': 'student1@university.edu',
                'password': 'student123',
                'first_name': 'John',
                'last_name': 'Doe',
                'role': 'student'
            },
            {
                'username': 'student2',
                'email': 'student2@university.edu',
                'password': 'student456',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'role': 'student'
            }
        ]

        # Create new users and profiles
        for user_info in users_data:
            user = User.objects.create_user(
                username=user_info['username'],
                email=user_info['email'],
                password=user_info['password'],
                first_name=user_info['first_name'],
                last_name=user_info['last_name'],
                is_staff=user_info.get('is_staff', False)
            )

            # Create corresponding profile
            Profile.objects.create(
                user=user,
                role=user_info['role']
            )

        self.stdout.write(self.style.SUCCESS(f'Deleted {user_count} users and {profile_count} profiles'))
        self.stdout.write(self.style.SUCCESS('Created new sample users'))
