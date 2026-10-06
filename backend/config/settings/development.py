from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

# Permissive CORS during development
CORS_ALLOW_ALL_ORIGINS = True

# Add browsable API renderer for developer experience in browser
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
}
