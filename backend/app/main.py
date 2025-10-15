from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, files, export , admin
from app.models.models import Base
from app.db.session import engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Credit Card Parser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(files.router, prefix="/files", tags=["Files"])
app.include_router(export.router, prefix="/data", tags=["Data"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Credit Card Parser API"}