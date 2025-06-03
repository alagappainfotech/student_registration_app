import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from .serializers import RegistrationRequestSerializer
from rest_framework.permissions import AllowAny

logger = logging.getLogger(__name__)

class RegistrationRequestView(APIView):
    """
    API endpoint for handling registration requests from the landing page.
    This endpoint is public and doesn't require authentication.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegistrationRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            # Save the registration request
            registration_request = serializer.save()
            
            # Log the registration request
            logger.info(f"New registration request received from {registration_request.name} ({registration_request.email}) for role: {registration_request.role}")
            
            # Send email notification to administrators
            try:
                admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@example.com')
                send_mail(
                    subject=f'New Registration Request: {registration_request.role.capitalize()}',
                    message=f"""
                    A new registration request has been submitted:
                    
                    Name: {registration_request.name}
                    Email: {registration_request.email}
                    Phone: {registration_request.phone}
                    Role: {registration_request.role}
                    
                    Message:
                    {registration_request.message}
                    
                    Please review this request in the admin dashboard.
                    """,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[admin_email],
                    fail_silently=False,
                )
            except Exception as e:
                logger.error(f"Failed to send registration request email: {str(e)}")
            
            return Response({
                'message': 'Registration request submitted successfully. An administrator will contact you soon.',
                'request_id': registration_request.id
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
