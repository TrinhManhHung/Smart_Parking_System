from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List
from datetime import datetime
from database import get_db, Seat, SeatReservation
from schemas import Parking, ParkingCreate, SlotUpdate, Seat as SeatSchema, SeatBookingRequest
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
def get_parking_seats(parking_id: int, start_time: str = None, end_time: str = None, db: Session = Depends(get_db)):
    seats = db.query(Seat).filter(Seat.parking_id == parking_id).all()
    if not seats:
        raise HTTPException(status_code=404, detail="Parking not found")
    
    # Nếu có thời gian, kiểm tra tính khả dụng
    if start_time and end_time:
        try:
            start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            
            # Tìm các chỗ đã được đặt trong khoảng thời gian này
            conflicting_reservations = db.query(SeatReservation).filter(
                and_(
                    SeatReservation.status == "active",
                    or_(
                        and_(SeatReservation.start_time <= start_dt, SeatReservation.end_time > start_dt),
                        and_(SeatReservation.start_time < end_dt, SeatReservation.end_time >= end_dt),
                        and_(SeatReservation.start_time >= start_dt, SeatReservation.end_time <= end_dt)
                    )
                )
            ).all()
            
            booked_seat_ids = {res.seat_id for res in conflicting_reservations}
            
            # Cập nhật trạng thái chỗ ngồi
            for seat in seats:
                if seat.id in booked_seat_ids:
                    seat.status = "booked"
                else:
                    seat.status = "available"
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid datetime format")
    
    return seats

@router.post("/parkings", response_model=Parking)
def create_parking(parking: ParkingCreate, db: Session = Depends(get_db)):
    return parking_service.create_parking(parking, db)

@router.post("/seats/{seat_id}/book")
def book_seat(seat_id: int, booking_request: SeatBookingRequest, db: Session = Depends(get_db)):
    seat = db.query(Seat).filter(Seat.id == seat_id).first()
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")
    
    try:
        start_dt = datetime.fromisoformat(booking_request.start_time.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(booking_request.end_time.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid datetime format")
    
    # Kiểm tra xung đột thời gian
    conflicting_reservation = db.query(SeatReservation).filter(
        and_(
            SeatReservation.seat_id == seat_id,
            SeatReservation.status == "active",
            or_(
                and_(SeatReservation.start_time <= start_dt, SeatReservation.end_time > start_dt),
                and_(SeatReservation.start_time < end_dt, SeatReservation.end_time >= end_dt),
                and_(SeatReservation.start_time >= start_dt, SeatReservation.end_time <= end_dt)
            )
        )
    ).first()
    
    if conflicting_reservation:
        raise HTTPException(status_code=400, detail="Seat is already booked for this time period")
    
    # Tạo đặt chỗ mới
    reservation = SeatReservation(
        seat_id=seat_id,
        user_id=booking_request.user_id,
        start_time=start_dt,
        end_time=end_dt,
        status="active"
    )
    db.add(reservation)
    db.commit()
    
    return {"status": "success", "seat_id": seat_id, "reservation_id": reservation.id}

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