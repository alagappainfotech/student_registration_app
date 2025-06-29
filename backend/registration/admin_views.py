from rest_framework import generics, status, exceptions
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.exceptions import PermissionDenied, NotAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)
from .models import RegistrationRequest, Profile, Student, Class, Section, Organization
from .serializers import RegistrationRequestSerializer
from .utils import generate_temporary_password, send_approval_email, send_rejection_email
import logging
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction

logger = logging.getLogger(__name__)
User = get_user_model()

class RegistrationRequestListCreateView(generics.ListCreateAPIView):
    """
    View for listing and creating registration requests.
    List is accessible by any authenticated user, but create requires admin privileges.
    """
    queryset = RegistrationRequest.objects.all()
    serializer_class = RegistrationRequestSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]  # Default permission, can be overridden
    
    def get_authenticators(self):
        """
        Return the appropriate authentication classes based on the request method.
        """
        if self.request.method == 'GET':
            return [JWTAuthentication(), SessionAuthentication()]
        return [SessionAuthentication()]  # For POST requests, use session auth
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAdminUser()]
    
    def check_permissions(self, request):
        """
        Check if the request should be permitted.
        Raises an appropriate exception if the request is not permitted.
        """
        # Log the incoming request
        logger.info(f'Checking permissions for {request.method} {request.path}')
        logger.info(f'User: {request.user}')
        logger.info(f'Authenticated: {request.user.is_authenticated}')
        logger.info(f'Is staff: {getattr(request.user, "is_staff", False)}')
        logger.info(f'Is superuser: {getattr(request.user, "is_superuser", False)}')
        
        # Check if user is authenticated first
        if not request.user.is_authenticated:
            logger.warning('User not authenticated')
            raise NotAuthenticated('Authentication credentials were not provided.')
        
        # For GET requests, just check if user is authenticated
        if request.method == 'GET':
            logger.info('GET request allowed for any authenticated user')
            return True
            
        # For other methods, check if user is admin
        is_admin = getattr(request.user, 'is_staff', False) or getattr(request.user, 'is_superuser', False)
        if not is_admin:
            logger.warning(f'User {request.user} does not have admin privileges')
            raise PermissionDenied('You do not have permission to perform this action.')
        
        logger.info('User has required permissions')
        return True
    
    def get_queryset(self):
        """Return all registration requests for admin users."""
        logger.info(f'User {self.request.user} is fetching registration requests')
        return RegistrationRequest.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        """Create a new registration request."""
        logger.info(f'Creating new registration request. User: {self.request.user}')
        logger.info(f'Request data: {self.request.data}')
        serializer.save()
    
    def initial(self, request, *args, **kwargs):
        """Initialize the view with proper authentication."""
        # Log request details
        logger.info(f'\n=== New Request: {request.method} {request.path} ===')
        logger.info(f'Initializing request. User: {request.user}, Auth: {request.auth}')
        
        # Log headers and META data
        headers = dict(request.headers)
        meta = {k: v for k, v in request.META.items() if not k.startswith('wsgi.')}
        
        logger.info('Request Headers:')
        for k, v in headers.items():
            if k.lower() in ['authorization', 'cookie']:
                logger.info(f'  {k}: [REDACTED]')
            else:
                logger.info(f'  {k}: {v}')
                
        logger.info('Request META:')
        for k, v in meta.items():
            if 'SECRET' in k or 'KEY' in k or 'TOKEN' in k or 'PASS' in k:
                logger.info(f'  {k}: [REDACTED]')
            else:
                logger.info(f'  {k}: {v}')
        
        # Let DRF handle the initial authentication
        try:
            super().initial(request, *args, **kwargs)
            logger.info(f'DRF authentication successful. User: {request.user}')
        except Exception as e:
            logger.error(f'Error in initial authentication: {str(e)}', exc_info=True)
            raise
        
        # Additional logging after authentication
        logger.info(f'After authentication - User: {request.user}, Authenticated: {request.user.is_authenticated if hasattr(request.user, "is_authenticated") else "N/A"}')
        
        # Check authentication status
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            logger.warning('No authenticated user found after DRF authentication')
            raise NotAuthenticated('Authentication credentials were not provided or are invalid.')
            
        # For non-GET requests, check admin status
        if request.method != 'GET':
            is_admin = getattr(request.user, 'is_staff', False) or getattr(request.user, 'is_superuser', False)
            if not is_admin:
                logger.warning(f'User {request.user} is not an admin')
                raise PermissionDenied('You do not have permission to access this resource.')
            
        logger.info(f'User {request.user} has been successfully authenticated and authorized')
    
    def dispatch(self, request, *args, **kwargs):
        """Override dispatch to add more detailed logging."""
        logger.info(f'\n=== New Request ===')
        logger.info(f'Processing {request.method} request to {request.path}')
        logger.info(f'User: {request.user}, Authenticated: {getattr(request.user, "is_authenticated", False)}')
        logger.info(f'Auth header: {request.headers.get("Authorization")}')
        logger.info(f'Request META: {dict(request.META)}')
        
        # Log all headers
        logger.info('Request Headers:')
        for header, value in request.headers.items():
            if header.lower() in ['authorization', 'cookie']:
                # Redact sensitive information
                logger.info(f'  {header}: {value[:10]}...' if value else f'  {header}: {value}')
            else:
                logger.info(f'  {header}: {value}')
        
        try:
            return super().dispatch(request, *args, **kwargs)
        except Exception as e:
            logger.error(f'Error in dispatch: {str(e)}', exc_info=True)
            raise
    
    def list(self, request, *args, **kwargs):
        # Add debug logging
        logger.info('=' * 50)
        logger.info('RegistrationRequestListCreateView.list called')
        logger.info(f'Request user: {request.user}')
        logger.info(f'User authenticated: {request.user.is_authenticated}')
        logger.info(f'User is staff: {getattr(request.user, "is_staff", False)}')
        logger.info(f'Request headers: {dict(request.headers)}')
        logger.info('=' * 50)
        
        try:
            # Check if user is authenticated and is staff
            if not request.user.is_authenticated or not request.user.is_staff:
                logger.warning('Permission denied - User not authenticated or not staff')
                return Response(
                    {'detail': 'Authentication credentials were not provided or user is not staff'},
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # Call the parent's list method
            return super().list(request, *args, **kwargs)
            
        except Exception as e:
            logger.error(f'Error in RegistrationRequestListCreateView: {str(e)}', exc_info=True)
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def handle_exception(self, exc):
        """Handle exceptions and return appropriate responses."""
        logger.error(f'Exception in RegistrationRequestListCreateView: {str(exc)}', exc_info=True)
        response = super().handle_exception(exc)
        logger.info(f'Sending response with status {response.status_code}')
        return response

class RegistrationRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View to retrieve, update or delete a registration request.
    """
    queryset = RegistrationRequest.objects.all()
    serializer_class = RegistrationRequestSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [JWTAuthentication, SessionAuthentication, BasicAuthentication]
    lookup_field = 'id'

class RegistrationRequestApproveView(APIView):
    """
    View to approve a registration request.
    Creates a user account with a temporary password and sends it via email.
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [JWTAuthentication, SessionAuthentication, BasicAuthentication]
    
    @transaction.atomic
    def post(self, request, id):
        logger.info(f"Approve request received for registration ID: {id}")
        logger.info(f"Request user: {request.user}")
        logger.info(f"Request data: {request.data}")
        
        try:
            # Log CSRF and session info
            logger.info(f"CSRF Token: {request.META.get('HTTP_X_CSRFTOKEN', 'Not provided')}")
            logger.info(f"Session ID: {request.session.session_key or 'No session'}")
            logger.info(f"User authenticated: {request.user.is_authenticated}")
            logger.info(f"User is staff: {request.user.is_staff}")
            
            registration_request = RegistrationRequest.objects.select_for_update().get(id=id)
            logger.info(f"Found registration request: {registration_request}")
            
            # Check if request is already processed
            if registration_request.status != 'pending':
                error_msg = f'This request has already been processed. Current status: {registration_request.status}'
                logger.warning(error_msg)
                return Response(
                    {'error': error_msg}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate a temporary password
            temp_password = generate_temporary_password()
            logger.info(f"Generated temporary password")
            
            try:
                # First, check if a user with this email already exists
                if User.objects.filter(email=registration_request.email).exists():
                    error_msg = f"A user with email {registration_request.email} already exists"
                    logger.error(error_msg)
                    return Response(
                        {'error': 'User already exists', 'details': error_msg},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Create the user
                # Extract first and last name from the full name
                name_parts = registration_request.name.split(' ', 1)
                first_name = name_parts[0]
                last_name = name_parts[1] if len(name_parts) > 1 else ''
                
                user = User.objects.create_user(
                    email=registration_request.email,
                    password=temp_password,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=True
                )
                logger.info(f"Created user: {user}")                
                
                # Create a profile for the user with error handling for required fields
                try:
                    # Create profile with only the fields that exist in the Profile model
                    profile = Profile.objects.create(
                        user=user,
                        role=registration_request.role
                    )
                    logger.info(f"Created profile: {profile}")
                except Exception as profile_error:
                    # If profile creation fails, delete the user to maintain data integrity
                    user.delete()
                    logger.error(f"Error creating profile: {str(profile_error)}", exc_info=True)
                    raise Exception(f"Failed to create user profile: {str(profile_error)}")
                
                # If the user is a student, create a student record
                if registration_request.role == 'student':
                    student = Student.objects.create(
                        user=user,
                        student_id=f"STU{user.id:04d}",
                        class_enrolled=registration_request.class_enrolled,
                        section=registration_request.section,
                        admission_date=timezone.now().date()
                    )
                    logger.info(f"Created student record: {student}")
                
                # Update the registration request
                registration_request.status = 'approved'
                registration_request.processed_by = request.user
                registration_request.processed_at = timezone.now()
                registration_request.save()
                logger.info("Updated registration request status to 'approved'")
                
                # Send approval email with temporary password
                email_sent = False
                try:
                    logger.info(f"Sending approval email to {registration_request.email}")
                    email_sent = send_approval_email(
                        email=registration_request.email,
                        temp_password=temp_password,
                        student_id=f"STU{user.id:04d}" if registration_request.role == 'student' else None
                    )
                    
                    if email_sent:
                        logger.info("Approval email sent successfully")
                    else:
                        logger.warning(f"Failed to send approval email to {registration_request.email}")
                        
                except Exception as e:
                    logger.error(f"Error sending approval email: {str(e)}", exc_info=True)
                
                response_data = {
                    'message': 'Registration approved successfully',
                    'user_id': user.id,
                    'email_sent': email_sent
                }
                logger.info(f"Returning success response: {response_data}")
                return Response(response_data, status=status.HTTP_200_OK)
                
            except Exception as e:
                logger.error(f"Error creating user or profile: {str(e)}", exc_info=True)
                
                # Log more details to diagnose the issue
                logger.error(f"Registration request data: email={registration_request.email}, " +
                            f"name={registration_request.name}, " +
                           f"role={registration_request.role}, " +
                           f"class_enrolled={registration_request.class_enrolled}, " +
                           f"section={registration_request.section}")
                
                # Check for specific types of errors
                if 'duplicate' in str(e).lower() or 'unique' in str(e).lower():
                    return Response(
                        {'error': 'A user with this email already exists', 'details': str(e)},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                elif 'null' in str(e).lower() or 'not null' in str(e).lower():
                    return Response(
                        {'error': 'Missing required fields', 'details': str(e)},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                else:
                    return Response(
                        {'error': 'Failed to create user account', 'details': str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
        except RegistrationRequest.DoesNotExist:
            error_msg = f"Registration request not found with ID: {id}"
            logger.error(error_msg)
            return Response(
                {'error': 'Registration request not found', 'details': error_msg},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            error_msg = f"Unexpected error in RegistrationRequestApproveView: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return Response(
                {'error': 'An unexpected error occurred', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RegistrationRequestRejectView(APIView):
    """
    View to reject a registration request.
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [JWTAuthentication, SessionAuthentication, BasicAuthentication]
    
    @transaction.atomic
    def post(self, request, id):
        logger.info(f"Reject request received for registration ID: {id}")
        logger.info(f"Request user: {request.user}")
        logger.info(f"Request data: {request.data}")
        
        try:
            # Log CSRF and session info
            logger.info(f"CSRF Token: {request.META.get('HTTP_X_CSRFTOKEN', 'Not provided')}")
            logger.info(f"Session ID: {request.session.session_key or 'No session'}")
            logger.info(f"User authenticated: {request.user.is_authenticated}")
            logger.info(f"User is staff: {request.user.is_staff}")
            
            registration_request = RegistrationRequest.objects.select_for_update().get(id=id)
            logger.info(f"Found registration request: {registration_request}")
            
            # Check if request is already processed
            if registration_request.status != 'pending':
                error_msg = f'This request has already been processed. Current status: {registration_request.status}'
                logger.warning(error_msg)
                return Response(
                    {'error': error_msg}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the rejection reason from the request
            reason = request.data.get('reason', 'No reason provided')
            logger.info(f"Rejection reason: {reason}")
            
            # Update the registration request
            registration_request.status = 'rejected'
            registration_request.processed_by = request.user
            registration_request.processed_at = timezone.now()
            registration_request.save()
            logger.info("Updated registration request status to 'rejected'")
            
            # Send rejection email
            email_sent = False
            try:
                logger.info(f"Sending rejection email to {registration_request.email}")
                try:
                    email_sent = send_rejection_email(
                        email=registration_request.email,
                        reason=reason
                    )
                    
                    if email_sent:
                        logger.info("Rejection email sent successfully")
                    else:
                        logger.warning(f"Failed to send rejection email to {registration_request.email}")
                        
                except Exception as email_error:
                    logger.error(f"Error in send_rejection_email: {str(email_error)}", exc_info=True)
                    # Continue with the response even if email fails
                    email_sent = False
                    
            except Exception as e:
                logger.error(f"Unexpected error during email sending: {str(e)}", exc_info=True)
                email_sent = False
            
            response_data = {
                'message': 'Registration rejected successfully',
                'email_sent': email_sent
            }
            logger.info(f"Returning success response: {response_data}")
            return Response(response_data, status=status.HTTP_200_OK)
            
        except RegistrationRequest.DoesNotExist:
            error_msg = f"Registration request not found with ID: {id}"
            logger.error(error_msg)
            return Response(
                {'error': 'Registration request not found', 'details': error_msg},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            error_msg = f"Error rejecting registration request: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return Response(
                {'error': 'Failed to process registration rejection', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
