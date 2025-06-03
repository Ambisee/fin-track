import logging


class CommonLogger:
    logger = logging.getLogger("common")

    @staticmethod
    def d(message: str):
        CommonLogger.logger.debug(message)

    @staticmethod
    def i(message: str):
        CommonLogger.logger.info(message)

    @staticmethod
    def e(message: str):
        CommonLogger.logger.error(message)

    @staticmethod
    def w(message: str):
        CommonLogger.logger.warning(message)
