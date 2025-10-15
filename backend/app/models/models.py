from sqlalchemy import (
    Column, Integer, String, ForeignKey, DateTime, JSON,
    Enum as SQLAlchemyEnum, Boolean, UniqueConstraint
)
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLAlchemyEnum(UserRole), default=UserRole.USER, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    status = Column(SQLAlchemyEnum(UserStatus), default=UserStatus.ACTIVE, nullable=False)

    uploads = relationship("FileUpload", back_populates="owner")


class FileUpload(Base):
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True, nullable=False)
    file_hash = Column(String, index=True, nullable=False)  # 🔹 removed unique=True
    issuer = Column(String, nullable=True)
    extracted_data = Column(JSON, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="uploads")

    __table_args__ = (
        UniqueConstraint('file_hash', 'user_id', name='uix_file_hash_user'),
    )
