import os
import sys
import django
from django.urls import get_resolver, URLPattern, URLResolver

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def list_all_urls(urlpatterns, base_url=''):
    """
    Recursively list all URL patterns
    """
    urls = []
    for pattern in urlpatterns:
        if isinstance(pattern, URLResolver):
            # If it's a resolver (like include()), recursively get its patterns
            new_base_url = base_url + str(pattern.pattern)
            urls.extend(list_all_urls(pattern.url_patterns, new_base_url))
        elif isinstance(pattern, URLPattern):
            # If it's a direct URL pattern
            full_url = base_url + str(pattern.pattern)
            urls.append(full_url)
    return urls

def main():
    resolver = get_resolver(None)
    
    print("=== All Registered URL Patterns ===")
    all_urls = list_all_urls(resolver.url_patterns)
    
    for url in sorted(all_urls):
        print(url)

if __name__ == '__main__':
    main()
