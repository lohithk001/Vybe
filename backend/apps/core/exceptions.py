import logging
from rest_framework.views import exception_handler
from rest_framework.exceptions import (
    ValidationError,
    NotFound,
    PermissionDenied,
    AuthenticationFailed,
    NotAuthenticated,
    Throttled,
)
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

ERROR_CODE_MAP = {
    ValidationError: 'VALIDATION_ERROR',
    NotFound: 'NOT_FOUND',
    PermissionDenied: 'PERMISSION_DENIED',
    AuthenticationFailed: 'AUTHENTICATION_FAILED',
    NotAuthenticated: 'AUTHENTICATION_REQUIRED',
    Throttled: 'RATE_LIMIT_EXCEEDED',
}

def custom_exception_handler(exc, context):
    """
    Standardize all DRF and unhandled exceptions into the VYBE envelope:
    {
        "success": false,
        "error": {
            "code": "...",
            "message": "...",
            "details": ...
        }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        code = 'REQUEST_ERROR'
        for exc_cls, code_name in ERROR_CODE_MAP.items():
            if isinstance(exc, exc_cls):
                code = code_name
                break

        # Extract cleaner message
        message = "An error occurred while processing the request."
        details = response.data

        if isinstance(response.data, dict):
            if 'detail' in response.data:
                message = str(response.data['detail'])
                details = None
            elif len(response.data) == 1 and list(response.data.keys())[0] in ('non_field_errors', '__all__'):
                errors = list(response.data.values())[0]
                message = errors[0] if isinstance(errors, (list, tuple)) and errors else str(errors)
                details = None
        elif isinstance(response.data, list):
            message = response.data[0] if response.data else message
            details = None

        error_body = {
            'code': code,
            'message': message,
        }
        if details is not None:
            error_body['details'] = details

        response.data = {
            'success': False,
            'error': error_body,
        }
        return response

    # Unhandled 500 exceptions
    logger.exception("Unhandled server exception: %s", exc, exc_info=context.get('request'))
    return Response(
        {
            'success': False,
            'error': {
                'code': 'INTERNAL_SERVER_ERROR',
                'message': 'An internal server error occurred. Please try again later.',
            }
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
