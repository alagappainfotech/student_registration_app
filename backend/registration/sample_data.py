from django.contrib.auth import get_user_model
from registration.models import (
    Organization, Class, Section, Course, Faculty, Student, Enrollment, Grade, Profile, Fees
)
from django.utils import timezone

User = get_user_model()

def create_sample_data():
    # Organizations
    org1 = Organization.objects.create(name="Acme University", address="123 Main St", is_internal=True)
    org2 = Organization.objects.create(name="Global Institute", address="456 Global Ave", is_internal=False)

    # Classes
    class1 = Class.objects.create(name="10th Grade", organization=org1)
    class2 = Class.objects.create(name="12th Grade", organization=org2)

    # Sections
    sectionA = Section.objects.create(name="A", class_obj=class1)
    sectionB = Section.objects.create(name="B", class_obj=class2)

    # Courses
    course_math = Course.objects.create(name="Mathematics", description="Math Course", organization=org1, fees=15000, budget={"faculty_cost": 4000, "materials_cost": 2000, "admin_cost": 1000, "profit_margin": 0.15, "base_cost": 10000, "final_fee": 15000})
    course_sci = Course.objects.create(name="Science", description="Science Course", organization=org1, fees=18000, budget={"faculty_cost": 5000, "materials_cost": 3000, "admin_cost": 1200, "profit_margin": 0.18, "base_cost": 12000, "final_fee": 18000})

    # Fees details
    Fees.objects.create(course=course_math, base_cost=10000, faculty_cost=4000, materials_cost=2000, admin_cost=1000, profit_margin=0.15, final_fee=15000)
    Fees.objects.create(course=course_sci, base_cost=12000, faculty_cost=5000, materials_cost=3000, admin_cost=1200, profit_margin=0.18, final_fee=18000)

    # Faculty Users & Profiles
    fuser1 = User.objects.create_user(username="faculty1", email="faculty1@acme.edu", password="faculty123")
    Profile.objects.create(user=fuser1, role="faculty")
    faculty1 = Faculty.objects.create(user=fuser1, organization=org1, name="Dr. Smith", email="faculty1@acme.edu", phone="1111111111", address="Acme Dormitory")

    fuser2 = User.objects.create_user(username="faculty2", email="faculty2@global.edu", password="faculty123")
    Profile.objects.create(user=fuser2, role="faculty")
    faculty2 = Faculty.objects.create(user=fuser2, organization=org2, name="Dr. Jane", email="faculty2@global.edu", phone="2222222222", address="Global Dormitory")

    # Student Users & Profiles
    suser1 = User.objects.create_user(username="student1", email="student1@acme.edu", password="student123")
    Profile.objects.create(user=suser1, role="student")
    student1 = Student.objects.create(user=suser1, organization=org1, class_obj=class1, section=sectionA, name="Alice", email="student1@acme.edu", phone="3333333333", date_of_birth="2007-01-01", address="Acme Hostel")
    student1.courses.set([course_math, course_sci])

    suser2 = User.objects.create_user(username="student2", email="student2@global.edu", password="student123")
    Profile.objects.create(user=suser2, role="student")
    student2 = Student.objects.create(user=suser2, organization=org2, class_obj=class2, section=sectionB, name="Bob", email="student2@global.edu", phone="4444444444", date_of_birth="2006-02-02", address="Global Hostel")
    student2.courses.set([course_math])

    # Admin user
    adminuser = User.objects.create_superuser(username="admin", email="admin@acme.edu", password="admin123")
    Profile.objects.create(user=adminuser, role="admin")

    # Enrollments
    enrollment1 = Enrollment.objects.create(student=student1, course=course_math, faculty=faculty1, class_obj=class1, section=sectionA)
    enrollment2 = Enrollment.objects.create(student=student1, course=course_sci, faculty=faculty1, class_obj=class1, section=sectionA)
    enrollment3 = Enrollment.objects.create(student=student2, course=course_math, faculty=faculty2, class_obj=class2, section=sectionB)

    # Grades
    Grade.objects.create(enrollment=enrollment1, value="A+")
    Grade.objects.create(enrollment=enrollment2, value="B")
    Grade.objects.create(enrollment=enrollment3, value="A")

    print("Sample data created.")

if __name__ == "__main__":
    create_sample_data()
