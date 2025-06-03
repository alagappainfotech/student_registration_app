class CustomCorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.allowed_origins = [
            'http://localhost:3000',  # React dev server
            'http://127.0.0.1:3000',  # React dev server alternative
            'http://localhost:8000',  # Django dev server
            'http://127.0.0.1:8000',  # Django dev server alternative
        ]
        self.allowed_headers = [
            'accept',
            'accept-encoding',
            'authorization',
            'content-type',
            'dnt',
            'origin',
            'user-agent',
            'x-csrftoken',
            'x-requested-with',
        ]
        self.allowed_methods = [
            'DELETE',
            'GET',
            'OPTIONS',
            'PATCH',
            'POST',
            'PUT',
        ]
        self.expose_headers = [
            'content-type',
            'x-csrftoken',
        ]

    def __call__(self, request):
        # Get the origin from the request
        origin = request.META.get('HTTP_ORIGIN', '')
        
        # Set default CORS headers
        response = self.get_response(request)
        
        # Handle CORS for allowed origins
        if origin in self.allowed_origins:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            
            # Set allowed headers
            if 'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' in request.META:
                response['Access-Control-Allow-Headers'] = request.META['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']
            else:
                response['Access-Control-Allow-Headers'] = ', '.join(self.allowed_headers)
            
            # Set allowed methods and exposed headers
            response['Access-Control-Allow-Methods'] = ', '.join(self.allowed_methods)
            response['Access-Control-Expose-Headers'] = ', '.join(self.expose_headers)
            response['Access-Control-Max-Age'] = '86400'  # 24 hours
        
        # Handle preflight requests
        if request.method == 'OPTIONS':
            response.status_code = 200
            response.content = b''
        
        return response
