from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    """
    View to get CSRF token. This endpoint will set the CSRF cookie in the response.
    """
    return JsonResponse({
        'detail': 'CSRF cookie set',
        'success': True
    })
