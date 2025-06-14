from rest_framework import status
from rest_framework.request import Request
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication

from gotrue.errors import AuthApiError

from ..supabase.supabase import client
from ..utils.request import get_header
from ..constants import AuthenticationConstants


class SupabaseAuthentication(BaseAuthentication):
    
    def authenticate(self, request: Request):
        auth_header = get_header(request, "Authorization")

        # Check for the existence of the token in the payload
        if auth_header is None:
            raise AuthenticationFailed(
                detail={"error": AuthenticationConstants.AUTHENTICATION_INVALID_AUTH_HEADER_MESSAGE},
                code=status.HTTP_400_BAD_REQUEST
            )

        # Check if the token is valid
        auth_scheme, auth_token = auth_header.split(" ")
        if auth_scheme != "Bearer":
            raise AuthenticationFailed(
                detail={"error": AuthenticationConstants.AUTHENTICATION_INVALID_PAYLOAD_MESSAGE},
                code=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_response = client.auth.get_user(auth_token)
            if user_response is None:
                raise AuthenticationFailed(
                    detail={"error": AuthenticationConstants.AUTHENTICATION_INVALID_CREDENTIALS_MESSAGE},
                    code=status.HTTP_401_UNAUTHORIZED
                )
        except AuthApiError as api_error:
            raise AuthenticationFailed(
                detail={"error": api_error.message},
                code=status.HTTP_400_BAD_REQUEST
            )

        return (user_response.user, None)
