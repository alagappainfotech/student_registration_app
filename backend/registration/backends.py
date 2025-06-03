import logging
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.core.exceptions import MultipleObjectsReturned

logger = logging.getLogger(__name__)

class EmailBackend(ModelBackend):
    """
    Custom authentication backend that allows users to log in using their email address.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        
        # If username is not provided, try to get it from kwargs
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD)
            
        # If username is still None, try to get email from kwargs
        if username is None:
            username = kwargs.get('email')
        
        # If we still don't have a username, return None
        if username is None:
            return None
            
        logger.debug(f'Attempting to authenticate user: {username}')
        
        try:
            # First, try to find user by email
            if '@' in str(username):
                try:
                    user = UserModel._default_manager.get(email=username)
                    logger.debug(f'User found by email: {user.email}')
                except UserModel.DoesNotExist:
                    logger.debug(f'No user found with email: {username}')
                    return None
                except MultipleObjectsReturned:
                    logger.error(f'Multiple users found with email: {username}')
                    return None
            else:
                # Fall back to username lookup
                try:
                    user = UserModel._default_manager.get(username=username)
                    logger.debug(f'User found by username: {user.username}')
                except UserModel.DoesNotExist:
                    logger.debug(f'No user found with username: {username}')
                    return None
            
            # Verify the password
            if user.check_password(password):
                logger.debug(f'Password validated for user: {user.email}')
                # Check if the user is active
                if user.is_active:
                    logger.info(f'User authenticated successfully: {user.email}')
                    return user
                else:
                    logger.warning(f'Inactive user login attempt: {user.email}')
                    return None
            else:
                logger.warning(f'Invalid password for user: {user.email if hasattr(user, "email") else username}')
                return None
                
        except Exception as e:
            logger.error(f'Error during authentication: {str(e)}', exc_info=True)
            return None
