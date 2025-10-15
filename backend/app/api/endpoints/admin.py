from fastapi import APIRouter, Depends, HTTPException
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

@router.post("/users/{user_id}/verify", response_model=admin_schema.UserView)
def verify_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_admin: models.User = Depends(deps.get_current_admin_user)
):
    user_to_verify = db.query(models.User).filter(models.User.id == user_id).first()
    if not user_to_verify:
        raise HTTPException(status_code=404, detail="User not found")

    user_to_verify.is_verified = True
    db.commit()
    db.refresh(user_to_verify)
    return user_to_verify