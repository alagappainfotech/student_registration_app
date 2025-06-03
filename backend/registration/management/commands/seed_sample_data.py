import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from registration.models import (
    Organization, Class, Section, Course, Faculty, Student, Enrollment, Grade, RegistrationRequest
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with sample data for testing and development'

    def handle(self, *args, **options):
        self.stdout.write('Seeding sample data...')
        
        # Create Organizations
        org1 = Organization.objects.create(
            name='Tech University',
            address='123 Education St, Tech City',
            is_internal=True
        )
        
        # Create Classes
        class1 = Class.objects.create(
            name='Class 10',
            organization=org1
        )
        
        class2 = Class.objects.create(
            name='Class 11',
            organization=org1
        )
        
        # Create Sections
        sections = []
        section1 = Section.objects.create(
            name='A',
            class_obj=class1
        )
        sections.append(section1)
        
        section2 = Section.objects.create(
            name='B',
            class_obj=class2
        )
        sections.append(section2)
        
        # Create Courses
        course_data = [
            {'name': 'Introduction to Programming', 'code': 'CS101', 'description': 'Basic programming concepts'},
            {'name': 'Database Systems', 'code': 'CS201', 'description': 'Introduction to database management'},
            {'name': 'Web Development', 'code': 'CS301', 'description': 'Building web applications'},
            {'name': 'Calculus I', 'code': 'MATH101', 'description': 'Introduction to calculus'},
            {'name': 'Physics I', 'code': 'PHYS101', 'description': 'Introduction to physics'},
            {'name': 'English Composition', 'code': 'ENG101', 'description': 'Basic writing skills'},
        ]
        
        course_objects = []
        for course_info in course_data:
            # Check if course already exists
            course, created = Course.objects.get_or_create(
                code=course_info['code'],
                defaults={
                    'name': course_info['name'],
                    'description': course_info['description'],
                    'organization': org1,
                    'credits': 4 if course_info['code'] in ['CS101', 'CS201', 'CS301', 'PHYS101'] else 3
                }
            )
            course_objects.append(course)
        
        # Import Profile model
        from registration.models import Profile
        
        # Create Users and Faculty
        faculty_data = [
            {'email': 'faculty1@aae.com', 'first_name': 'John', 'last_name': 'Smith', 'department': 'computer_science'},
            {'email': 'faculty2@aae.com', 'first_name': 'Sarah', 'last_name': 'Johnson', 'department': 'mathematics'},
            {'email': 'faculty3@aae.com', 'first_name': 'Michael', 'last_name': 'Brown', 'department': 'physics'},
        ]
        
        faculty_objects = []
        for i, faculty_info in enumerate(faculty_data):
            # Check if user already exists
            user, created = User.objects.get_or_create(
                email=faculty_info['email'],
                defaults={
                    'first_name': faculty_info['first_name'],
                    'last_name': faculty_info['last_name']
                }
            )
            
            if created:
                user.set_password('faculty123')
                user.save()
            
            # Create or update the profile
            profile, _ = Profile.objects.update_or_create(
                user=user,
                defaults={
                    'role': 'faculty',
                    'is_faculty': True
                }
            )
            
            # Create or update the faculty profile
            faculty, _ = Faculty.objects.update_or_create(
                user=user,
                defaults={
                    'organization': org1,
                    'name': f"{faculty_info['first_name']} {faculty_info['last_name']}",
                    'email': faculty_info['email'],
                    'phone': f'555-010{i+1}',
                    'department': faculty_info['department'],
                    'qualification': 'masters'
                }
            )
            faculty_objects.append(faculty)
        
        # Set up faculty courses by updating the primary_faculty field in Course
        course_objects[0].primary_faculty = faculty_objects[0]  # CS101
        course_objects[1].primary_faculty = faculty_objects[0]  # CS201
        course_objects[2].primary_faculty = faculty_objects[1]  # CS301
        course_objects[3].primary_faculty = faculty_objects[1]  # MATH101
        course_objects[4].primary_faculty = faculty_objects[2]  # PHYS101
        course_objects[5].primary_faculty = faculty_objects[2]  # ENG101
        
        # Save all course updates
        for course in course_objects:
            course.save()
        
        # Create Students
        student_data = [
            {'email': 'student1@aae.com', 'first_name': 'Alice', 'last_name': 'Williams'},
            {'email': 'student2@aae.com', 'first_name': 'Bob', 'last_name': 'Jones'},
            {'email': 'student3@aae.com', 'first_name': 'Carol', 'last_name': 'Davis'},
            {'email': 'student4@aae.com', 'first_name': 'David', 'last_name': 'Miller'},
        ]
        
        student_objects = []
        for i, student_info in enumerate(student_data):
            # Check if user already exists
            user, created = User.objects.get_or_create(
                email=student_info['email'],
                defaults={
                    'first_name': student_info['first_name'],
                    'last_name': student_info['last_name']
                }
            )
            
            if created:
                user.set_password('student123')
                user.save()
            
            # Create or update the profile
            profile, _ = Profile.objects.update_or_create(
                user=user,
                defaults={
                    'role': 'student',
                    'is_student': True
                }
            )
            
            # Create or update the student profile
            student, _ = Student.objects.update_or_create(
                user=user,
                defaults={
                    'organization': org1,
                    'class_obj': class1 if i < 2 else class2,
                    'section': sections[0] if i % 2 == 0 else sections[1],
                    'name': f"{student_info['first_name']} {student_info['last_name']}",
                    'email': student_info['email'],
                    'phone': f'555-020{i+1}',
                    'date_of_birth': date(2000, 1, 1) + timedelta(days=i*100),
                    'address': f'{100 + i} Student St, Tech City',
                    'registration_date': date(2023, 9, 1)
                }
            )
            student_objects.append(student)
        
        # Create Enrollments and Grades
        for i, student in enumerate(student_objects):
            for j, course in enumerate(course_objects[:3]):  # Enroll in first 3 courses
                enrollment = Enrollment.objects.create(
                    student=student,
                    course=course,
                    class_obj=student.class_obj,
                    section=student.section,
                    enrolled_at=date(2023, 9, 1) + timedelta(days=j)
                )
                
                # Create grades for completed courses (first 2)
                if j < 2:
                    Grade.objects.create(
                        enrollment=enrollment,
                        value=random.choice(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C']),
                        graded_at=date(2023, 12, 15)
                    )
        
        # Create some registration requests
        admin_user = User.objects.get(email='admin@example.com')
        for i in range(3):
            RegistrationRequest.objects.create(
                name=f'New{i}',
                email=f'newstudent{i}@example.com',
                phone='1234567890',
                role='student',
                message=f'Interested in joining {("Computer Science" if i % 2 == 0 else "Information Technology")} program.',
                status='pending',
                processed_by=admin_user
            )
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded sample data!'))
        self.print_credentials()
    
    def print_credentials(self):
        self.stdout.write(self.style.SUCCESS('\nSample Credentials:'))
        self.stdout.write(self.style.SUCCESS('-------------------'))
        self.stdout.write(self.style.SUCCESS('Admin:'))
        self.stdout.write('  Email: admin@example.com')
        self.stdout.write('  Password: admin123\n')
        
        self.stdout.write(self.style.SUCCESS('Faculty:'))
        for i in range(1, 4):
            self.stdout.write(f'  Email: faculty{i}@example.com')
            self.stdout.write('  Password: faculty123\n')
        
        self.stdout.write(self.style.SUCCESS('Students:'))
        for i in range(1, 5):
            self.stdout.write(f'  Email: student{i}@example.com')
            self.stdout.write('  Password: student123\n')
