from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


class PingView(APIView):
    
    permission_classes = []

    def get(self, request: Request):
        """Signal that the server is currently online

        Request
        -------
        None

        Response
        --------
        - Success:
            - code: 200
            - content-type: `application/json`
            - body:
                - `message: str` - a server online indication message
        """
        return Response({"message": "Server online"}, status=status.HTTP_200_OK)
