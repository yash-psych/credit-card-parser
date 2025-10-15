from pydantic import BaseModel
from typing import List

class UserView(BaseModel):
    id: int
    username: str
    role: str

class UserListResponse(BaseModel):
    users: List[UserView]