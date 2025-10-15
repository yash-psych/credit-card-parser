from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite Database URL (file-based database)
SQLALCHEMY_DATABASE_URL = "sqlite:///./credit_parser.db"

# For PostgreSQL, use this format instead:
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/dbname"

# Create SQLAlchemy engine
# connect_args={"check_same_thread": False} is needed only for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for declarative models
Base = declarative_base()

# Dependency function to get database session
def get_db():
    """
    Dependency that creates a new database session for each request
    and closes it when the request is finished
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
