import time
import logging
from django.utils import timezone

logger = logging.getLogger('django.request')

class DetailedLoggingMiddleware:
    """
    Middleware to log detailed information about requests and responses.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log request details
        request.start_time = time.time()
        
        # Log request
        logger.info(
            'Request: %s %s',
            request.method,
            request.get_full_path(),
            extra={
                'request': request,
                'user': request.user if hasattr(request, 'user') else None,
            }
        )

        # Process the request and get the response
        response = self.get_response(request)

        # Calculate request duration
        duration = time.time() - request.start_time

        # Log response
        logger.info(
            'Response: %s %s %s (%.2fs)',
            request.method,
            request.get_full_path(),
            response.status_code,
            duration,
            extra={
                'request': request,
                'response': response,
                'user': request.user if hasattr(request, 'user') else None,
                'duration': duration,
            }
        )

        return response
