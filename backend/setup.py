import argparse
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

from app.db.session import engine
from app.models.models import User, UserRole, Base
from app.core.auth import get_password_hash
from app.db.session import SessionLocal

def setup_database_and_admin(username, password):
    print("--- Starting Database and Admin Setup ---")
    
    print("Initializing database and creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")
    
    db = SessionLocal()
    try:
        db_user = db.query(User).filter(User.username == username).first()
        if db_user:
            print(f"User '{username}' already exists. Updating to SUPER_ADMIN.")
            db_user.role = UserRole.SUPER_ADMIN
            db_user.is_verified = True
        else:
            print(f"Creating new SUPER_ADMIN user: {username}")
            hashed_password = get_password_hash(password)
            db_user = User(
                username=username,
                hashed_password=hashed_password,
                role=UserRole.SUPER_ADMIN,
                is_verified=True
            )
            db.add(db_user)
        
        db.commit()
        print(f"Successfully created or updated super admin '{username}'.")

    finally:
        db.close()
        print("--- Setup Complete ---")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Setup the database and create a super admin user.")
    parser.add_argument("username", help="Username for the super admin.")
    parser.add_argument("password", help="Password for the super admin.")
    args = parser.parse_args()
    setup_database_and_admin(args.username, args.password)