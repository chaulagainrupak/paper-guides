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
        
        super().__init__(
            filename=filename,
            when=when,
            interval=interval,
            backupCount=backupCount,
            encoding='utf-8'
        )
        
        self.setFormatter(logging.Formatter(
            '%(asctime)s - %(levelname)s - [%(name)s] - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        ))
        
        # Store the current date
        self.current_date = datetime.now().strftime('%Y-%m-%d')

    def emit(self, record):
        # Check if date has changed
        now = datetime.now()
        current_date = now.strftime('%Y-%m-%d')
        
        # If date has changed, perform rollover
        if current_date != self.current_date:
            self.current_date = current_date
            self.doRollover()
        
        try:
            if hasattr(record, 'http_request') and request:
                record.msg = f"{record.msg} - IP: {request.remote_addr}"
                
            if request:
                try:
                    record.msg = f"{record.msg} - Endpoint: {request.endpoint} - Method: {request.method}"
                except Exception:
                    pass
                    
        except Exception:
            pass
        
        super().emit(record)

    def doRollover(self):
        """
        Override doRollover to use date-based filenames
        """
        if self.stream:
            self.stream.close()
            self.stream = None

        # Generate new filename with date
        current_time = datetime.now()
        new_filename = os.path.join(
            os.path.dirname(self.baseFilename),
            f"{current_time.strftime('%Y-%m-%d')}.log"
        )
        
        # Update the base filename to the new date-based filename
        self.baseFilename = new_filename
        
        # Open new file
        self.stream = self._open()

def getCustomLogger(name, log_directory='logs'):
    """
    Creates or retrieves a logger with custom configuration
    """
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        # Create log filename based on current date
        today_filename = f'{datetime.now().strftime("%Y-%m-%d")}.log'
        log_file = os.path.join(log_directory, today_filename)
        
        handler = CustomLogHandler(log_file)
        logger.addHandler(handler)
    
    return logger