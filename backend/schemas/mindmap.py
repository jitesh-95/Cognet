from pydantic import BaseModel
    
class MindmapRequest(BaseModel):
    url: str