import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

# Update faculty1 and faculty2 to be staff
faculty1 = User.objects.get(username='faculty1')
faculty1.is_staff = True
faculty1.save()

faculty2 = User.objects.get(username='faculty2')
faculty2.is_staff = True
faculty2.save()

print("Faculty1 and Faculty2 have been set as staff members.")
print(f"faculty1 staff status: {faculty1.is_staff}")
print(f"faculty2 staff status: {faculty2.is_staff}")
