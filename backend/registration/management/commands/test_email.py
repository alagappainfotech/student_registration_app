from django.core.management.base import BaseCommand
from registration.utils import send_approval_email, send_rejection_email
from django.conf import settings

class Command(BaseCommand):
    help = 'Test email sending functionality'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email address to send test email to')
        parser.add_argument('--type', type=str, default='approval', choices=['approval', 'rejection'],
                          help='Type of email to send (approval or rejection)')

    def handle(self, *args, **options):
        email = options['email']
        email_type = options['type']
        
        self.stdout.write(self.style.SUCCESS(f'Sending {email_type} email to {email}...'))
        
        try:
            if email_type == 'approval':
                success = send_approval_email(
                    email=email,
                    temp_password='TempPass123!',
                    student_id='STU12345'
                )
            else:
                success = send_rejection_email(
                    email=email,
                    reason='Incomplete information provided'
                )
            
            if success:
                self.stdout.write(self.style.SUCCESS(f'{email_type.capitalize()} email sent successfully!'))
            else:
                self.stderr.write(self.style.ERROR(f'Failed to send {email_type} email'))
                
            if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
                self.stdout.write(self.style.WARNING(
                    'Note: Using console email backend. Check your console for the email output.'
                ))
                
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error sending email: {str(e)}'))
            if settings.DEBUG:
                import traceback
                traceback.print_exc()
