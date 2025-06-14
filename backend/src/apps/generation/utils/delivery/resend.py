from os import PathLike

import resend
from django.conf import settings


class ResendDeliveryEngine:
    def __init__(self):
        resend.api_key = settings.RESEND_KEY

    def send_email(
            self,
            subject,
            content,
            to_address,
            attachment_filepath: PathLike,
            attachment_filename: str
    ):
        with open(attachment_filepath, 'rb') as f:
            file_content = list(f.read())

        params = {
            'from': 'FinTrack System <fintrack.system@resend.dev>',
            'to': to_address,
            'subject': subject,
            "html": content,
            'attachments': [
                {'filename': attachment_filename, 'content': file_content}
            ]
        }

        resend.Emails.send(params)
        return
