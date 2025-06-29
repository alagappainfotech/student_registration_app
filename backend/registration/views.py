from django.shortcuts import render

from rest_framework import generics, status, permissions, serializers
from django.db.models import Count, Sum, DecimalField
from django.db.models.functions import Coalesce
from django.db import models
from rest_framework.permissions import IsAdminUser
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Count, Sum
from django.db.models.functions import Coalesce
from django.db import models

from .models import Student, Organization, Course, Class, Section, Profile, Faculty, Enrollment, Grade
from .serializers import StudentSerializer, OrganizationSerializer, CourseSerializer, ClassSerializer, SectionSerializer, ProfileSerializer, FacultySerializer, EnrollmentSerializer, GradeSerializer

class OrganizationListView(generics.ListAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer

from rest_framework import viewsets

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]  # Allow any authenticated user to access courses
    
    def get_queryset(self):
        queryset = Course.objects.all()
        section_id = self.request.query_params.get('section_id', None)
        
        if section_id:
            # Get all students in this section
            students_in_section = Student.objects.filter(section_id=section_id)
            # Get all course IDs associated with these students
            course_ids = set()
            for student in students_in_section:
                course_ids.update(student.courses.values_list('id', flat=True))
            # Filter courses by these IDs
            queryset = queryset.filter(id__in=course_ids)
            
        return queryset

class ClassListView(generics.ListAPIView):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

class SectionListView(generics.ListAPIView):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer

class AdminDashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Detailed logging for debugging
            print('=' * 50)
            print('DASHBOARD ACCESS ATTEMPT')
            print('=' * 50)
            print(f'User: {request.user}')
            print(f'Is Authenticated: {request.user.is_authenticated}')
            print(f'Is Staff: {request.user.is_staff}')
            print(f'Is Superuser: {request.user.is_superuser}')
            print(f'Request Headers: {request.headers}')
            
            # Check if the user is an admin or has admin role in profile
            # Explicitly check for admin role or superuser/staff status
            is_authorized = (
                request.user.is_superuser or 
                request.user.is_staff
            )
            
            # Additional check for profile if it exists
            try:
                profile = Profile.objects.get(user=request.user)
                is_authorized = is_authorized or profile.is_admin or profile.role == 'admin'
            except Profile.DoesNotExist:
                pass  # We'll rely on superuser/staff status
            
            if not is_authorized:
                print('ACCESS DENIED: Only admin can access this dashboard')
                return Response(
                    {'detail': 'You do not have permission to access this dashboard.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Organization Data
            org_data = {
                'total': Organization.objects.count(),
                'internal': Organization.objects.filter(is_internal=True).count()
            }

            # User Data
            user_data = {
                'students': Student.objects.count(),
                'faculty': Faculty.objects.count()
            }

            # Course Data
            course_data = {
                'total': Course.objects.count(),
                'totalFees': float(Course.objects.aggregate(
                    total_fees=Coalesce(Sum('fees', output_field=models.DecimalField(max_digits=10, decimal_places=2)), 0.0, output_field=models.DecimalField(max_digits=10, decimal_places=2))
                )['total_fees'] or 0.0)
            }

            # Prepare the dashboard data
            # Fetch all courses with additional details
            courses = Course.objects.annotate(
                student_count=Count('enrollments__student', distinct=True)
            ).values(
                'id', 'name', 'fees', 'student_count'
            )
            
            # Format course details and calculate revenue
            course_details = [{
                'id': course['id'],
                'name': course['name'],
                'fees': float(course['fees'] or 0),
                'student_count': course['student_count'],
                'revenue': float(course['fees'] or 0) * course['student_count']
            } for course in courses]
            
            dashboard_data = {
                'users': user_data,
                'courses': course_data,
                'course_details': course_details
            }

            return Response(dashboard_data)
            
        except ValueError as ve:
            print(f"Value Error: {str(ve)}")
            return Response(
                {'detail': 'Invalid data format'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except models.ObjectDoesNotExist as ode:
            print(f"Object Does Not Exist: {str(ode)}")
            return Response(
                {'detail': 'Required data not found'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        except Exception as e:
            print(f"Unexpected Error: {str(e)}")
            return Response(
                {'detail': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = Student.objects.all().order_by('-registration_date')
        search = self.request.query_params.get('search', '')
        field = self.request.query_params.get('field', 'name')

        if search:
            if field == 'name':
                queryset = queryset.filter(name__icontains=search)
            elif field == 'email':
                queryset = queryset.filter(email__icontains=search)
            elif field == 'phone':
                queryset = queryset.filter(phone__icontains=search)
            elif field == 'student_id':
                queryset = queryset.filter(student_id__icontains=search)
            else:
                # Search across multiple fields
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(name__icontains=search) |
                    Q(email__icontains=search) |
                    Q(phone__icontains=search)
                )
        return queryset.prefetch_related('courses')

    def perform_create(self, serializer):
        # Ensure only admin can create students
        if not self.request.user.is_staff and not self.request.user.is_superuser:
            raise PermissionDenied('Only administrators can register students.')
        serializer.save()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        partial = kwargs.pop('partial', False)
        
        # Get the current data
        data = request.data.copy()
        
        # Special handling for course-only updates via PATCH
        if request.method == 'PATCH' and set(data.keys()) == {'courses_ids'}:
            try:
                courses_ids = data.get('courses_ids', [])
                # Convert string IDs to integers if needed
                courses_ids = [int(id) for id in courses_ids]
                
                # Validate that all course IDs exist
                valid_courses = Course.objects.filter(id__in=courses_ids)
                valid_course_ids = set(valid_courses.values_list('id', flat=True))
                
                if set(courses_ids) != valid_course_ids:
                    return Response(
                        {'error': 'One or more invalid course IDs provided'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Update only the courses
                instance.courses.set(valid_courses)
                instance.refresh_from_db()
                
                # Return updated instance
                serializer = self.get_serializer(instance)
                return Response(serializer.data)
                
            except (ValueError, TypeError):
                return Response(
                    {'error': 'Invalid course IDs format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Normal update for other cases
        serializer = self.get_serializer(instance, data=data, partial=partial)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class ProfileListView(generics.ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

class EnrollmentListCreateView(generics.ListCreateAPIView):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer

class GradeListCreateView(generics.ListCreateAPIView):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter grades based on the current user's role"""
        user = self.request.user
        queryset = super().get_queryset()
        
        # If user is a student, only return their grades
        if hasattr(user, 'student_profile'):
            return queryset.filter(enrollment__student__user=user)
            
        # If user is a faculty, return grades for their courses
        if hasattr(user, 'faculty_profile'):
            return queryset.filter(enrollment__course__primary_faculty=user.faculty_profile)
            
        # Admin can see all grades
        if user.is_staff or user.is_superuser:
            return queryset
            
        return queryset.none()
    
    def create(self, request, *args, **kwargs):
        """Handle both single and bulk grade creation"""
        if isinstance(request.data, list):
            return self.bulk_create(request, *args, **kwargs)
        return super().create(request, *args, **kwargs)
    
    def bulk_create(self, request, *args, **kwargs):
        """Handle bulk grade creation"""
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_bulk_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def perform_bulk_create(self, serializer):
        """Save multiple grades in a single transaction"""
        return serializer.save()


class BulkGradeView(APIView):
    """View for bulk grade operations"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        """Bulk create or update grades"""
        serializer = GradeSerializer(data=request.data, many=True)
        if serializer.is_valid():
            try:
                grades = serializer.save()
                return Response(
                    GradeSerializer(grades, many=True).data,
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {'detail': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StudentDashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Detailed logging for debugging
        print('=' * 50)
        print('STUDENT DASHBOARD ACCESS ATTEMPT')
        print('=' * 50)
        print(f'User: {request.user}')
        print(f'Is Authenticated: {request.user.is_authenticated}')
        print(f'Request Headers: {request.headers}')
        print(f'Authentication Type: {request.auth}')
        print(f'Authentication Token: {request.auth}')
        
        # Check if the user is a student
        try:
            profile = Profile.objects.get(user=request.user)
            if not profile.is_student:
                print('ACCESS DENIED: Not a student')
                return Response(
                    {'detail': 'You do not have permission to access this dashboard.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get the student associated with the current user
            student = Student.objects.get(user=request.user)
            
            # Fetch student's personal information
            student_data = {
                'id': student.id,
                'name': student.user.get_full_name(),
                'email': student.user.email,
                'organization': student.organization.name if student.organization else None,
                'class_obj': student.class_obj.name if student.class_obj else None,
                'section': student.section.name if student.section else None,
            }
            
            # Fetch student's current courses
            courses = list(Course.objects.filter(enrollments__student=student).distinct())
            course_data = CourseSerializer(courses, many=True).data
            
            # Fetch student's grades
            grades = Grade.objects.filter(enrollment__student=student).select_related('enrollment__course')
            grade_data = GradeSerializer(grades, many=True).data
            
            dashboard_data = {
                'student': student_data,
                'courses': course_data,
                'grades': grade_data
            }
            
            return Response(dashboard_data)
        
        except Profile.DoesNotExist:
            print('ACCESS DENIED: No profile found')
            return Response(
                {'detail': 'No profile found for this user.'},
                status=status.HTTP_403_FORBIDDEN
            )
        except Student.DoesNotExist:
            print('ACCESS DENIED: No student profile found')
            return Response(
                {'detail': 'No student profile found for this user.'},
                status=status.HTTP_404_NOT_FOUND
            )

class FacultyDashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Detailed logging for debugging
        print('=' * 50)
        print('FACULTY DASHBOARD ACCESS ATTEMPT')
        print('=' * 50)
        print(f'User: {request.user}')
        print(f'User ID: {request.user.id}')
        print(f'Is Authenticated: {request.user.is_authenticated}')
        print(f'Request Headers: {request.headers}')
        print(f'Authentication Type: {request.auth}')
        print(f'Authentication Token: {request.auth}')
        print(f'User Roles: {request.user.groups.all().values_list("name", flat=True)}')
        
        # Check if the user is a faculty
        try:
            # First, verify authentication
            if not request.user.is_authenticated:
                print('ACCESS DENIED: User not authenticated')
                return Response(
                    {'detail': 'Authentication required.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Check for faculty profile
            try:
                # Debug: Print all existing profiles
                from .models import Profile
                all_profiles = Profile.objects.all()
                print('ALL PROFILES:')
                for p in all_profiles:
                    print(f'Profile {p.id}: User {p.user.id} - Role: {p.role}, is_faculty: {p.is_faculty}')
                
                profile = Profile.objects.get(user=request.user)
                print(f'FOUND PROFILE: ID {profile.id}, Role: {profile.role}, is_faculty: {profile.is_faculty}')
            except Profile.DoesNotExist:
                print('ACCESS DENIED: No profile found')
                return Response(
                    {'detail': 'No profile found for this user.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Explicit faculty role check
            if not profile.is_faculty and profile.role != 'faculty':
                print('ACCESS DENIED: Not a faculty member')
                return Response(
                    {'detail': 'You do not have permission to access this dashboard.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get the faculty associated with the current user
            try:
                faculty = Faculty.objects.get(user=request.user)
            except Faculty.DoesNotExist:
                print('ACCESS DENIED: No faculty profile found')
                return Response(
                    {'detail': 'No faculty profile found for this user.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Fetch faculty personal information
            faculty_data = {
                'id': faculty.id,
                'name': faculty.user.get_full_name(),
                'email': faculty.user.email,
                'department': getattr(faculty, 'department', 'N/A'),
                'hire_date': getattr(faculty, 'hire_date', None),
            }
            
            # Fetch courses where faculty is the primary faculty with annotated student counts
            courses = Course.objects.filter(primary_faculty=faculty).annotate(
                student_count=Count('enrollments', distinct=True)
            ).prefetch_related('enrollments__student')
            
            # Serialize courses with student count
            course_data = []
            for course in courses:
                course_serializer = CourseSerializer(course).data
                course_serializer['student_count'] = course.student_count
                course_data.append(course_serializer)
            
            # Get unique students across all courses
            student_ids = set()
            for course in courses:
                student_ids.update(course.enrollments.values_list('student_id', flat=True))
            
            # Fetch student details
            students = Student.objects.filter(id__in=student_ids)
            student_data = StudentSerializer(students, many=True).data
            
            # Fetch enrollments and grades for these courses
            enrollments = Enrollment.objects.filter(course__in=courses)
            grades = Grade.objects.filter(enrollment__in=enrollments).select_related('enrollment__course', 'enrollment__student')
            enrollment_data = EnrollmentSerializer(enrollments, many=True).data
            grade_data = GradeSerializer(grades, many=True).data
            
            dashboard_data = {
                'faculty': faculty_data,
                'courses': course_data,
                'students': student_data,
                'enrollments': enrollment_data,
                'grades': grade_data,
                'total_students': len(student_ids)  # Add total unique students count
            }
            
            return Response(dashboard_data)
        
        except Exception as e:
            import traceback
            print(f'UNEXPECTED ERROR: {str(e)}')
            print('TRACEBACK:')
            traceback.print_exc()
            return Response(
                {'detail': 'An unexpected error occurred.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            

