from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudentViewSet,
    OrganizationListView, 
    CourseViewSet,
    ClassListView, 
    SectionListView, 
    ProfileListView, 
    FacultyViewSet, 
    EnrollmentListCreateView, 
    GradeListCreateView,
    BulkGradeView,
    AdminDashboardView,
    StudentDashboardView,
    FacultyDashboardView
)
from rest_framework_simplejwt.views import TokenRefreshView as SimpleJWTTokenRefreshView
from .auth_views import (
    LoginView, 
    LogoutView, 
    UserInfoView, 
    CustomTokenRefreshView,
)
from .contact_views import RegistrationRequestView
from .admin_views import (
    RegistrationRequestListCreateView,
    RegistrationRequestDetailView,
    RegistrationRequestApproveView,
    RegistrationRequestRejectView
)
from .csrf_views import get_csrf_token
from .views_faculty import FacultyCoursesView, FacultyCourseStudentsView
from rest_framework.views import APIView
from rest_framework.response import Response

class TestView(APIView):
    def get(self, request):
        return Response({"message": "Test view works!"})

import logging
logger = logging.getLogger('django.urls')

def log_url_pattern(pattern, name=None):
    logger.debug(f'Registering URL Pattern: {pattern} (Name: {name})')
    return pattern

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'api/courses', CourseViewSet, basename='course')
router.register(r'api/faculty', FacultyViewSet, basename='faculty')
router.register(r'api/students', StudentViewSet, basename='student')

urlpatterns = [
    path('api/organizations/', OrganizationListView.as_view(), name='organization-list'),
    # Include the router URLs
    path('', include(router.urls)),
    path('api/classes/', ClassListView.as_view(), name='class-list'),
    path('api/sections/', SectionListView.as_view(), name='section-list'),

    path('api/profiles/', ProfileListView.as_view(), name='profile-list'),

    path('api/enrollments/', EnrollmentListCreateView.as_view(), name='enrollment-list-create'),
    path('api/grades/', GradeListCreateView.as_view(), name='grade-list-create'),
    path('api/grades/bulk/', BulkGradeView.as_view(), name='bulk-grade-create'),
    # Faculty dashboard APIs
    path('api/faculty/<int:faculty_id>/courses/', FacultyCoursesView.as_view(), name='faculty-courses'),
    path('api/faculty/<int:faculty_id>/courses/<int:course_id>/students/', FacultyCourseStudentsView.as_view(), name='faculty-course-students'),
    # Auth and password
    path('api/login/', log_url_pattern(LoginView.as_view(), name='login')),
    path('api/logout/', log_url_pattern(LogoutView.as_view(), name='logout')),
    path('api/user-info/', log_url_pattern(UserInfoView.as_view(), name='user-info')),
    path('api/token/refresh/', log_url_pattern(CustomTokenRefreshView.as_view(), name='token_refresh')),
    path('api/test/', TestView.as_view(), name='test-view'),
    # Dashboard API
    path('api/dashboard/admin/', log_url_pattern(AdminDashboardView.as_view(), name='admin-dashboard')),
    path('api/dashboard/student/', log_url_pattern(StudentDashboardView.as_view(), name='student-dashboard')),
    path('api/dashboard/faculty/', log_url_pattern(FacultyDashboardView.as_view(), name='faculty-dashboard')),
    # Registration request endpoints
    path('api/registration-request/', log_url_pattern(RegistrationRequestView.as_view(), name='registration-request')),
    path('api/csrf/', get_csrf_token, name='get-csrf-token'),
    path('api/registration-requests/', log_url_pattern(RegistrationRequestListCreateView.as_view(), name='registration-request-list')),
    path('api/registration-requests/<int:pk>/', log_url_pattern(RegistrationRequestDetailView.as_view(), name='registration-request-detail')),
    path('api/registration-requests/<int:id>/approve/', log_url_pattern(RegistrationRequestApproveView.as_view(), name='registration-request-approve')),
    path('api/registration-requests/<int:id>/reject/', log_url_pattern(RegistrationRequestRejectView.as_view(), name='registration-request-reject')),
    # Debug test view
]
