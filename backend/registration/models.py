from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.auth import validators
from django.core.mail import send_mail
from django.conf import settings
import uuid
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError


class UserManager(BaseUserManager):
    """Custom user model manager where email is the unique identifier."""
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a user with the given email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model that uses email as the unique identifier."""
    email = models.EmailField(
        _('email address'),
        unique=True,
        error_messages={
            'unique': _("A user with that email already exists."),
        },
    )
    username = models.CharField(
        _('username'),
        max_length=150,
        unique=True,
        blank=True,
        null=True,
        help_text=_('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
        validators=[
            validators.UnicodeUsernameValidator(),
        ],
    )
    first_name = models.CharField(_('first name'), max_length=150, blank=True)
    last_name = models.CharField(_('last name'), max_length=150, blank=True)
    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_(
            'Designates whether this user should be treated as active. '
            'Unselect this instead of deleting accounts.'
        ),
    )
    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('Designates whether the user can log into this admin site.'),
    )
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)
    
    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    objects = UserManager()
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        swappable = 'AUTH_USER_MODEL'
    
    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.
        """
        full_name = f"{self.first_name} {self.last_name}"
        return full_name.strip()
    
    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name or self.email.split('@')[0]
    
    def email_user(self, subject, message, from_email=None, **kwargs):
        """Send an email to this user."""
        send_mail(subject, message, from_email, [self.email], **kwargs)

# Update the AUTH_USER_MODEL setting in settings.py to 'registration.User'
# AUTH_USER_MODEL = 'registration.User'

from django.contrib.auth import get_user_model
User = get_user_model()

class Profile(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('faculty', 'Faculty'),
        ('student', 'Student'),
    )
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_admin = models.BooleanField(default=False)
    is_faculty = models.BooleanField(default=False)
    is_student = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

    def save(self, *args, **kwargs):
        # Ensure role-specific flags are set correctly
        self.is_admin = self.role == 'admin'
        self.is_faculty = self.role == 'faculty'
        self.is_student = self.role == 'student'
        super().save(*args, **kwargs)

class Faculty(models.Model):
    QUALIFICATION_CHOICES = [
        ('phd', 'PhD'),
        ('masters', 'Masters'),
        ('bachelors', 'Bachelors'),
        ('diploma', 'Diploma'),
        ('certification', 'Professional Certification'),
    ]
    
    DEPARTMENT_CHOICES = [
        ('computer_science', 'Computer Science'),
        ('mathematics', 'Mathematics'),
        ('physics', 'Physics'),
        ('engineering', 'Engineering'),
        ('data_science', 'Data Science'),
    ]
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='faculty_profile')
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='faculties')
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    address = models.TextField(blank=True)
    qualification = models.CharField(max_length=20, choices=QUALIFICATION_CHOICES, null=True, blank=True)
    specialization = models.CharField(max_length=100, null=True, blank=True)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, null=True, blank=True)
    years_of_experience = models.IntegerField(null=True, blank=True)
    hire_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.email})"

class Organization(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    pan_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Permanent Account Number (PAN) of the organization"
    )
    incorporation_date = models.DateField(
        blank=True,
        null=True,
        help_text="Date of incorporation of the organization"
    )
    is_internal = models.BooleanField(default=True, help_text="True if this is our organization, False if external.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
        
    def clean(self):
        super().clean()
        if self.is_internal and not self.pan_number:
            raise ValidationError({
                'pan_number': 'PAN number is required for internal organizations.'
            })

class Course(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True, blank=True, null=True)
    description = models.TextField(blank=True)
    credits = models.PositiveIntegerField(default=3)
    fees = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    primary_faculty = models.ForeignKey('Faculty', on_delete=models.SET_NULL, null=True, blank=True, related_name='courses_taught')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='courses')
    budget = models.JSONField(blank=True, null=True, help_text="Cost breakdown as JSON")
    start_date = models.DateField(null=True, blank=True, help_text='Course start date')
    end_date = models.DateField(null=True, blank=True, help_text='Course end date')
    daily_duration = models.DurationField(null=True, blank=True, help_text='Daily course duration (e.g., 2 hours)')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class Class(models.Model):
    name = models.CharField(max_length=50)  # e.g., "10th Grade"
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='classes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.organization.name}"

class Section(models.Model):
    name = models.CharField(max_length=50)  # e.g., "A", "B"
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='sections')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Section {self.name} - {self.class_obj.name}"

class Student(models.Model):
    student_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    registration_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile', null=True, blank=True)
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='students')
    class_obj = models.ForeignKey('Class', on_delete=models.CASCADE, related_name='students')
    section = models.ForeignKey('Section', on_delete=models.CASCADE, related_name='students')
    courses = models.ManyToManyField('Course', related_name='students')
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    date_of_birth = models.DateField()
    address = models.TextField()
    registration_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(get_user_model(), null=True, blank=True, on_delete=models.SET_NULL, related_name='created_students')
    updated_by = models.ForeignKey(get_user_model(), null=True, blank=True, on_delete=models.SET_NULL, related_name='updated_students')

    def __str__(self):
        return f"{self.name} ({self.email})"

class Enrollment(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey('Course', on_delete=models.CASCADE, related_name='enrollments')
    class_obj = models.ForeignKey('Class', on_delete=models.CASCADE, related_name='enrollments')
    section = models.ForeignKey('Section', on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.student.name} - {self.course.name}"

class Grade(models.Model):
    enrollment = models.OneToOneField('Enrollment', on_delete=models.CASCADE, related_name='grade')
    value = models.CharField(max_length=10)
    graded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.enrollment.student.name} - {self.enrollment.course.name}: {self.value}"
        
    class Meta:
        ordering = ['-graded_at']

class Fees(models.Model):
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='fees_detail')
    base_cost = models.DecimalField(max_digits=12, decimal_places=2)
    faculty_cost = models.DecimalField(max_digits=12, decimal_places=2)
    materials_cost = models.DecimalField(max_digits=12, decimal_places=2)
    admin_cost = models.DecimalField(max_digits=12, decimal_places=2)
    profit_margin = models.DecimalField(max_digits=5, decimal_places=2, help_text="e.g. 0.15 for 15%")
    final_fee = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Fees for {self.course.name}"

class RegistrationRequest(models.Model):
    """Model for storing registration requests from the landing page"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('faculty', 'Faculty'),
    )
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_processed = models.BooleanField(default=False)
    processed_by = models.ForeignKey(
        get_user_model(), 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL, 
        related_name='processed_requests'
    )
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.get_role_display()} ({self.get_status_display()})"
        
    def save(self, *args, **kwargs):
        # Update timestamps when status changes
        if self.pk:
            old_instance = RegistrationRequest.objects.get(pk=self.pk)
            if old_instance.status != self.status:
                self.processed_at = timezone.now()
        super().save(*args, **kwargs)
