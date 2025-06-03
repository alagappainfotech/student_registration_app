# This file makes the middleware directory a Python package
from .logging_middleware import DetailedLoggingMiddleware

__all__ = ['DetailedLoggingMiddleware']
