from pydantic import BaseModel
from typing import Optional, Dict, Any

class FileUploadResponse(BaseModel):
    filename: str
    issuer: Optional[str]
    data: Optional[Dict[str, Any]]

class HistoryResponse(BaseModel):
    filename: str
    issuer: Optional[str]
    data: Optional[Dict[str, Any]]