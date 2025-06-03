import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from registration.models import Profile, Faculty, Student, Organization, Class, Section

User = get_user_model()

# Create organization, class, section if not exist
org, _ = Organization.objects.get_or_create(name='TestOrg', defaults={'address': '123 Main St'})
class_obj, _ = Class.objects.get_or_create(name='10th Grade', organization=org)
section, _ = Section.objects.get_or_create(name='A', class_obj=class_obj)

# Faculty user
faculty_user, _ = User.objects.get_or_create(username='faculty1', email='faculty1@example.com')
faculty_user.set_password('faculty123')
faculty_user.save()
Profile.objects.get_or_create(user=faculty_user, role='faculty')
Faculty.objects.get_or_create(user=faculty_user, organization=org, name='Faculty One', email='faculty1@example.com', phone='1234567890')

# Student user
student_user, _ = User.objects.get_or_create(username='student1', email='student1@example.com')
student_user.set_password('student123')
student_user.save()
Profile.objects.get_or_create(user=student_user, role='student')
Student.objects.get_or_create(user=student_user, organization=org, class_obj=class_obj, section=section, name='Student One', email='student1@example.com', phone='0987654321', date_of_birth='2005-01-01', address='456 Main St')

print('Sample users created:')
print('Faculty: faculty1 / faculty123')
print('Student: student1 / student123')
