import hashlib
import pdfplumber
from fastapi import APIRouter, UploadFile, File, HTTPException, Header, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models.models import FileUpload
from auth.auth import get_current_user
import json

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024 # 5 MB
ACCEPTED_FILE_TYPES = ["application/pdf"]

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
        if file.content_type not in ACCEPTED_FILE_TYPES:
            raise HTTPException(status_code=400, detail=f"File '{file.filename}' is not a PDF.")
        if file.size > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"File '{file.filename}' exceeds the 5MB limit.")

        content = await file.read()
        file_hash = hashlib.sha256(content).hexdigest()

        await file.seek(0)

        extracted_text = ""
        try:
            with pdfplumber.open(file.file) as pdf:
                for page in pdf.pages:
                    extracted_text += page.extract_text() + "\n"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not parse PDF file '{file.filename}': {e}")

        issuer = "Unknown"
        if "HDFC" in extracted_text.upper():
            issuer = "HDFC"
        elif "ICICI" in extracted_text.upper():
            issuer = "ICICI"
        elif "SBI" in extracted_text.upper():
            issuer = "SBI"

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
            extracted_data=data_points,
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
            "data": u.extracted_data if u.extracted_data else {}
        }
        for u in uploads
    ]