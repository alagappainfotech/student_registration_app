"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
import logging
logger = logging.getLogger('django.urls')

def log_url_pattern(pattern, name=None):
    logger.debug(f'Registering URL Pattern: {pattern} (Name: {name})')
    return pattern
from core.admin import custom_admin_site

class DebugRoutesView(APIView):
    def get(self, request):
        from django.urls import get_resolver
        resolver = get_resolver(None)
        
        def list_url_patterns(resolver, prefix=''):
            patterns = []
            for key, value in resolver.reverse_dict.items():
                if isinstance(key, str):
                    patterns.append(f'{prefix}{key}')
            return patterns
        
        return Response({
            'registered_routes': list_url_patterns(resolver, prefix='/'),
            'message': 'Debug routes view'
        })

urlpatterns = [
    path('admin/', log_url_pattern(custom_admin_site.urls, name='admin'), name='admin'),
    path('', log_url_pattern(include('registration.urls'), name='api_routes')),
]
