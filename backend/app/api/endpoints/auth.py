from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas import user as user_schema
from app.core.auth import verify_password, create_access_token, get_password_hash
from app.models import models

router = APIRouter()

@router.post("/register", response_model=user_schema.UserInDB)
def register(user_in: user_schema.UserCreate, db: Session = Depends(deps.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user_in.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user_in.password)
    new_user = models.User(username=user_in.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ✅ SINGLE working login route
@router.post("/login", response_model=user_schema.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(deps.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Optional: handle suspended users
    if getattr(user, "status", None) == getattr(models, "UserStatus", None).SUSPENDED:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is suspended")

    # Create and return JWT token
    token_data = {"sub": user.username, "role": getattr(user.role, "value", user.role)}
    access_token = create_access_token(data=token_data)

    return {"access_token": access_token, "token_type": "bearer"}
