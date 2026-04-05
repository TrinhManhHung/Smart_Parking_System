import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session
from database import User, Vehicle, PaymentMethod, FavoriteParking
from schemas import (
    UserCreate, UserLogin, Token, UserProfile, UserUpdate,
    VehicleCreate, VehicleUpdate, Vehicle as VehicleSchema,
    PaymentMethodCreate, PaymentMethodUpdate, PaymentMethod as PaymentMethodSchema,
    FavoriteParkingCreate, FavoriteParkingUpdate, FavoriteParking as FavoriteParkingSchema
)

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

class AuthService:
    def register(self, user: UserCreate, db: Session):
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
        db_user = User(
            email=user.email, 
            password=hashed_password.decode('utf-8'),
            full_name=user.full_name,
            phone=user.phone
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        token = self._create_token(db_user.id)
        user_profile = UserProfile.from_orm(db_user)
        return Token(access_token=token, token_type="bearer", user=user_profile)
    
    def login(self, user: UserLogin, db: Session):
        db_user = db.query(User).filter(User.email == user.email).first()
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        stored_password_bytes = db_user.password.encode('utf-8')
        
        if not bcrypt.checkpw(user.password.encode('utf-8'), stored_password_bytes):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        token = self._create_token(db_user.id)
        user_profile = UserProfile.from_orm(db_user)
        return Token(access_token=token, token_type="bearer", user=user_profile)
    
    def get_user_profile(self, user_id: int, db: Session):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserProfile.from_orm(user)
    
    def update_user_profile(self, user_id: int, user_update: UserUpdate, db: Session):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user_update.full_name is not None:
            user.full_name = user_update.full_name
        if user_update.phone is not None:
            user.phone = user_update.phone
        if user_update.avatar_url is not None:
            user.avatar_url = user_update.avatar_url
        
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return UserProfile.from_orm(user)
    
    # Vehicle Management
    def get_user_vehicles(self, user_id: int, db: Session):
        vehicles = db.query(Vehicle).filter(Vehicle.user_id == user_id).all()
        return vehicles
    
    def create_vehicle(self, user_id: int, vehicle: VehicleCreate, db: Session):
        # Check if license plate already exists
        existing = db.query(Vehicle).filter(Vehicle.license_plate == vehicle.license_plate).first()
        if existing:
            raise HTTPException(status_code=400, detail="License plate already registered")
        
        # If this is set as default, unset other defaults
        if vehicle.is_default:
            db.query(Vehicle).filter(Vehicle.user_id == user_id).update({"is_default": False})
        
        db_vehicle = Vehicle(user_id=user_id, **vehicle.dict())
        db.add(db_vehicle)
        db.commit()
        db.refresh(db_vehicle)
        return db_vehicle
    
    def update_vehicle(self, user_id: int, vehicle_id: int, vehicle_update: VehicleUpdate, db: Session):
        vehicle = db.query(Vehicle).filter(
            Vehicle.id == vehicle_id, 
            Vehicle.user_id == user_id
        ).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # If setting as default, unset other defaults
        if vehicle_update.is_default:
            db.query(Vehicle).filter(Vehicle.user_id == user_id).update({"is_default": False})
        
        for key, value in vehicle_update.dict(exclude_unset=True).items():
            setattr(vehicle, key, value)
        
        db.commit()
        db.refresh(vehicle)
        return vehicle
    
    def delete_vehicle(self, user_id: int, vehicle_id: int, db: Session):
        vehicle = db.query(Vehicle).filter(
            Vehicle.id == vehicle_id,
            Vehicle.user_id == user_id
        ).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        db.delete(vehicle)
        db.commit()
        return {"message": "Vehicle deleted successfully"}
    
    # Payment Methods Management
    def get_payment_methods(self, user_id: int, db: Session):
        methods = db.query(PaymentMethod).filter(PaymentMethod.user_id == user_id).all()
        return methods
    
    def create_payment_method(self, user_id: int, payment: PaymentMethodCreate, db: Session):
        # If this is set as default, unset other defaults
        if payment.is_default:
            db.query(PaymentMethod).filter(PaymentMethod.user_id == user_id).update({"is_default": False})
        
        # Only store last 4 digits of card number
        if payment.card_number and len(payment.card_number) > 4:
            payment.card_number = "**** **** **** " + payment.card_number[-4:]
        
        db_payment = PaymentMethod(user_id=user_id, **payment.dict())
        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)
        return db_payment
    
    def update_payment_method(self, user_id: int, payment_id: int, payment_update: PaymentMethodUpdate, db: Session):
        payment = db.query(PaymentMethod).filter(
            PaymentMethod.id == payment_id,
            PaymentMethod.user_id == user_id
        ).first()
        if not payment:
            raise HTTPException(status_code=404, detail="Payment method not found")
        
        # If setting as default, unset other defaults
        if payment_update.is_default:
            db.query(PaymentMethod).filter(PaymentMethod.user_id == user_id).update({"is_default": False})
        
        for key, value in payment_update.dict(exclude_unset=True).items():
            setattr(payment, key, value)
        
        db.commit()
        db.refresh(payment)
        return payment
    
    def delete_payment_method(self, user_id: int, payment_id: int, db: Session):
        payment = db.query(PaymentMethod).filter(
            PaymentMethod.id == payment_id,
            PaymentMethod.user_id == user_id
        ).first()
        if not payment:
            raise HTTPException(status_code=404, detail="Payment method not found")
        
        db.delete(payment)
        db.commit()
        return {"message": "Payment method deleted successfully"}
    
    # Favorite Parkings Management
    def get_favorite_parkings(self, user_id: int, db: Session):
        favorites = db.query(FavoriteParking).filter(FavoriteParking.user_id == user_id).all()
        return favorites
    
    def add_favorite_parking(self, user_id: int, favorite: FavoriteParkingCreate, db: Session):
        # Check if already favorited
        existing = db.query(FavoriteParking).filter(
            FavoriteParking.user_id == user_id,
            FavoriteParking.parking_id == favorite.parking_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Parking already in favorites")
        
        db_favorite = FavoriteParking(user_id=user_id, **favorite.dict())
        db.add(db_favorite)
        db.commit()
        db.refresh(db_favorite)
        return db_favorite
    
    def update_favorite_parking(self, user_id: int, favorite_id: int, favorite_update: FavoriteParkingUpdate, db: Session):
        favorite = db.query(FavoriteParking).filter(
            FavoriteParking.id == favorite_id,
            FavoriteParking.user_id == user_id
        ).first()
        if not favorite:
            raise HTTPException(status_code=404, detail="Favorite not found")
        
        if favorite_update.nickname is not None:
            favorite.nickname = favorite_update.nickname
        
        db.commit()
        db.refresh(favorite)
        return favorite
    
    def remove_favorite_parking(self, user_id: int, favorite_id: int, db: Session):
        favorite = db.query(FavoriteParking).filter(
            FavoriteParking.id == favorite_id,
            FavoriteParking.user_id == user_id
        ).first()
        if not favorite:
            raise HTTPException(status_code=404, detail="Favorite not found")
        
        db.delete(favorite)
        db.commit()
        return {"message": "Favorite removed successfully"}
    
    def _create_token(self, user_id: int):
        payload = {
            "user_id": user_id,
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)