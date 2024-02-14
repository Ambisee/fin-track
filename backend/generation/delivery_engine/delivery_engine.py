import os
from os import PathLike

import resend


class DeliveryEngine:
    def __init__(self):
        resend.api_key = os.getenv("RESEND_KEY")

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
            'from': 'FinTrack Servers <noreply-fintrack@resend.dev>',
            'to': to_address,
            'subject': subject,
            "html": content,
            'attachments': [
                {'filename': attachment_filename, 'content': file_content}
            ]
        }

        response = resend.Emails.send(params)
        return response
