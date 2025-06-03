import logging
import uuid
from django.conf import settings
from django.contrib.auth import authenticate, logout, get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from django.contrib.auth.models import User

from registration.models import Profile, Student, Faculty
from django.contrib.auth import get_user_model, authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework import serializers

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        # Validate and refresh the token
        data = super().validate(attrs)
        
        # Optionally, you can add custom logic here
        # For example, checking if the token is blacklisted
        
        return data

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(max_length=128, write_only=True)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.logger = logging.getLogger('django.request')
    
    def validate(self, data):
        # Ensure either email or username is provided
        if not data.get('email') and not data.get('username'):
            self.logger.warning('Login attempt without email or username')
            raise serializers.ValidationError({'email': 'Email or username is required'})
        
        # Normalize the email/username
        email = data.get('email', '').strip().lower()
        username = data.get('username', '').strip()
        password = data.get('password')
        
        # If username is provided but email is not, use username as email
        if not email and username:
            email = username
            data['email'] = email
        
        self.logger.debug('=' * 50)
        self.logger.debug('LOGIN ATTEMPT DETAILS')
        self.logger.debug('=' * 50)
        self.logger.debug(f'Attempting to authenticate: email={email}')

        # Get the request from context
        request = self.context.get('request')
        
        # Try to authenticate the user using the email backend
        self.logger.debug('Attempting to authenticate user...')
        user = authenticate(
            request=request,
            username=email,  # This can be either email or username
            password=password
        )
        
        if user is None:
            # Authentication failed - check if user exists
            try:
                user_model = get_user_model()
                existing_user = user_model._default_manager.get(email=email)
                
                # If we get here, user exists but authentication failed
                self.logger.warning(f'Authentication failed for user: {email}')
                self.logger.debug(f'User exists: {existing_user.email}, Active: {existing_user.is_active}')
                
                # Check if account is inactive
                if not existing_user.is_active:
                    self.logger.warning(f'Inactive account login attempt: {email}')
                    raise serializers.ValidationError({
                        'email': 'This account is inactive. Please contact support.'
                    })
                
                # If we get here, the password must be wrong
                raise serializers.ValidationError({
                    'password': 'Incorrect password. Please try again.'
                })
                
            except user_model.DoesNotExist:
                # User doesn't exist
                self.logger.warning(f'Login attempt for non-existent user: {email}')
                raise serializers.ValidationError({
                    'email': 'No account found with this email/username.'
                })
            except Exception as e:
                # Log any other errors
                self.logger.error(f'Error during authentication: {str(e)}', exc_info=True)
                raise serializers.ValidationError({
                    'non_field_errors': ['An error occurred during authentication. Please try again.']
                })
        
        # If we get here, authentication was successful
        self.logger.info(f'Authentication successful for user: {user.email}')
        self.logger.debug(f'User details - ID: {user.id}, Active: {user.is_active}, Staff: {user.is_staff}, Superuser: {user.is_superuser}')
        
        # Store the user for later use
        self.user = user
        data['user'] = user
        return data
            
    def validate_email(self, value):
        # If email is empty but we have a username, that's fine
        if not value and 'username' in self.initial_data and self.initial_data['username']:
            return self.initial_data['username']
        return value
        
    def validate_username(self, value):
        # If username is empty but we have an email, that's fine
        if not value and 'email' in self.initial_data and self.initial_data['email']:
            return self.initial_data['email']
        return value

