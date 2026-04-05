from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class UserProfile(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    phone: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserProfile

# Vehicle Schemas
class VehicleCreate(BaseModel):
    license_plate: str
    vehicle_type: str
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    is_default: bool = False

class VehicleUpdate(BaseModel):
    vehicle_type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    is_default: Optional[bool] = None

class Vehicle(BaseModel):
    id: int
    user_id: int
    license_plate: str
    vehicle_type: str
    brand: Optional[str]
    model: Optional[str]
    color: Optional[str]
    is_default: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Payment Method Schemas
class PaymentMethodCreate(BaseModel):
    method_type: str
    card_number: Optional[str] = None
    card_holder: Optional[str] = None
    expiry_date: Optional[str] = None
    is_default: bool = False

class PaymentMethodUpdate(BaseModel):
    card_holder: Optional[str] = None
    expiry_date: Optional[str] = None
    is_default: Optional[bool] = None

class PaymentMethod(BaseModel):
    id: int
    user_id: int
    method_type: str
    card_number: Optional[str]
    card_holder: Optional[str]
    expiry_date: Optional[str]
    is_default: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Favorite Parking Schemas
class FavoriteParkingCreate(BaseModel):
    parking_id: int
    nickname: Optional[str] = None

class FavoriteParkingUpdate(BaseModel):
    nickname: Optional[str] = None

class FavoriteParking(BaseModel):
    id: int
    user_id: int
    parking_id: int
    nickname: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# User Statistics
class UserStatistics(BaseModel):
    total_reservations: int
    total_spent: float
    total_hours: float
    favorite_parking_id: Optional[int]
    favorite_parking_name: Optional[str]
    most_visited_count: int