from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, User
from schemas import UserCreate, UserLogin, Token
from services.auth_service import AuthService

router = APIRouter()
auth_service = AuthService()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register(user, db)

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    return auth_service.login(user, db)