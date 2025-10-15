from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models import models
from app.schemas import admin as admin_schema

router = APIRouter()

@router.get("/users", response_model=admin_schema.UserListResponse)
def get_all_users(
    db: Session = Depends(deps.get_db),
    current_admin: models.User = Depends(deps.get_current_admin_user)
):
    users = db.query(models.User).all()
    return {"users": users}