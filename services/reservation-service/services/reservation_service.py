import httpx
import asyncio
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
from database import Reservation
from schemas import ReservationCreate

class ReservationService:
    async def _update_parking_slots(self, parking_id: int, change: int):
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"http://parking-service:8002/parkings/{parking_id}/slots",
                json={"change": change}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to update parking slots")
    
    def get_user_reservations(self, user_id: int, db: Session):
        reservations = db.query(Reservation).filter(
            Reservation.user_id == user_id
        ).order_by(Reservation.created_at.desc()).all()
        return reservations
    
    async def create_reservation(self, reservation: ReservationCreate, user_id: int, db: Session):
        db_reservation = Reservation(
            user_id=user_id, 
            parking_id=reservation.parking_id,
            check_in_time=reservation.check_in_time,
            check_out_time=reservation.check_out_time
        )
        db.add(db_reservation)
        db.commit()
        db.refresh(db_reservation)
        
        # Decrease available slots
        await self._update_parking_slots(reservation.parking_id, -1)
        
        return db_reservation
    
    def check_in(self, reservation_id: int, user_id: int, db: Session):
        reservation = db.query(Reservation).filter(
            Reservation.id == reservation_id,
            Reservation.user_id == user_id
        ).first()
        
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        if reservation.status != "reserved":
            raise HTTPException(status_code=400, detail="Invalid reservation status")
        
        reservation.status = "checked_in"
        reservation.checked_in_at = datetime.utcnow()
        db.commit()
        
        return {"message": "Checked in successfully"}
    
    async def check_out(self, reservation_id: int, user_id: int, db: Session):
        reservation = db.query(Reservation).filter(
            Reservation.id == reservation_id,
            Reservation.user_id == user_id
        ).first()
        
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        if reservation.status != "checked_in":
            raise HTTPException(status_code=400, detail="Invalid reservation status")
        
        reservation.status = "completed"
        reservation.checked_out_at = datetime.utcnow()
        db.commit()
        
        # Increase available slots
        await self._update_parking_slots(reservation.parking_id, 1)
        
        return {"message": "Checked out successfully"}
    
    async def cancel_reservation(self, reservation_id: int, user_id: int, db: Session):
        reservation = db.query(Reservation).filter(
            Reservation.id == reservation_id,
            Reservation.user_id == user_id
        ).first()
        
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        if reservation.status != "reserved":
            raise HTTPException(status_code=400, detail="Cannot cancel this reservation")
        
        db.delete(reservation)
        db.commit()
        
        # Increase available slots
        await self._update_parking_slots(reservation.parking_id, 1)
        
        return {"message": "Reservation cancelled successfully"}