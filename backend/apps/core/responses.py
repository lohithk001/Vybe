from rest_framework.response import Response
from rest_framework import status

def api_response(data=None, message=None, status_code=status.HTTP_200_OK, extra=None):
    """
    Standardized success response:
    {
        "success": true,
        "data": { ... }
    }
    """
    payload = {
        'success': True,
        'data': data if data is not None else {},
    }
    if message:
        payload['message'] = message
    if extra and isinstance(extra, dict):
        payload.update(extra)
    return Response(payload, status=status_code)


def api_error(code="ERROR", message="An unexpected error occurred", status_code=status.HTTP_400_BAD_REQUEST, details=None):
    """
    Standardized error response:
    {
        "success": false,
        "error": {
            "code": "...",
            "message": "...",
            "details": ...
        }
    }
    """
    err = {
        'code': code,
        'message': message,
    }
    if details is not None:
        err['details'] = details
    return Response(
        {
            'success': False,
            'error': err,
        },
        status=status_code
    )
