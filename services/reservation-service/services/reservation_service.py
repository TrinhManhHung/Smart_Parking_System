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
        # Parse datetime strings
        check_in_time = reservation.check_in_time
        check_out_time = reservation.check_out_time
        
        if isinstance(check_in_time, str):
            check_in_time = datetime.fromisoformat(check_in_time.replace('Z', '+00:00'))
        if isinstance(check_out_time, str):
            check_out_time = datetime.fromisoformat(check_out_time.replace('Z', '+00:00'))
        
        db_reservation = Reservation(
            user_id=user_id, 
            parking_id=reservation.parking_id,
            seat_number=reservation.seat_number,
            check_in_time=check_in_time,
            check_out_time=check_out_time
        )
        db.add(db_reservation)
        db.commit()
        db.refresh(db_reservation)
        
        # Decrease available slots
        await self._update_parking_slots(reservation.parking_id, -1)
        
        return db_reservation
    
    async def quick_book(self, parking_id: int, user_id: int, db: Session):
        """Quick book: automatically select a random available seat"""
        import random
        
        # Get parking info to check available slots
        async with httpx.AsyncClient() as client:
            parking_response = await client.get(f"http://parking-service:8002/parkings/{parking_id}")
            if parking_response.status_code != 200:
                raise HTTPException(status_code=404, detail="Parking not found")
            
            parking_data = parking_response.json()
            if parking_data['available_slots'] <= 0:
                raise HTTPException(status_code=400, detail="No available slots")
        
        # Get all reserved seat numbers for this parking
        reserved_seats = db.query(Reservation.seat_number).filter(
            Reservation.parking_id == parking_id,
            Reservation.status.in_(["reserved", "checked_in"])
        ).all()
        reserved_seat_numbers = {seat[0] for seat in reserved_seats if seat[0]}
        
        # Generate available seat numbers (A-01 to A-50, B-01 to B-50, etc.)
        total_slots = parking_data['total_slots']
        all_seats = []
        rows = ['A', 'B', 'C', 'D', 'E', 'F']
        seats_per_row = (total_slots + len(rows) - 1) // len(rows)
        
        for row in rows:
            for num in range(1, seats_per_row + 1):
                seat = f"{row}-{num:02d}"
                all_seats.append(seat)
                if len(all_seats) >= total_slots:
                    break
            if len(all_seats) >= total_slots:
                break
        
        # Filter out reserved seats
        available_seats = [seat for seat in all_seats if seat not in reserved_seat_numbers]
        
        if not available_seats:
            raise HTTPException(status_code=400, detail="No available seats")
        
        # Randomly select a seat
        selected_seat = random.choice(available_seats)
        
        # Create reservation with auto times (now + 5 min to now + 2 hours)
        now = datetime.utcnow()
        check_in_time = now
        check_out_time = datetime.fromtimestamp(now.timestamp() + 2 * 3600)  # 2 hours later
        
        db_reservation = Reservation(
            user_id=user_id,
            parking_id=parking_id,
            seat_number=selected_seat,
            check_in_time=check_in_time,
            check_out_time=check_out_time,
            status="reserved"
        )
        db.add(db_reservation)
        db.commit()
        db.refresh(db_reservation)
        
        # Decrease available slots
        await self._update_parking_slots(parking_id, -1)
        
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
    
    def get_booked_seats(self, parking_id: int, db: Session):
        """Get list of booked seat numbers for a parking lot"""
        reservations = db.query(Reservation).filter(
            Reservation.parking_id == parking_id,
            Reservation.status.in_(["reserved", "checked_in"]),
            Reservation.seat_number.isnot(None)
        ).all()
        
        booked_seats = [r.seat_number for r in reservations]
        return {"booked_seats": booked_seats}