from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReservationCreate(BaseModel):
    parking_id: int
    check_in_time: datetime
    check_out_time: datetime

class Reservation(BaseModel):
    id: int
    user_id: int
    parking_id: int
    status: str
    check_in_time: datetime
    check_out_time: datetime
    created_at: datetime
    checked_in_at: Optional[datetime]
    checked_out_at: Optional[datetime]
    
    class Config:
        from_attributes = True