# backend/parser/parser.py
import hashlib
import pdfplumber
from fastapi import APIRouter, UploadFile, File, HTTPException, Header, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models.models import FileUpload, User
from backend.auth.auth import get_current_user
import json

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload")
async def upload_files(
    files: list[UploadFile] = File(...),
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    token = authorization.replace("Bearer ", "")
    current_user = get_current_user(token, db)
    result = []

    for file in files:
        content = await file.read()
        file_hash = hashlib.sha256(content).hexdigest()

        # Parse PDF text
        extracted_text = ""
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                extracted_text += page.extract_text() + "\n"

        # Example parsing logic (replace with your own)
        issuer = "Unknown"
        if "HDFC" in extracted_text.upper():
            issuer = "HDFC"
        elif "ICICI" in extracted_text.upper():
            issuer = "ICICI"
        elif "SBI" in extracted_text.upper():
            issuer = "SBI"

        # Example extracted data (replace with real parsing logic)
        data_points = {
            "issuer": issuer,
            "last_4_digits": "1234",
            "total_due": "₹5000",
            "min_due": "₹1000",
            "due_date": "15/10/2025"
        }

        upload = FileUpload(
            filename=file.filename,
            file_hash=file_hash,
            issuer=issuer,
            extracted_data=json.dumps(data_points),
            user_id=current_user.id
        )

        db.add(upload)
        db.commit()
        db.refresh(upload)
        result.append({"file": file.filename, "issuer": issuer, "data": data_points})

    return {"uploaded": result}

@router.get("/history")
def get_history(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "")
    current_user = get_current_user(token, db)
    uploads = db.query(FileUpload).filter(FileUpload.user_id == current_user.id).all()
    return [
        {
            "filename": u.filename,
            "issuer": u.issuer,
            "data": json.loads(u.extracted_data) if u.extracted_data else {}
        }
        for u in uploads
    ]