class LoginView(APIView):
    def post(self, request):
        import sys
        import json
        import logging
        import traceback
        from django.core.exceptions import RequestAborted
        
        logger = logging.getLogger('django.request')
        
        # Log to Django logger instead of print
        logger.debug('=' * 50)
        logger.debug('LOGIN VIEW - REQUEST DETAILS')
        logger.debug('-' * 50)
        logger.debug('Method: %s', request.method)
        logger.debug('Content Type: %s', request.content_type)
        logger.debug('Path: %s', request.path)
        
        # Log request data safely
        try:
            logger.debug('Request Data: %s', request.data)
            if request.body:
                logger.debug('Request Body: %s', request.body.decode('utf-8', errors='replace'))
        except Exception as e:
            logger.warning('Error logging request data: %s', str(e))
        
        # Initialize request_data with empty dict
        request_data = {}
        
        try:
            # First, try to get data from request.data (handles JSON, form-data, etc.)
            if hasattr(request, 'data') and request.data:
                request_data = dict(request.data)
            # If no data in request.data, try to parse JSON from body
            elif request.body:
                try:
                    request_data = json.loads(request.body.decode('utf-8'))
                    if not isinstance(request_data, dict):
                        raise ValueError('Request body must be a JSON object')
                except json.JSONDecodeError as e:
                    logger.warning(f'Invalid JSON in request body: {str(e)}')
                    return Response({
                        'error': 'Invalid JSON format in request body',
                        'details': str(e)
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            logger.debug(f'Request data: {request_data}')
            
        except Exception as e:
            logger.error(f'Error parsing request data: {str(e)}', exc_info=True)
            return Response({
                'error': 'Invalid request format',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Log the incoming request data for debugging
        logger.debug(f'Incoming login request data: {request_data}')
        
        # Initialize the serializer with the request data
        serializer = LoginSerializer(data=request_data, context={'request': request})
        
        try:
            logger.debug('Starting serializer validation...')
            try:
                serializer.is_valid(raise_exception=True)
                logger.debug('Serializer validation successful')
            except serializers.ValidationError as e:
                logger.error(f'Serializer validation failed: {str(e)}')
                logger.error(f'Validation errors: {e.detail if hasattr(e, "detail") else "No detail"}')
                return Response({
                    'error': 'Invalid credentials. Please check your email and password.',
                    'details': str(e.detail) if hasattr(e, 'detail') else str(e)
                }, status=status.HTTP_401_UNAUTHORIZED)
            except Exception as e:
                logger.error(f'Unexpected error during validation: {str(e)}')
                logger.error(f'Error type: {type(e).__name__}')
                logger.error(f'Stack trace: {traceback.format_exc()}')
                return Response({
                    'error': 'An error occurred during authentication. Please try again.',
                    'error_type': type(e).__name__
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            user = serializer.validated_data.get('user')
            
            if not user:
                logger.error('No user found in validated data')
                logger.error(f'Validated data: {serializer.validated_data}')
                return Response({
                    'error': 'Authentication failed. Invalid credentials.'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
            logger.debug(f'User authenticated successfully: {user.email} (ID: {user.id}, Active: {user.is_active})')
            logger.debug(f'User is staff: {user.is_staff}, is superuser: {user.is_superuser}')

            # Determine user role with priority order
            role = None
            
            # First check if user has a specific profile type
            if hasattr(user, 'faculty_profile'):
                role = 'faculty'
                logger.debug(f'User is faculty: {user.faculty_profile}')
            elif hasattr(user, 'student_profile'):
                role = 'student'
                logger.debug(f'User is student: {user.student_profile}')
            
            # If no specific profile, check Profile model
            if not role:
                try:
                    profile = Profile.objects.get(user=user)
                    role = profile.role
                except Profile.DoesNotExist:
                    pass
            
            # If still no role, use staff flags as fallback
            if not role:
                if user.is_superuser:
                    role = 'admin'
                elif user.is_staff:
                    role = 'admin'
                else:
                    role = 'student'

            # Validate role
            valid_roles = ['admin', 'faculty', 'student']
            if role not in valid_roles:
                role = 'student'

            logger.debug('User Role Determination:')
            logger.debug(f'  Username: {user.username}')
            logger.debug(f'  Is Staff: {user.is_staff}')
            logger.debug(f'  Is Superuser: {user.is_superuser}')
            logger.debug(f'  Has Faculty Profile: {hasattr(user, "faculty_profile")}')
            logger.debug(f'  Has Student Profile: {hasattr(user, "student_profile")}')
            logger.debug(f'  Profile Role: {role}')
            logger.debug(f'  Final Role: {role}')

            # Create or update Profile if it doesn't exist
            profile, created = Profile.objects.get_or_create(
                user=user,
                defaults={
                    'role': role,
                    'is_admin': role == 'admin',
                    'is_faculty': role == 'faculty',
                    'is_student': role == 'student'
                }
            )

            if not created:
                # Update existing profile if needed
                profile.role = role
                profile.is_admin = role == 'admin'
                profile.is_faculty = role == 'faculty'
                profile.is_student = role == 'student'
                profile.save()

            logger.debug(f'Profile created/updated for user {user.username}')

            # Generate tokens with role included
            refresh = RefreshToken.for_user(user)
            
            # Add role to token payload
            refresh['role'] = role  # Add role to refresh token
            refresh.access_token['role'] = role  # Add role to access token
            
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Get additional user profile information
            profile_data = {}
            
            # Add faculty or student specific data if available
            if hasattr(user, 'faculty_profile'):
                faculty = user.faculty_profile
                profile_data.update({
                    'faculty_id': faculty.id,
                    'name': faculty.name,
                    'organization': faculty.organization.name if faculty.organization else None,
                    'organization_id': faculty.organization.id if faculty.organization else None
                })
            elif hasattr(user, 'student_profile'):
                student = user.student_profile
                profile_data.update({
                    'student_id': student.id,
                    'name': student.name,
                    'organization': student.organization.name if student.organization else None,
                    'organization_id': student.organization.id if student.organization else None,
                    'class_name': student.class_obj.name if hasattr(student, 'class_obj') and student.class_obj else None,
                    'class_id': student.class_obj.id if hasattr(student, 'class_obj') and student.class_obj else None,
                    'section': student.section.name if hasattr(student, 'section') and student.section else None,
                    'section_id': student.section.id if hasattr(student, 'section') and student.section else None
                })
            
            # Prepare the response data
            response_data = {
                'tokens': {
                    'access': access_token,
                    'refresh': refresh_token,
                    'expires_in': int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())
                },
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username or '',
                    'first_name': user.first_name or '',
                    'last_name': user.last_name or '',
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'is_active': user.is_active,
                    'role': role,
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                    'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                    **profile_data  # Merge profile data into the user object
                }
            }
            
            try:
                logger.info(f'Login successful for user: {user.username}, Role: {role}')
                return Response(response_data, status=status.HTTP_200_OK)
            except BrokenPipeError:
                logger.warning('Client disconnected before response could be sent')
                return Response(
                    {'error': 'Connection was interrupted'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

        except serializers.ValidationError as e:
            # Log the validation error with details
            logger.error(f'Login validation error: {str(e)}')
            logger.debug(f'Validation error details: {e.detail if hasattr(e, "detail") else "No details"}')
            
            # Prepare error response
            error_data = {
                'error': 'Authentication failed',
                'code': 'authentication_failed',
                'details': {}
            }
            
            # Handle different types of validation errors
            if hasattr(e, 'detail'):
                if isinstance(e.detail, dict):
                    # Convert field errors to a more client-friendly format
                    for field, errors in e.detail.items():
                        if isinstance(errors, list):
                            error_data['details'][field] = [str(err) for err in errors]
                        else:
                            error_data['details'][field] = [str(errors)]
                elif isinstance(e.detail, list):
                    error_data['details']['non_field_errors'] = [str(err) for err in e.detail]
                else:
                    error_data['details']['non_field_errors'] = [str(e.detail)]
            else:
                error_data['details']['non_field_errors'] = [str(e)]
            
            # If no specific field errors, add a generic message
            if not error_data['details']:
                error_data['details']['non_field_errors'] = ['Invalid credentials. Please try again.']
            
            return Response(error_data, status=status.HTTP_401_UNAUTHORIZED)
            
        except Exception as e:
            # Log the full exception details
            error_id = str(uuid.uuid4())
            logger.error(f'Unexpected error during login (ID: {error_id}): {str(e)}', exc_info=True)
            
            # Prepare error response
            error_data = {
                'error': 'An unexpected error occurred',
                'code': 'server_error',
                'error_id': error_id,
                'details': {
                    'message': 'Please try again later or contact support if the problem persists.',
                    'error': str(e),
                    'traceback': traceback.format_exc() if settings.DEBUG else None
                }
            }
            
            # Log the error
            logger.error(f'Unexpected login error: {error_details}')
            
            # Print to stderr for immediate visibility
            print(f'Unexpected Login Error: {e}', file=sys.stderr)
            print(traceback.format_exc(), file=sys.stderr)
            
            return Response({
                'error': 'An unexpected error occurred during authentication',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # The response is already being returned in the try block above
        # This duplicate code was causing the BrokenPipeError

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Validate that the user is authenticated
            if not request.user or not request.user.is_authenticated:
                return Response({
                    'error': 'Authentication required'
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Get the refresh token from the request
            refresh_token = request.data.get('refresh_token')
            
            # If no refresh token is provided, return error
            if not refresh_token:
                return Response({
                    'error': 'Refresh token is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Blacklist the token
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception as token_error:
                return Response({
                    'error': 'Invalid or already blacklisted token'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Optional: Logout from session if using session authentication
            logout(request)
            
            # Return 205 Reset Content as per test requirement
            return Response({
                'message': 'Successfully logged out'
            }, status=status.HTTP_205_RESET_CONTENT)
        except RequestAborted:
            # Handle connection interruption
            logger.warning('Login request was aborted')
            return Response({
                'error': 'Connection was interrupted'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            # Log full traceback for debugging
            error_details = {
                'error': str(e),
                'traceback': traceback.format_exc()
            }
            
            # Log the error
            logger.error(f'Unexpected logout error: {error_details}')
            
            # Print to stderr for immediate visibility
            print(f'Unexpected Logout Error: {e}', file=sys.stderr)
            print(traceback.format_exc(), file=sys.stderr)
            
            return Response({
                'error': 'An unexpected error occurred during logout',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserInfoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # Debug: Log the user and authentication status
            user = request.user
            logger.info(f"UserInfoView - User: {user}, is_authenticated: {user.is_authenticated}")
            
            if not user.is_authenticated:
                logger.warning("UserInfoView - User is not authenticated")
                return Response(
                    {'detail': 'Authentication credentials were not provided.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            try:
                # Try to get the user's profile
                profile = Profile.objects.get(user=user)
                role = profile.role
                logger.info(f"UserInfoView - Found profile with role: {role}")
            except Profile.DoesNotExist:
                # If no profile exists but user is superuser, treat as admin
                if user.is_superuser:
                    role = 'admin'
                    logger.info("UserInfoView - No profile but user is superuser, setting role to admin")
                else:
                    role = None
                    logger.warning(f"UserInfoView - No profile found for user {user.username}")

            # Prepare response data
            response_data = {
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser
                },
                'role': role
            }

            logger.info(f"UserInfoView - Successfully returned user info for {user.username}")
            try:
                return Response(response_data)
            except BrokenPipeError:
                logger.warning('Client disconnected before response could be sent')
                return Response(
                    {'error': 'Connection was interrupted'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

        except Exception as e:
            logger.error(f"UserInfoView - Error: {str(e)}", exc_info=True)
            return Response(
                {'detail': 'An error occurred while processing your request.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
