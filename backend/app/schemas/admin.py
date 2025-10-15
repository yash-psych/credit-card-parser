from pydantic import BaseModel, ConfigDict
from typing import List

class UserView(BaseModel):
    id: int
    username: str
    role: str
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)

class UserListResponse(BaseModel):
    users: List[UserView]