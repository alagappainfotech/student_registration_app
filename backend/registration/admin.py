from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from .models import Student, Organization, Course, Class, Section, Profile, Faculty, Enrollment, Grade

User = get_user_model()

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'

class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_role')
    list_filter = ('is_staff', 'is_superuser', 'is_active')

    def get_role(self, obj):
        try:
            return obj.profile.role
        except Profile.DoesNotExist:
            return 'No Role'
    get_role.short_description = 'Role'

class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'pan_number', 'incorporation_date', 'is_internal')
    list_filter = ('is_internal',)
    search_fields = ('name', 'pan_number')
    fieldsets = (
        (None, {
            'fields': ('name', 'address', 'is_internal')
        }),
        ('PAN Details', {
            'fields': ('pan_number', 'incorporation_date'),
            'classes': ('collapse',)
        }),
    )

class CourseAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name', 'code')

class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'student_id', 'get_email')
    search_fields = ('student_id', 'user__username', 'user__email')

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

class FacultyAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_email')

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course')
    list_filter = ()

class GradeAdmin(admin.ModelAdmin):
    def get_student(self, obj):
        return str(obj.enrollment.student)
    get_student.short_description = 'Student'

    def get_course(self, obj):
        return str(obj.enrollment.course)
    get_course.short_description = 'Course'

    list_display = ('get_student', 'get_course', 'value')
    list_filter = ('value',)
    search_fields = ('enrollment__student__name', 'enrollment__course__name')

# Register UserAdmin
admin.site.register(User, UserAdmin)

# Register models with custom admin classes
admin.site.register(Organization, OrganizationAdmin)
admin.site.register(Course, CourseAdmin)
admin.site.register(Class)
admin.site.register(Section)
admin.site.register(Student, StudentAdmin)
admin.site.register(Profile)
admin.site.register(Faculty, FacultyAdmin)
admin.site.register(Enrollment, EnrollmentAdmin)
admin.site.register(Grade, GradeAdmin)
