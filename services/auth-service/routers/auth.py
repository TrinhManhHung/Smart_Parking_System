from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db, User
from schemas import (
    UserCreate, UserLogin, Token, UserProfile, UserUpdate,
    VehicleCreate, VehicleUpdate, Vehicle,
    PaymentMethodCreate, PaymentMethodUpdate, PaymentMethod,
    FavoriteParkingCreate, FavoriteParkingUpdate, FavoriteParking
)
from services.auth_service import AuthService
from typing import List

router = APIRouter()
auth_service = AuthService()

def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    import jwt
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, "your-secret-key", algorithms=["HS256"])
        return payload["user_id"]
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/health")
def health():
    return {"status": "ok"}

@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register(user, db)

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    return auth_service.login(user, db)

# User Profile Routes
@router.get("/profile", response_model=UserProfile)
def get_profile(db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return auth_service.get_user_profile(user_id, db)

@router.put("/profile", response_model=UserProfile)
def update_profile(user_update: UserUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return auth_service.update_user_profile(user_id, user_update, db)

# Vehicle Routes
@router.get("/vehicles", response_model=List[Vehicle])
def get_vehicles(db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return auth_service.get_user_vehicles(user_id, db)

@router.post("/vehicles", response_model=Vehicle)
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return auth_service.create_vehicle(user_id, vehicle, db)

@router.put("/vehicles/{vehicle_id}", response_model=Vehicle)
def update_vehicle(vehicle_id: int, vehicle_update: VehicleUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return auth_service.update_vehicle(user_id, vehicle_id, vehicle_update, db)

@router.delete("/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return auth_service.delete_vehicle(user_id, vehicle_id, db)

# Payment Methods Routes
@router.get("/payment-methods", response_model=List[PaymentMethod])
def get_payment_methods(db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return auth_service.get_payment_methods(user_id, db)

@router.post("/payment-methods", response_model=PaymentMethod)
def create_payment_method(payment: PaymentMethodCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return auth_service.create_payment_method(user_id, payment, db)

@router.put("/payment-methods/{payment_id}", response_model=PaymentMethod)
def update_payment_method(payment_id: int, payment_update: PaymentMethodUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return auth_service.update_payment_method(user_id, payment_id, payment_update, db)

@router.delete("/payment-methods/{payment_id}")
def delete_payment_method(payment_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return auth_service.delete_payment_method(user_id, payment_id, db)

# Favorite Parkings Routes
@router.get("/favorites", response_model=List[FavoriteParking])
def get_favorites(db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return auth_service.get_favorite_parkings(user_id, db)

@router.post("/favorites", response_model=FavoriteParking)
def add_favorite(favorite: FavoriteParkingCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return auth_service.add_favorite_parking(user_id, favorite, db)

@router.put("/favorites/{favorite_id}", response_model=FavoriteParking)
def update_favorite(favorite_id: int, favorite_update: FavoriteParkingUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return auth_service.update_favorite_parking(user_id, favorite_id, favorite_update, db)

@router.delete("/favorites/{favorite_id}")
def remove_favorite(favorite_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return auth_service.remove_favorite_parking(user_id, favorite_id, db)