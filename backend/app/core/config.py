from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """
    Application settings and configuration
    """
    # API Settings
    PROJECT_NAME: str = "Credit Card Statement Parser"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security Settings
    SECRET_KEY: str = "your-secret-key-here-change-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./credit_parser.db"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
