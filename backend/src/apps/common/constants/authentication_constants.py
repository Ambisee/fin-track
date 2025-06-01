class AuthenticationConstants:
    # Authentication headers
    AUTHENTICATION_ADMIN_AUTH_USERNAME_HEADER = "X-ADMIN-AUTH-USERNAME"
    AUTHENTICATION_ADMIN_AUTH_PASSWORD_HEADER = "X-ADMIN-AUTH-PASSWORD"

    # Authentication error messages
    AUTHENTICATION_INVALID_PAYLOAD_MESSAGE = "AuthenticationError: Invalid authentication payload."
    AUTHENTICATION_INVALID_AUTH_HEADER_MESSAGE = "AuthenticationError: Unauthorized request received."
    AUTHENTICATION_INVALID_CREDENTIALS_MESSAGE = "AuthenticationError: " \
        "Invalid credentials. Please provide valid credentials."
