from pydantic import BaseModel
from typing import List
from datetime import datetime

class ParkingBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    total_slots: int
    available_slots: int
    rate_per_hour: float

class ParkingCreate(ParkingBase):
    pass

class Parking(ParkingBase):
    id: int
    
    class Config:
        from_attributes = True

class SeatBase(BaseModel):
    row: int
    col: int
    seat_type: str
    status: str
    price_per_hour: float

class Seat(SeatBase):
    id: int
    parking_id: int
    
    class Config:
        from_attributes = True

class SeatBookingRequest(BaseModel):
    start_time: str
    end_time: str
    user_id: int = 1

class SeatReservationBase(BaseModel):
    seat_id: int
    user_id: int
    start_time: datetime
    end_time: datetime
    status: str = "active"

class SeatReservationCreate(SeatReservationBase):
    pass

class SeatReservation(SeatReservationBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class SlotUpdate(BaseModel):
    change: int