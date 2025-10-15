from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models import models
from app.schemas import admin as admin_schema
from app.core.auth import get_password_hash
import secrets

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
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = True
    db.commit()
    db.refresh(user)
    return user

@router.post("/users/{user_id}/promote", response_model=admin_schema.UserView)
def promote_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    super_admin: models.User = Depends(deps.get_current_super_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    if user.role == models.UserRole.SUPER_ADMIN: raise HTTPException(status_code=400, detail="Cannot change super admin role")
    user.role = models.UserRole.ADMIN
    db.commit()
    db.refresh(user)
    return user

@router.post("/users/{user_id}/demote", response_model=admin_schema.UserView)
def demote_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    super_admin: models.User = Depends(deps.get_current_super_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    if user.role == models.UserRole.SUPER_ADMIN: raise HTTPException(status_code=400, detail="Cannot change super admin role")
    user.role = models.UserRole.USER
    db.commit()
    db.refresh(user)
    return user

@router.post("/users/{user_id}/toggle-suspend", response_model=admin_schema.UserView)
def toggle_suspend_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_admin: models.User = Depends(deps.get_current_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    if user.role == models.UserRole.SUPER_ADMIN: raise HTTPException(status_code=400, detail="Cannot suspend super admin")
    
    user.status = models.UserStatus.SUSPENDED if user.status == models.UserStatus.ACTIVE else models.UserStatus.ACTIVE
    db.commit()
    db.refresh(user)
    return user

@router.post("/users/{user_id}/reset-password")
def reset_password(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_admin: models.User = Depends(deps.get_current_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    if user.role == models.UserRole.SUPER_ADMIN: raise HTTPException(status_code=400, detail="Cannot reset super admin password")
    
    new_password = secrets.token_urlsafe(12)
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    return {"message": f"Password for user '{user.username}' has been reset.", "new_password": new_password}