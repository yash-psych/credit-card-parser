import hashlib
import ocrmypdf
import pdfplumber
import re
from fastapi import APIRouter, UploadFile, File, HTTPException, Header, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models.models import FileUpload
from auth.auth import get_current_user
import json
import os
import tempfile

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ACCEPTED_FILE_TYPES = ["application/pdf"]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def extract_data_from_text(text):
    """
    Uses regular expressions to find key data points in the OCR'd text.
    This can be expanded for more accuracy and more card types.
    """
    issuer = "Unknown"
    # Identify the issuer
    if re.search(r'HDFC Bank', text, re.IGNORECASE):
        issuer = "HDFC"
    elif re.search(r'ICICI Bank', text, re.IGNORECASE):
        issuer = "ICICI"
    elif re.search(r'State Bank of India|SBI', text, re.IGNORECASE):
        issuer = "SBI"
    elif re.search(r'Axis Bank', text, re.IGNORECASE):
        issuer = "Axis Bank"
    elif re.search(r'American Express|AMEX', text, re.IGNORECASE):
        issuer = "American Express"

    # Regex patterns to find the data points. These are examples and may need refinement.
    total_due_pattern = re.search(r'Total Amount Due.*?([0-9,]+\.\d{2})', text, re.IGNORECASE | re.DOTALL)
    min_due_pattern = re.search(r'Minimum Amount Due.*?([0-9,]+\.\d{2})', text, re.IGNORECASE | re.DOTALL)
    due_date_pattern = re.search(r'Payment Due Date.*?(\d{2}[-/]\d{2}[-/]\d{4})', text, re.IGNORECASE | re.DOTALL)
    statement_date_pattern = re.search(r'Statement Date.*?(\d{2}[-/]\d{2}[-/]\d{4})', text, re.IGNORECASE | re.DOTALL)
    card_no_pattern = re.search(r'Card No.*?(\d{4})', text, re.IGNORECASE | re.DOTALL)

    return {
        "issuer": issuer,
        "last_4_digits": card_no_pattern.group(1) if card_no_pattern else "N/A",
        "statement_date": statement_date_pattern.group(1) if statement_date_pattern else "N/A",
        "due_date": due_date_pattern.group(1) if due_date_pattern else "N/A",
        "total_due": total_due_pattern.group(1) if total_due_pattern else "N/A",
        "minimum_due": min_due_pattern.group(1) if min_due_pattern else "N/A",
    }


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
            raise HTTPException(
                status_code=400, detail=f"File '{file.filename}' is not a PDF.")
        if file.size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, detail=f"File '{file.filename}' exceeds the 5MB limit.")

        content = await file.read()
        file_hash = hashlib.sha256(content).hexdigest()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        ocr_output_path = temp_file_path.replace(".pdf", "_ocr.pdf")

        try:
            # CORRECTED LINE: Removed skip_text=True to resolve the conflict.
            ocrmypdf.ocr(temp_file_path, ocr_output_path, force_ocr=True)

            extracted_text = ""
            with pdfplumber.open(ocr_output_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        extracted_text += page_text + "\n"
            
            data_points = extract_data_from_text(extracted_text)

            upload = FileUpload(
                filename=file.filename,
                file_hash=file_hash,
                issuer=data_points.get("issuer"),
                extracted_data=json.dumps(data_points),
                user_id=current_user.id
            )

            db.add(upload)
            db.commit()
            db.refresh(upload)
            result.append(
                {"file": file.filename, "issuer": data_points.get("issuer"), "data": data_points})

        except Exception as e:
            print(f"Error processing file '{file.filename}': {e}")
            raise HTTPException(
                status_code=500, detail=f"Error processing file '{file.filename}'.")
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            if os.path.exists(ocr_output_path):
                os.remove(ocr_output_path)

    return {"uploaded": result}


@router.get("/history")
def get_history(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "")
    current_user = get_current_user(token, db)
    uploads = db.query(FileUpload).filter(
        FileUpload.user_id == current_user.id).all()
    
    history_list = []
    for u in uploads:
        data = {}
        if isinstance(u.extracted_data, str):
            try:
                data = json.loads(u.extracted_data)
            except json.JSONDecodeError:
                data = {}
        elif isinstance(u.extracted_data, dict):
            data = u.extracted_data

        history_list.append({
            "filename": u.filename,
            "issuer": u.issuer,
            "data": data,
        })
    return history_list
