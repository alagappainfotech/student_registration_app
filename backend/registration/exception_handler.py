from rest_framework.views import exception_handler as drf_exception_handler
import logging

def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    logger = logging.getLogger('django')
    view = context.get('view', None)
    if response is not None:
        logger.error(f"Exception in {view}: {exc} - Response: {response.data}")
    else:
        logger.error(f"Unhandled Exception in {view}: {exc}")
    return response
