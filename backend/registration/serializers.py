from rest_framework import serializers
from .models import Student, Organization, Course, Class, Section, Profile, Faculty, Enrollment, Grade, RegistrationRequest
from django.contrib.auth import get_user_model

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    primary_faculty_name = serializers.CharField(source='primary_faculty.name', read_only=True, allow_null=True)
    student_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Course
        fields = '__all__'
        extra_kwargs = {
            'student_count': {'read_only': True}
        }

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = '__all__'

class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Profile
        fields = ['id', 'user', 'role']

class FacultySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    organization = OrganizationSerializer(read_only=True)
    organization_id = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all(), source='organization', write_only=True)
    
    class Meta:
        model = Faculty
        fields = [
            'id', 'user', 'organization', 'organization_id', 
            'name', 'email', 'phone', 'address', 
            'qualification', 'specialization', 'years_of_experience',
            'created_at', 'updated_at'
        ]

class StudentSerializer(serializers.ModelSerializer):
    # User-related fields
    username = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)

    def validate_email(self, value):
        # Only validate email uniqueness for new users or when email is being changed
        if value:
            instance = getattr(self, 'instance', None)
            if instance and instance.email == value:  # Same email as before
                return value
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError('A user with this email already exists.')
        return value
    
    # Related fields
    student_id = serializers.UUIDField(read_only=True)
    registration_id = serializers.UUIDField(read_only=True)
    user = UserSerializer(read_only=True)
    courses = CourseSerializer(many=True, read_only=True)
    organization = OrganizationSerializer(read_only=True)
    class_obj = ClassSerializer(read_only=True)
    section = SectionSerializer(read_only=True)
    
    # Write-only related field IDs
    organization_id = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all(), source='organization', write_only=True, required=False)
    class_obj_id = serializers.PrimaryKeyRelatedField(queryset=Class.objects.all(), source='class_obj', write_only=True, required=False)
    section_id = serializers.PrimaryKeyRelatedField(queryset=Section.objects.all(), source='section', write_only=True, required=False)
    courses_ids = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), source='courses', write_only=True, many=True, required=False)

    class Meta:
        model = Student
        fields = [
            'id', 'student_id', 'registration_id', 'user', 'username', 'password', 
            'name', 'email', 'phone', 'date_of_birth', 'address', 'registration_date',
            'organization', 'class_obj', 'section', 'courses',
            'organization_id', 'class_obj_id', 'section_id', 'courses_ids',
            'created_at', 'updated_at', 'created_by', 'updated_by',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'write_only': True}
        }

    def validate(self, data):
        # Validate unique email and username
        username = data.get('username')
        email = data.get('email')
        
        if get_user_model().objects.filter(username=username).exists():
            raise serializers.ValidationError({'username': 'A user with this username already exists.'})
        
        if get_user_model().objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'A user with this email already exists.'})
        
        return data

    def create(self, validated_data):
        # Extract user-related data
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        
        # Create user
        user = get_user_model().objects.create_user(
            username=username, 
            email=validated_data.get('email'), 
            password=password,
            first_name=validated_data.get('name', '').split()[0] if validated_data.get('name') else '',
            last_name=validated_data.get('name', '').split()[-1] if validated_data.get('name') and ' ' in validated_data.get('name') else ''
        )
        
        # Set created_by to current user if available
        created_by = self.context.get('request').user if 'request' in self.context else None
        validated_data['created_by'] = created_by
        validated_data['user'] = user
        
        # Create student
        student = Student.objects.create(**validated_data)
        
        # Create profile
        Profile.objects.create(
            user=user, 
            role='student', 
            is_student=True
        )
        
        return student

    def update(self, instance, validated_data):
        # Update user details
        user = instance.user
        if 'username' in validated_data:
            user.username = validated_data.pop('username')
        if 'password' in validated_data:
            user.set_password(validated_data.pop('password'))
        user.save()
        
        # Update student details
        return super().update(instance, validated_data)

class EnrollmentSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), source='student', write_only=True)
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), source='course', write_only=True)
    class_obj = ClassSerializer(read_only=True)
    class_obj_id = serializers.PrimaryKeyRelatedField(queryset=Class.objects.all(), source='class_obj', write_only=True)
    section = SectionSerializer(read_only=True)
    section_id = serializers.PrimaryKeyRelatedField(queryset=Section.objects.all(), source='section', write_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_id', 'course', 'course_id', 'class_obj', 'class_obj_id', 'section', 'section_id', 'enrolled_at'
        ]

class GradeSerializer(serializers.ModelSerializer):
    enrollment = EnrollmentSerializer(read_only=True)
    enrollment_id = serializers.PrimaryKeyRelatedField(
        queryset=Enrollment.objects.all(), 
        source='enrollment', 
        write_only=True
    )
    student_id = serializers.IntegerField(write_only=True, required=False)
    course_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Grade
        fields = [
            'id', 'enrollment', 'enrollment_id', 'student_id', 'course_id', 
            'value', 'graded_at'
        ]
        read_only_fields = ['graded_at']
    
    def validate_value(self, value):
        """Validate that the grade is a valid letter grade"""
        valid_grades = ['A', 'B', 'C', 'D', 'F', 'A-', 'B+', 'B-', 'C+', 'C-', 'D+', 'D-']
        if value.upper() not in valid_grades:
            raise serializers.ValidationError(f'Invalid grade. Must be one of: {", ".join(valid_grades)}')
        return value.upper()
    
    def validate(self, data):
        """Validate that the enrollment exists and belongs to the student and course"""
        student_id = data.pop('student_id', None)
        course_id = data.pop('course_id', None)
        
        if 'enrollment' not in data and (not student_id or not course_id):
            raise serializers.ValidationError(
                'Either enrollment_id or both student_id and course_id must be provided.'
            )
        
        if student_id and course_id and 'enrollment' not in data:
            try:
                enrollment = Enrollment.objects.get(
                    student_id=student_id,
                    course_id=course_id
                )
                data['enrollment'] = enrollment
            except Enrollment.DoesNotExist:
                raise serializers.ValidationError(
                    'No enrollment found for the given student and course.'
                )
        
        return data
    
    def create(self, validated_data):
        """Create or update a grade"""
        enrollment = validated_data['enrollment']
        value = validated_data['value']
        
        # Update if exists, create if not
        grade, created = Grade.objects.update_or_create(
            enrollment=enrollment,
            defaults={'value': value}
        )
        
        return grade

class RegistrationRequestSerializer(serializers.ModelSerializer):
    """Serializer for handling registration requests from the landing page"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    processed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = RegistrationRequest
        fields = [
            'id', 'name', 'email', 'phone', 'role', 'role_display', 
            'message', 'status', 'status_display', 'processed_by', 
            'processed_by_name', 'processed_at', 'created_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'processed_by', 
            'processed_at', 'status_display', 'role_display'
        ]
    
    def get_processed_by_name(self, obj):
        return obj.processed_by.get_full_name() if obj.processed_by else None
    
    def update(self, instance, validated_data):
        # Set processed_by to the current user if status is being updated
        if 'status' in validated_data and not instance.processed_by:
            request = self.context.get('request')
            if request and hasattr(request, 'user') and request.user.is_authenticated:
                validated_data['processed_by'] = request.user
        return super().update(instance, validated_data)
