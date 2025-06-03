from django.contrib.auth import get_user_model
from registration.models import Organization, Class, Section, Course, Faculty, Student, Enrollment, Grade, Profile, Fees

def cleanup_except_superuser():
    User = get_user_model()
    # Keep only superusers
    superusers = User.objects.filter(is_superuser=True)
    User.objects.exclude(id__in=superusers.values_list('id', flat=True)).delete()
    Profile.objects.exclude(user__in=superusers).delete()
    Faculty.objects.exclude(user__in=superusers).delete()
    Student.objects.exclude(user__in=superusers).delete()
    # Clean up all org/data
    Grade.objects.all().delete()
    Enrollment.objects.all().delete()
    Fees.objects.all().delete()
    Course.objects.all().delete()
    Section.objects.all().delete()
    Class.objects.all().delete()
    Organization.objects.all().delete()
    print("Cleanup complete. Only superuser(s) remain.")

if __name__ == "__main__":
    cleanup_except_superuser()
