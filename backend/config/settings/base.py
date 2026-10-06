import os
from pathlib import Path
import environ

# Build paths inside the project: BASE_DIR is backend/
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Initialize environment parser
env = environ.Env(
    DEBUG=(bool, False),
    SECRET_KEY=(str, 'django-insecure-vybe-dev-secret-key-change-in-production-12345'),
    ALLOWED_HOSTS=(list, ['*']),
    CORS_ALLOWED_ORIGINS=(list, [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'capacitor://localhost',
        'http://localhost',
    ]),
    CORS_ALLOW_ALL_ORIGINS=(bool, False),
    REDIS_URL=(str, ''),
)

# Load .env file if it exists
env_file = BASE_DIR / '.env'
if env_file.exists():
    environ.Env.read_env(env_file)

SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = env('ALLOWED_HOSTS')

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'corsheaders',
    'drf_spectacular',
]

LOCAL_APPS = [
    'apps.core',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database configuration (PostgreSQL / SQLite fallback)
default_sqlite_url = f"sqlite:///{BASE_DIR / 'db.sqlite3'}"
DATABASES = {
    'default': env.db_url(
        'DATABASE_URL',
        default=default_sqlite_url,
    )
}
DATABASES['default']['CONN_MAX_AGE'] = 600
DATABASES['default']['CONN_HEALTH_CHECKS'] = True

# Cache configuration (Redis / LocMemCache fallback)
redis_url = env('REDIS_URL')
if redis_url:
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': redis_url,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'CONNECTION_POOL_KWARGS': {'max_connections': 50, 'timeout': 5},
                'SOCKET_CONNECT_TIMEOUT': 5,
                'SOCKET_TIMEOUT': 5,
            },
            'KEY_PREFIX': 'vybe',
            'TIMEOUT': 3600,
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'vybe-local-memory-cache',
            'KEY_PREFIX': 'vybe',
            'TIMEOUT': 3600,
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'apps.core.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 20,
}

# DRF Spectacular OpenAPI documentation
SPECTACULAR_SETTINGS = {
    'TITLE': 'VYBE Music API',
    'DESCRIPTION': 'Gen-Z Music Discovery Engine REST API',
    'VERSION': 'v1',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = env('CORS_ALLOW_ALL_ORIGINS')
CORS_ALLOWED_ORIGINS = env('CORS_ALLOWED_ORIGINS')
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
