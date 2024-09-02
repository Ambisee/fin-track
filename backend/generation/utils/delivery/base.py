from os import PathLike


class BaseDeliveryEngine:
    def __init__(self):
        pass

    def send_email(
            self,
            subject: str,
            content: str,
            to_address: str,
            attachment_filepath: PathLike,
            attachment_filename: str
    ):
        """Send an email with a report document attachment to a user's email address

        Params
        ------
        subject: str
            The subject of the email
        content: str
            The body content of the email
        to_address: str
            The receiver's email address
        attachment_filename: PathLike
            The absolute path of the filename to be attached
        attachment_filename: str
            | The filename that will be displayed in the user's inbox.
            | It should include the file extension of the file

        Returns
        -------
        None
        """
        pass
