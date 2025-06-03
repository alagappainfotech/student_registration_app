import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from registration.models import Profile, Faculty, Student, Organization, Class, Section
from datetime import date

def sync_user_profiles():
    # Get or create a default organization
    org, _ = Organization.objects.get_or_create(
        name='Default University', 
        defaults={'address': 'Campus Address'}
    )

    # Get or create default class and section
    # Find or create a default class for the organization
    default_class = Class.objects.filter(organization=org, name='Default Class').first()
    if not default_class:
        default_class = Class.objects.create(
            name='Default Class', 
            organization=org
        )

    default_section, _ = Section.objects.get_or_create(
        name='Default Section', 
        defaults={'class_obj': default_class}
    )

    # Sync users with profiles and faculty/student records
    users = User.objects.all()
    for user in users:
        # Ensure profile exists
        profile, created = Profile.objects.get_or_create(
            user=user,
            defaults={
                'role': 'admin' if user.is_superuser else 
                        'faculty' if user.is_staff else 
                        'student'
            }
        )
        
        # Sync faculty users
        if user.is_staff and not user.is_superuser:
            Faculty.objects.get_or_create(
                user=user,
                defaults={
                    'organization': org,
                    'name': user.first_name or user.username,
                    'email': user.email
                }
            )
        
        # Sync student users
        if not user.is_staff and not user.is_superuser:
            Student.objects.get_or_create(
                user=user,
                defaults={
                    'organization': org,
                    'name': user.first_name or user.username,
                    'email': user.email,
                    'date_of_birth': date(2000, 1, 1),  # Default date of birth
                    'class_obj': default_class,
                    'section': default_section
                }
            )

    print("User profile synchronization complete.")

if __name__ == '__main__':
    sync_user_profiles()
