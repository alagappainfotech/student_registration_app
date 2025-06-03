import random
import string
import logging
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

def generate_temporary_password(length=12):
    """Generate a random temporary password."""
    # Define character sets
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    special = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    # Ensure the password has at least one of each character type
    password = [
        random.choice(lowercase),
        random.choice(uppercase),
        random.choice(digits),
        random.choice(special)
    ]
    
    # Fill the rest of the password with random characters
    remaining = length - len(password)
    all_chars = lowercase + uppercase + digits + special
    password.extend(random.choice(all_chars) for _ in range(remaining))
    
    # Shuffle the password to make it more random
    random.shuffle(password)
    return ''.join(password)

def send_approval_email(email, temp_password, student_id=None):
    """Send an email to the user with their temporary password."""
    subject = 'Your Registration Has Been Approved'
    
    context = {
        'email': email,
        'temp_password': temp_password,
        'student_id': student_id,
        'login_url': f"{settings.FRONTEND_URL}/login"
    }
    
    # Render HTML email template
    html_message = render_to_string('emails/registration_approved.html', context)
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send approval email: {str(e)}")
        return False

def send_rejection_email(email, reason=None):
    """Send an email to the user when their registration is rejected."""
    subject = 'Your Registration Request Status'
    
    context = {
        'email': email,
        'reason': reason or 'does not meet our current requirements',
        'contact_email': settings.DEFAULT_FROM_EMAIL
    }
    
    try:
        # Render HTML email template
        html_message = render_to_string('emails/registration_rejected.html', context)
        plain_message = strip_tags(html_message)
    except Exception as e:
        logger.error(f"Error rendering email template: {str(e)}")
        # Fallback to a simple message if template rendering fails
        plain_message = f"Your registration request has been rejected. Reason: {context['reason']}"
        html_message = None
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send rejection email: {str(e)}")
        return False
