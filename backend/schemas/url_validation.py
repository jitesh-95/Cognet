from pydantic  import BaseModel, HttpUrl

class URLRequest(BaseModel):
    url: HttpUrl

class URLResponse(BaseModel):
    url: str
    status: str
    status_code: int | None = None
    message: str
