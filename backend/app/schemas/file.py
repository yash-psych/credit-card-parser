from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class FileUploadResponse(BaseModel):
    """Schema for file upload response"""
    filename: str
    issuer: str
    data: Dict[str, Any]

class HistoryResponse(BaseModel):
    """Schema for history response"""
    filename: str
    issuer: str
    data: Dict[str, Any]
    
    class Config:
        from_attributes = True
