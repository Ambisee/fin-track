import os
import smtplib
from email import encoders
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from django.conf import settings

from .base import BaseDeliveryEngine


class GmailDeliveryEngine(BaseDeliveryEngine):
    def __init__(self):
        self.host = "smtp.gmail.com"
        self.port = 465
        self.email = settings.GMAIL_EMAIL
        self.username = settings.GMAIL_EMAIL
        self.password = settings.GMAIL_PASSWORD
    
    def send_email(self, subject, content, to_address, attachment_filepath: os.PathLike, attachment_filename: str):
        # Attachment
        attachment_part = MIMEBase("application", "pdf")
        with open(attachment_filepath, "rb") as f:
            attachment_part.set_payload(f.read())
        encoders.encode_base64(attachment_part)
        attachment_part.add_header(
            "Content-Disposition",
            f"attachment; filename={attachment_filename}"
        )

        # Content
        content_part = MIMEText(content, "html")

        # Prepare the main message
        message = MIMEMultipart()
        
        message["Subject"] = subject
        message["From"] = self.email
        message["To"] = to_address

        message.attach(content_part)
        message.attach(attachment_part)

        with smtplib.SMTP_SSL(self.host, self.port) as smtp_server:
            smtp_server.login(self.username, self.password)
            smtp_server.sendmail(self.email, to_address, message.as_string())

        return
