from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas import Reservation, ReservationCreate
from services.reservation_service import ReservationService
from services.auth_service import get_current_user

router = APIRouter()
reservation_service = ReservationService()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/reservations", response_model=List[Reservation])
def get_user_reservations(db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return reservation_service.get_user_reservations(user_id, db)

@router.post("/reservations", response_model=Reservation)
async def create_reservation(reservation: ReservationCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return await reservation_service.create_reservation(reservation, user_id, db)

@router.post("/reservations/{reservation_id}/check-in")
def check_in(reservation_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return reservation_service.check_in(reservation_id, user_id, db)

@router.post("/reservations/{reservation_id}/check-out")
async def check_out(reservation_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return await reservation_service.check_out(reservation_id, user_id, db)

@router.delete("/reservations/{reservation_id}")
async def cancel_reservation(reservation_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return await reservation_service.cancel_reservation(reservation_id, user_id, db)