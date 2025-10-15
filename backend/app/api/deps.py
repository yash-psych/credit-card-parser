from fastapi import Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from typing import Optional

from app.core.config import settings
from app.db.session import SessionLocal
from app.models import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _get_user_from_token_str(token: str, db: Session):
    """Decodes a token string and retrieves the user from the database."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Standard dependency to get a user from the Authorization header."""
    return _get_user_from_token_str(token, db)


def get_current_user_from_token(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Query(None) 
):
    """
    Retrieves user from a token passed as an 'authorization' query parameter.
    This is specifically for browser link-based downloads.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated: No authorization token provided in URL.",
        )
    
    token_to_decode = authorization.replace("Bearer ", "")
    return _get_user_from_token_str(token_to_decode, db)