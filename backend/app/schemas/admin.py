from pydantic import BaseModel, ConfigDict
from typing import List
from app.models.models import UserStatus # <-- Import UserStatus from your models

class UserView(BaseModel):
    id: int
    username: str
    role: str
    is_verified: bool
    status: UserStatus  # <-- Add this line

    model_config = ConfigDict(from_attributes=True)

class UserListResponse(BaseModel):
    users: List[UserView]