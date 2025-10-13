from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import auth
from parser import parser
from database import Base, engine

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Credit Card Parser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(parser.router, prefix="/files", tags=["Files"])

@app.get("/")
def root():
    return {"message": "Backend Running 🚀"}