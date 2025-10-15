import hashlib
import ocrmypdf
import pdfplumber
import re
import json
import os
import tempfile
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models import models
from app.schemas import file as file_schema
from pydantic import BaseModel

class UploadResponse(BaseModel):
    processed: List[file_schema.FileUploadResponse]
    skipped: List[str] # List of filenames that were skipped

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024
ACCEPTED_FILE_TYPES = ["application/pdf"]

def extract_data_from_text(text: str) -> dict:
    issuer = "Unknown"
    if re.search(r'HDFC Bank', text, re.IGNORECASE): issuer = "HDFC"
    elif re.search(r'ICICI Bank', text, re.IGNORECASE): issuer = "ICICI"
    elif re.search(r'State Bank of India|SBI', text, re.IGNORECASE): issuer = "SBI"
    elif re.search(r'Axis Bank', text, re.IGNORECASE): issuer = "Axis Bank"
    elif re.search(r'American Express|AMEX', text, re.IGNORECASE): issuer = "American Express"
    card_no_pattern = re.search(r'Card No.*?(\d{4})', text, re.IGNORECASE | re.DOTALL)
    due_date_pattern = re.search(r'Payment Due Date.*?(\d{2}[-/]\d{2}[-/]\d{4})', text, re.IGNORECASE | re.DOTALL)
    total_due_pattern = re.search(r'Total Amount Due.*?([0-9,]+\.\d{2})', text, re.IGNORECASE | re.DOTALL)
    statement_date_pattern = re.search(r'Statement Date.*?(\d{2}[-/]\d{2}[-/]\d{4})', text, re.IGNORECASE | re.DOTALL)
    card_variant_pattern = re.search(r'\b(Platinum|Millennia|Regalia|Infinia|Signature|Ultimate)\b', text, re.IGNORECASE)
    return {
        "issuer": issuer, "last_4_digits": card_no_pattern.group(1) if card_no_pattern else "N/A",
        "card_variant": card_variant_pattern.group(1) if card_variant_pattern else "N/A",
        "billing_cycle": statement_date_pattern.group(1) if statement_date_pattern else "N/A",
        "payment_due_date": due_date_pattern.group(1) if due_date_pattern else "N/A",
        "total_balance": total_due_pattern.group(1) if total_due_pattern else "N/A",
    }

@router.post("/upload", response_model=UploadResponse)
async def upload_files(
    files: List[UploadFile] = File(...),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if not current_user.is_verified:
        raise HTTPException(
            status_code=403, 
            detail="Your account is not verified. Please contact an admin to enable file uploads."
        )

    processed_files = []
    skipped_files = []
    for file in files:
        if file.content_type not in ACCEPTED_FILE_TYPES:
            raise HTTPException(status_code=400, detail=f"File '{file.filename}' is not a PDF.")
        if file.size > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"File '{file.filename}' exceeds 5MB.")

        content = await file.read()
        file_hash = hashlib.sha256(content).hexdigest()

        existing_file = db.query(models.FileUpload).filter(
            models.FileUpload.file_hash == file_hash,
            models.FileUpload.user_id == current_user.id
        ).first()

        if existing_file:
            skipped_files.append(file.filename)
            continue

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        ocr_output_path = temp_file_path.replace(".pdf", "_ocr.pdf")

        try:
            ocrmypdf.ocr(temp_file_path, ocr_output_path, force_ocr=True)
            text = ""
            with pdfplumber.open(ocr_output_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            
            data = extract_data_from_text(text)
            
            new_upload = models.FileUpload(
                filename=file.filename,
                file_hash=file_hash,
                issuer=data.get("issuer"),
                extracted_data=json.dumps(data),
                user_id=current_user.id
            )
            
            db.add(new_upload)
            db.commit()
            db.refresh(new_upload)
            
            processed_files.append({"filename": file.filename, "issuer": data.get("issuer"), "data": data})

        except Exception as e:
            db.rollback()
            print(f"An error occurred during file processing: {e}")
            raise HTTPException(status_code=500, detail="An unexpected error occurred during file processing.")
        finally:
            if os.path.exists(temp_file_path): os.remove(temp_file_path)
            if os.path.exists(ocr_output_path): os.remove(ocr_output_path)
                
    return {"processed": processed_files, "skipped": skipped_files}

@router.get("/history", response_model=List[file_schema.HistoryResponse])
def get_history(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    uploads = db.query(models.FileUpload).filter(models.FileUpload.user_id == current_user.id).order_by(models.FileUpload.uploaded_at.desc()).all()
    history = []
    for upload in uploads:
        history.append({
            "filename": upload.filename,
            "issuer": upload.issuer,
            "data": json.loads(upload.extracted_data) if isinstance(upload.extracted_data, str) else upload.extracted_data
        })
    return history


@router.get("/export")
def export_data(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if not current_user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Your account is not verified. Please contact an admin to enable data export."
        )

    # Fetch all of the user's data
    user_uploads = db.query(models.FileUpload).filter(models.FileUpload.user_id == current_user.id).all()
    

    export_data = [
        {
            "filename": upload.filename,
            "issuer": upload.issuer,
            "uploaded_at": upload.uploaded_at,
            "data": json.loads(upload.extracted_data) if isinstance(upload.extracted_data, str) else upload.extracted_data,
        }
        for upload in user_uploads
    ]

    return export_data