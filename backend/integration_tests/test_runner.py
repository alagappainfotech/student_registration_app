import os
import sys
import django
from django.conf import settings
from django.test.runner import DiscoverRunner

def run_tests(*test_labels):
    """
    Custom test runner to set up Django environment and run tests
    """
    # Set up Django environment
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.append(BASE_DIR)
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()

    # Configure test runner
    class NoIsolationTestRunner(DiscoverRunner):
        def setup_databases(self, **kwargs):
            # Minimal database setup
            return super().setup_databases(**kwargs)

    # Create test runner
    test_runner = NoIsolationTestRunner(
        verbosity=2, 
        interactive=False, 
        failfast=False
    )

    # Run tests
    failures = test_runner.run_tests(test_labels)
    sys.exit(bool(failures))

if __name__ == '__main__':
    # Allow running specific test labels from command line
    run_tests(*sys.argv[1:] or ['integration_tests'])
