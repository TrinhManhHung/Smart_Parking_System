import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session
from database import User
from schemas import UserCreate, UserLogin, Token

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

class AuthService:
    def register(self, user: UserCreate, db: Session):
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
        db_user = User(email=user.email, password=hashed_password.decode('utf-8'))
        db.add(db_user)
        db.commit()
        
        token = self._create_token(db_user.id)
        return Token(access_token=token, token_type="bearer")
    
    def login(self, user: UserLogin, db: Session):
        db_user = db.query(User).filter(User.email == user.email).first()
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Password in database is stored as string (decoded hash)
        # Need to encode it back to bytes for bcrypt verification
        stored_password_bytes = db_user.password.encode('utf-8')
        
        if not bcrypt.checkpw(user.password.encode('utf-8'), stored_password_bytes):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        token = self._create_token(db_user.id)
        return Token(access_token=token, token_type="bearer")
    
    def _create_token(self, user_id: int):
        payload = {
            "user_id": user_id,
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)