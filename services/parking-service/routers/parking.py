from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, Seat
from schemas import Parking, ParkingCreate, SlotUpdate, Seat as SeatSchema
from services.parking_service import ParkingService

router = APIRouter()
parking_service = ParkingService()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/parkings", response_model=List[Parking])
def get_parkings(db: Session = Depends(get_db)):
    return parking_service.get_all_parkings(db)

@router.get("/parkings/{parking_id}", response_model=Parking)
def get_parking(parking_id: int, db: Session = Depends(get_db)):
    return parking_service.get_parking_by_id(parking_id, db)

@router.get("/parkings/{parking_id}/seats", response_model=List[SeatSchema])
def get_parking_seats(parking_id: int, db: Session = Depends(get_db)):
    seats = db.query(Seat).filter(Seat.parking_id == parking_id).all()
    if not seats:
        raise HTTPException(status_code=404, detail="Parking not found")
    return seats

@router.post("/parkings", response_model=Parking)
def create_parking(parking: ParkingCreate, db: Session = Depends(get_db)):
    return parking_service.create_parking(parking, db)

@router.post("/seats/{seat_id}/book")
def book_seat(seat_id: int, db: Session = Depends(get_db)):
    seat = db.query(Seat).filter(Seat.id == seat_id).first()
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")
    if seat.status == "booked":
        raise HTTPException(status_code=400, detail="Seat already booked")
    seat.status = "booked"
    db.commit()
    return {"status": "success", "seat_id": seat_id}

@router.post("/seats/{seat_id}/release")
def release_seat(seat_id: int, db: Session = Depends(get_db)):
    seat = db.query(Seat).filter(Seat.id == seat_id).first()
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")
    seat.status = "available"
    db.commit()
    return {"status": "success"}

@router.patch("/parkings/{parking_id}/slots")
def update_slots(parking_id: int, slot_update: SlotUpdate, db: Session = Depends(get_db)):
    return parking_service.update_available_slots(parking_id, slot_update.change, db)