import logging
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings

logger = logging.getLogger('django.request')

class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Handle preflight requests
        if request.method == 'OPTIONS':
            response = self._build_cors_preflight_response()
        else:
            response = self.get_response(request)
            self._add_cors_headers(request, response)
        
        return response

    def _build_cors_preflight_response(self):
        from django.http import HttpResponse
        response = HttpResponse()
        self._add_cors_headers(None, response)
        response['Access-Control-Max-Age'] = '86400'  # 24 hours
        return response

    def _add_cors_headers(self, request, response):
        if request:
            origin = request.META.get('HTTP_ORIGIN', '*')
            # Validate origin if needed
            # if origin not in settings.ALLOWED_ORIGINS:
            #     origin = settings.ALLOWED_ORIGINS[0]
        else:
            origin = '*'
            
        response['Access-Control-Allow-Origin'] = origin
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-CSRFToken, X-Requested-With'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Expose-Headers'] = 'Content-Type, Content-Length, X-CSRFToken'
        return response

class DetailedLoggingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Log detailed request information
        logger.info(f'Request Details:')
        logger.info(f'Method: {request.method}')
        logger.info(f'Path: {request.path}')
        logger.info(f'Full Path: {request.get_full_path()}')
        logger.info(f'Content Type: {request.content_type}')
        logger.info(f'Headers: {dict(request.headers)}')
        logger.info(f'Auth Header: {request.headers.get("Authorization", "No Auth Header")}')
        
        # Log request body for POST/PUT requests
        if request.method in ['POST', 'PUT']:
            try:
                body = request.body.decode('utf-8')
                logger.info(f'Request Body: {body}')
            except Exception as e:
                logger.error(f'Error decoding request body: {e}')
        
        return None

    def process_response(self, request, response):
        # Log response details
        logger.info(f'Response Details:')
        logger.info(f'Status Code: {response.status_code}')
        logger.info(f'Content Type: {response.get("Content-Type", "N/A")}')
        
        # Add CORS headers
        if not hasattr(response, '_closable_objects'):
            response = self._add_cors_headers(request, response)
        
        return response

    def process_exception(self, request, exception):
        # Log any exceptions that occur during request processing
        logger.error(f'Exception Details:')
        logger.error(f'Path: {request.path}')
        logger.error(f'Method: {request.method}')
        logger.error(f'Exception: {type(exception).__name__}')
        logger.error(f'Exception Details: {str(exception)}')
        
        return None
        
    def _add_cors_headers(self, request, response):
        if hasattr(request, 'META') and 'HTTP_ORIGIN' in request.META:
            origin = request.META['HTTP_ORIGIN']
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-CSRFToken, X-Requested-With'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Expose-Headers'] = 'Content-Type, Content-Length, X-CSRFToken'
        return response
