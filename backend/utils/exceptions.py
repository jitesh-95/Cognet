from fastapi import HTTPException

class URLValidationError(HTTPException):
    def __init__(self, detail: str = "URL validation failed"):
        super().__init__(status_code=400, detail=detail)
