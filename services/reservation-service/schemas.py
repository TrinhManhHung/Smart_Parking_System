from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, Union

class ReservationCreate(BaseModel):
    parking_id: int
    check_in_time: Union[str, datetime]
    check_out_time: Union[str, datetime]
    seat_number: Optional[str] = None
    
    @field_validator('check_in_time', 'check_out_time', mode='before')
    @classmethod
    def parse_datetime(cls, v):
        if isinstance(v, str):
            try:
                # Handle ISO format with Z
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except:
                try:
                    return datetime.fromisoformat(v)
                except:
                    return v
        return v

class Reservation(BaseModel):
    id: int
    user_id: int
    parking_id: int
    seat_number: Optional[str]
    status: str
    check_in_time: datetime
    check_out_time: datetime
    created_at: datetime
    checked_in_at: Optional[datetime]
    checked_out_at: Optional[datetime]
    
    class Config:
        from_attributes = True