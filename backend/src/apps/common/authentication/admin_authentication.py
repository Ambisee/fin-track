from django.conf import settings
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import AnonymousUser

from rest_framework import status
from rest_framework.request import Request
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from ..utils.request import get_header
from ..constants.authentication_constants import AuthenticationConstants


class AdminAuthentication(BaseAuthentication):
    
    def authenticate(self, request: Request):
        # Check for the existence of the required headers
        auth_admin_username = get_header(request, AuthenticationConstants.AUTHENTICATION_ADMIN_AUTH_USERNAME_HEADER)
        auth_admin_password = get_header(request, AuthenticationConstants.AUTHENTICATION_ADMIN_AUTH_PASSWORD_HEADER)

        if auth_admin_username is None or auth_admin_password is None:
            raise AuthenticationFailed(
                detail={'error': AuthenticationConstants.AUTHENTICATION_INVALID_PAYLOAD_MESSAGE},
                code=status.HTTP_400_BAD_REQUEST
            )
        
        if not all([
            check_password(auth_admin_username, settings.ADMIN_USERNAME),
            check_password(auth_admin_password, settings.ADMIN_PASSWORD)
        ]):
            raise AuthenticationFailed(
                detail={'error': AuthenticationConstants.AUTHENTICATION_INVALID_CREDENTIALS_MESSAGE},
                code=status.HTTP_401_UNAUTHORIZED
            )

        return (AnonymousUser(), None)
