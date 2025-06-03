import random
import string
import uuid
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.utils import timezone
from registration.models import (
    Organization, Course, Class, Section, 
    Profile, Faculty, Student, Enrollment, Grade
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the database with sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Starting to seed database...')
        
        with transaction.atomic():
            self.create_groups_and_permissions()
            self.create_organizations()
            self.create_courses()
            self.create_classes_and_sections()
            self.create_admin_user()
            self.create_faculty_users(3)
            self.create_student_users(10)
            self.create_enrollments()
            self.create_grades()
        
        self.stdout.write(self.style.SUCCESS('Successfully populated the database with sample data!'))
    
    def create_groups_and_permissions(self):
        self.stdout.write('Creating groups and permissions...')
        
        # Create groups if they don't exist
        admin_group, _ = Group.objects.get_or_create(name='admin')
        faculty_group, _ = Group.objects.get_or_create(name='faculty')
        student_group, _ = Group.objects.get_or_create(name='student')
        
        # Assign permissions (simplified for example)
        # In a real app, you'd assign specific permissions here
        self.stdout.write('Groups and permissions created.')
    
    def create_organizations(self):
        self.stdout.write('Creating organizations...')
        
        orgs = [
            {'name': 'Computer Science Department', 'address': '123 CS Building, University Campus', 'is_internal': True},
            {'name': 'Mathematics Department', 'address': '456 Math Building, University Campus', 'is_internal': True},
            {'name': 'Physics Department', 'address': '789 Physics Building, University Campus', 'is_internal': True},
        ]
        
        for org_data in orgs:
            org, created = Organization.objects.get_or_create(
                name=org_data['name'],
                defaults={
                    'address': org_data['address'],
                    'is_internal': org_data['is_internal']
                }
            )
            if created:
                self.stdout.write(f'Created organization: {org.name}')
    
    def create_courses(self):
        self.stdout.write('Creating courses...')
        
        # Get an organization to associate with courses
        org = Organization.objects.first()
        if not org:
            self.stderr.write('No organizations found. Please create organizations first.')
            return
            
        courses = [
            {'name': 'Introduction to Computer Science', 'description': 'Basic concepts of computer science', 'fees': 1000.00},
            {'name': 'Calculus I', 'description': 'Introduction to differential and integral calculus', 'fees': 900.00},
            {'name': 'Physics for Engineers', 'description': 'Fundamental physics concepts for engineering students', 'fees': 950.00},
            {'name': 'Data Structures', 'description': 'Study of fundamental data structures', 'fees': 1100.00},
            {'name': 'Algorithms', 'description': 'Design and analysis of algorithms', 'fees': 1200.00},
        ]
        
        for course_data in courses:
            course, created = Course.objects.get_or_create(
                name=course_data['name'],
                organization=org,
                defaults={
                    'description': course_data['description'],
                    'fees': course_data['fees'],
                    'start_date': '2025-09-01',
                    'end_date': '2025-12-15',
                    'daily_duration': timedelta(hours=1, minutes=30)
                }
            )
            if created:
                self.stdout.write(f'Created course: {course.name}')
    
    def create_classes_and_sections(self):
        self.stdout.write('Creating classes and sections...')
        
        # Create classes
        class_names = ['A', 'B', 'C', 'D', 'E']
        classes = []
        
        for i, name in enumerate(class_names, 1):
            class_obj, created = Class.objects.get_or_create(
                name=f'Class {name}',
                organization=Organization.objects.first(),
                defaults={
                    'created_at': timezone.now(),
                    'updated_at': timezone.now()
                }
            )
            if created:
                self.stdout.write(f'Created class: {class_obj.name}')
                classes.append(class_obj)
        
        # Create sections for each class
        for class_obj in classes:
            for i in range(1, 3):  # 2 sections per class
                section, created = Section.objects.get_or_create(
                    name=f'Section {i}',
                    class_obj=class_obj,
                    defaults={
                        'created_at': timezone.now(),
                        'updated_at': timezone.now()
                    }
                )
                if created:
                    self.stdout.write(f'  - Created section {section.name} for {class_obj.name}')
    
    def create_admin_user(self):
        self.stdout.write('Checking admin user...')
        username = 'admin'
        email = 'admin@example.com'
        password = 'admin123'
        
        # Check if admin user already exists
        if get_user_model().objects.filter(username=username).exists():
            self.stdout.write('Admin user already exists, skipping creation')
            return
            
        # Create admin user if it doesn't exist
        try:
            admin = get_user_model().objects.create_superuser(
                username=username,
                email=email,
                password=password,
                first_name='Admin',
                last_name='User'
            )
            
            # Create profile for admin
            Profile.objects.create(
                user=admin,
                role='admin',
                is_admin=True,
                is_faculty=False,
                is_student=False
            )
            
            # Add to admin group
            admin_group, _ = Group.objects.get_or_create(name='admin')
            admin.groups.add(admin_group)
            
            self.stdout.write('Created admin user: admin / admin123')
            return admin
            
        except Exception as e:
            self.stderr.write(f'Error creating admin user: {str(e)}')
            return None
    
    def create_faculty_users(self, count=3):
        self.stdout.write(f'Creating {count} faculty users...')
        
        orgs = list(Organization.objects.all())
        if not orgs:
            self.stdout.write('No organizations found. Please create organizations first.')
            return
            
        courses = list(Course.objects.all())
        if not courses:
            self.stdout.write('No courses found. Please create courses first.')
            return
        
        faculty_names = [
            ('Robert', 'Johnson'), ('Jennifer', 'Williams'), ('Michael', 'Brown'),
            ('Linda', 'Jones'), ('William', 'Garcia'), ('Elizabeth', 'Miller'),
            ('David', 'Davis'), ('Barbara', 'Rodriguez'), ('Richard', 'Martinez'),
            ('Susan', 'Hernandez')
        ]
        
        for i in range(1, count + 1):
            if i <= len(faculty_names):
                first_name, last_name = faculty_names[i-1]
            else:
                first_name = random.choice(['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah'])
                last_name = random.choice(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'])
                
            username = f'faculty{i}'
            email = f'faculty{i}@example.com'
            
            # Check if user exists
            if get_user_model().objects.filter(username=username).exists():
                self.stdout.write(f'Faculty user {username} already exists, skipping...')
                continue
                
            # Create user if not exists
            try:
                user = get_user_model().objects.create_user(
                    username=username,
                    email=email,
                    password='faculty123',
                    first_name=first_name,
                    last_name=last_name
                )
            except Exception as e:
                self.stderr.write(f'Error creating faculty user {username}: {str(e)}')
                continue
            
            # Create or update profile
            Profile.objects.update_or_create(
                user=user,
                defaults={
                    'role': 'faculty',
                    'is_faculty': True,
                    'is_admin': False,
                    'is_student': False
                }
            )
            
            # Create or update faculty record
            org = random.choice(orgs)
            department = random.choice(['Computer Science', 'Mathematics', 'Physics', 'Engineering', 'Data Science'])
            specialization = random.choice(['Algorithms', 'Machine Learning', 'Database Systems', 'Web Development', 'Data Analysis'])
            
            faculty, _ = Faculty.objects.update_or_create(
                user=user,
                defaults={
                    'organization': org,
                    'name': f'{first_name} {last_name}',
                    'email': email,
                    'phone': f'+1987654{i:03d}',
                    'address': f'{i} Faculty St, City, Country',
                    'qualification': random.choice(['phd', 'masters', 'bachelors', 'diploma', 'certification']),
                    'specialization': specialization,
                    'years_of_experience': random.randint(1, 20),
                    'department': department,
                    'hire_date': timezone.now() - timedelta(days=random.randint(365, 3650))  # 1-10 years ago
                }
            )
            
            faculties.append(faculty)
            
            # Add to faculty group
            faculty_group, _ = Group.objects.get_or_create(name='faculty')
            user.groups.add(faculty_group)
            
            # Create profile
            Profile.objects.update_or_create(
                user=user,
                defaults={
                    'role': 'faculty',
                    'is_faculty': True
                }
            )
            
            self.stdout.write(f'Created faculty user: {username} / faculty123')
        
        # After creating all faculties, assign courses
        faculties = list(Faculty.objects.all())
        
        # First, ensure all courses have an organization
        default_org = Organization.objects.first()
        Course.objects.filter(organization__isnull=True).update(organization=default_org)
        
        # Assign courses to faculties
        for faculty in faculties:
            # Get courses that don't have a primary faculty yet
            available_courses = list(Course.objects.filter(primary_faculty__isnull=True, organization=faculty.organization))
            
            # If no available courses, skip this faculty
            if not available_courses:
                print(f'No available courses for {faculty.name}')
                continue
                
            # Assign 1-3 courses to this faculty
            num_courses = min(random.randint(1, 3), len(available_courses))
            faculty_courses = random.sample(available_courses, num_courses)
            
            for course in faculty_courses:
                course.primary_faculty = faculty
                course.organization = faculty.organization
                course.save()
                print(f'Assigned {faculty.name} as primary faculty for {course.name} in {faculty.organization.name}')
                
                # Print enrollment information for verification
                enrollments = Enrollment.objects.filter(course=course)
                print(f'  - Course has {enrollments.count()} enrollments')
                for enrollment in enrollments:
                    print(f'    - Student: {enrollment.student.name} in {course.name}')
        
        # For any remaining courses without a primary faculty, assign them randomly
        remaining_courses = Course.objects.filter(primary_faculty__isnull=True)
        if remaining_courses.exists():
            print(f'Assigning primary faculty to {remaining_courses.count()} remaining courses')
            for course in remaining_courses:
                # Get a random faculty from the same organization
                org_faculties = list(Faculty.objects.filter(organization=course.organization))
                if org_faculties:
                    faculty = random.choice(org_faculties)
                    course.primary_faculty = faculty
                    course.save()
                    print(f'Assigned {faculty.name} as primary faculty for remaining course {course.name}')
                else:
                    print(f'No faculty available for course {course.name}')
    
    def create_student_users(self, count=10):
        self.stdout.write(f'Creating {count} student users...')
        
        orgs = list(Organization.objects.all())
        if not orgs:
            self.stdout.write('No organizations found. Please create organizations first.')
            return
            
        classes = list(Class.objects.all())
        if not classes:
            self.stdout.write('No classes found. Please create classes first.')
            return
            
        sections = list(Section.objects.all())
        if not sections:
            self.stdout.write('No sections found. Please create sections first.')
            return
            
        student_names = [
            ('James', 'Smith'), ('Mary', 'Johnson'), ('John', 'Williams'),
            ('Patricia', 'Brown'), ('Robert', 'Jones'), ('Jennifer', 'Garcia'),
            ('Michael', 'Miller'), ('Linda', 'Davis'), ('William', 'Rodriguez'),
            ('Elizabeth', 'Martinez')
        ]
        
        for i in range(1, count + 1):
            if i <= len(student_names):
                first_name, last_name = student_names[i-1]
            else:
                first_name = random.choice(['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah'])
                last_name = random.choice(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'])
                
            username = f'student{i}'
            base_email = f'student{i}@example.com'
            
            # Check if user exists
            if get_user_model().objects.filter(username=username).exists():
                self.stdout.write(f'Student user {username} already exists, skipping...')
                continue
                
            # Create user if not exists
            try:
                user = get_user_model().objects.create_user(
                    username=username,
                    email=base_email,
                    password='student123',
                    first_name=first_name,
                    last_name=last_name
                )
            except Exception as e:
                self.stderr.write(f'Error creating student user {username}: {str(e)}')
                continue
            
            # Create or update profile
            Profile.objects.update_or_create(
                user=user,
                defaults={
                    'role': 'student',
                    'is_student': True,
                    'is_admin': False,
                    'is_faculty': False
                }
            )
            
            # Select random org, class, and section
            org = random.choice(orgs)
            class_obj = random.choice(classes)
            class_sections = [s for s in sections if s.class_obj == class_obj]
            section = random.choice(class_sections) if class_sections else None
            
            if not section:
                section = random.choice(sections)
                class_obj = section.class_obj
            
            # Generate a unique email
            email = f'{first_name.lower()}.{last_name.lower()}{i}@example.com'
            counter = 1
            while Student.objects.filter(email=email).exists():
                email = f'{first_name.lower()}.{last_name.lower()}{i}.{counter}@example.com'
                counter += 1
            
            # Create or update student record
            student, _ = Student.objects.update_or_create(
                user=user,
                defaults={
                    'organization': org,
                    'name': f'{first_name} {last_name}',
                    'email': email,
                    'phone': f'+1987654{i:03d}',
                    'date_of_birth': f'20{random.randint(0, 5):02d}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}',
                    'address': f'{i} Student St, City, Country',
                    'class_obj': class_obj,
                    'section': section,
                    'student_id': uuid.uuid4(),
                    'registration_id': uuid.uuid4(),
                    'registration_date': timezone.now() - timedelta(days=random.randint(1, 365))
                }
            )
            
            # Add to student group
            student_group, _ = Group.objects.get_or_create(name='student')
            user.groups.add(student_group)
            
            self.stdout.write(f'Created student user: {username} / student123')
    
    def create_enrollments(self):
        self.stdout.write('Creating enrollments...')
        
        students = Student.objects.all()
        courses = Course.objects.all()
        
        for student in students:
            # Enroll each student in 3-5 random courses
            num_courses = random.randint(3, min(5, len(courses)))
            selected_courses = random.sample(list(courses), num_courses)
            
            for course in selected_courses:
                # Get the class and section for the student
                class_obj = student.class_obj
                section = student.section
                
                # Create enrollment
                enrollment = Enrollment.objects.create(
                    student=student,
                    course=course,
                    class_obj=class_obj,
                    section=section,
                    enrolled_at=timezone.now() - timedelta(days=random.randint(1, 30))
                )
                
                # Add grade for some enrollments (30% chance)
                if random.random() > 0.7:
                    Grade.objects.create(
                        enrollment=enrollment,
                        value=random.choice(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F']),
                        graded_at=timezone.now()
                    )
                
                self.stdout.write(f'  - Enrolled {student.name} in {course.name}')
    
    def create_grades(self):
        self.stdout.write('Creating grades...')
        
        enrollments = Enrollment.objects.all()
        
        for enrollment in enrollments:
            # Only add grades for some enrollments (30% chance)
            if random.random() > 0.7:
                continue
                
            # Create a grade if one doesn't exist
            if not Grade.objects.filter(enrollment=enrollment).exists():
                grade_value = random.choice(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'])
                
                Grade.objects.create(
                    enrollment=enrollment,
                    value=grade_value,
                    graded_at=timezone.now() - timedelta(days=random.randint(1, 30))
                )
                
                self.stdout.write(f'Added grade {grade_value} for {enrollment.student.name} in {enrollment.course.name}')
