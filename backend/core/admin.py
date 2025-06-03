from django.contrib import admin
from django.contrib.auth.admin import UserAdmin, GroupAdmin
from django.contrib.auth.models import User, Group
from django.db.models import Count, Sum
from django.utils.safestring import mark_safe
from registration.dashboard import SystemDashboard
from registration.models import (
    Organization, 
    Class, 
    Section, 
    Course, 
    Faculty, 
    Student, 
    Enrollment, 
    Grade
)

class DashboardAdmin(admin.ModelAdmin):
    change_list_template = 'admin/dashboard.html'

    def changelist_view(self, request, extra_context=None):
        # Generate comprehensive dashboard data
        dashboard_data = SystemDashboard.generate_dashboard_data()
        
        # Prepare extra context for template
        extra_context = extra_context or {}
        
        # Organization Data
        extra_context.update({
            'total_organizations': dashboard_data['org_data']['total_organizations'],
            'internal_organizations': dashboard_data['org_data']['internal_organizations'],
            
            # User Data
            'total_students': dashboard_data['user_data']['total_students'],
            'total_faculty': dashboard_data['user_data']['total_faculty'],
            
            # Course Data
            'total_courses': dashboard_data['course_data']['total_courses'],
            'total_course_fees': dashboard_data['course_data']['total_course_fees'],
            
            # Visualization Data
            'students_by_org_chart': dashboard_data['visualizations']['students_by_org_chart'],
            'course_enrollment_chart': dashboard_data['visualizations']['course_enrollment_chart'],
            'grade_distribution_chart': dashboard_data['visualizations']['grade_distribution_chart'],
        })
        
        return super().changelist_view(request, extra_context)

# Custom Admin Site
class StudentRegistrationAdminSite(admin.AdminSite):
    site_header = 'Student Registration System'
    site_title = 'Admin Dashboard'
    index_title = 'Welcome to Student Registration System'
    
    def get_app_list(self, request):
        # Customize app list if needed
        app_list = super().get_app_list(request)
        return app_list

# Create a custom admin site instance
custom_admin_site = StudentRegistrationAdminSite(name='custom_admin')

# Register built-in Django models
custom_admin_site.register(User, UserAdmin)
custom_admin_site.register(Group, GroupAdmin)

# Register models with the custom admin site
custom_admin_site.register(Organization)
custom_admin_site.register(Class)
custom_admin_site.register(Section)
custom_admin_site.register(Course)
custom_admin_site.register(Faculty)
custom_admin_site.register(Student)
custom_admin_site.register(Enrollment)
custom_admin_site.register(Grade)
