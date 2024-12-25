import logging
from logging.handlers import TimedRotatingFileHandler
import os
from datetime import datetime
from flask import request
import zipfile
import glob

class CustomLogHandler(TimedRotatingFileHandler):
    def __init__(self, filename, when='midnight', interval=1, backupCount=7):
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        super().__init__(filename, when, interval, backupCount)
        self.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))

    def emit(self, record):
        try:
            if hasattr(record, 'http_request'):
                record.msg = f"{record.msg} - IP: {request.remote_addr}"
        except Exception:
            pass
        super().emit(record)

def getCustomLogger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    log_directory = 'logs'
    today_filename = f'{datetime.now().strftime("%Y-%m-%d")}.log'
    log_file = os.path.join(log_directory, today_filename)

    handler = CustomLogHandler(log_file)
    logger.addHandler(handler)

    return logger