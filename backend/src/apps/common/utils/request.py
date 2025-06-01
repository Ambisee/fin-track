from rest_framework.request import Request


def get_header(request: Request, header: str):
    """Get a header value from the request

    Params
    ------
    request: Request
        The request object
    header: str
        The header to access

    Returns
    -------
    str | dict | None
        The header's value. It should either be a string, an array, a JSON object, or None
    """
    key = f"HTTP_{'_'.join(header.upper().split('-'))}"
    return request.META.get(key)
