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
    
    async def quick_book_prepare(self, parking_id: int, user_id: int, db: Session):
        """Prepare quick book: calculate seat and payment info without creating reservation"""
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
        
        # Create time info (now + 5 min to now + 2 hours)
        now = datetime.utcnow()
        check_in_time = now
        check_out_time = datetime.fromtimestamp(now.timestamp() + 2 * 3600)  # 2 hours later
        
        return {
            "parking_id": parking_id,
            "seat_number": selected_seat,
            "check_in_time": check_in_time.isoformat(),
            "check_out_time": check_out_time.isoformat(),
            "parking_info": parking_data
        }
    
    async def quick_book_confirm(self, booking_data: dict, user_id: int, db: Session):
        """Confirm quick book: create actual reservation after payment confirmation"""
        # Parse datetime strings
        check_in_time = datetime.fromisoformat(booking_data["check_in_time"])
        check_out_time = datetime.fromisoformat(booking_data["check_out_time"])
        
        # Double-check seat is still available
        reserved_seats = db.query(Reservation.seat_number).filter(
            Reservation.parking_id == booking_data["parking_id"],
            Reservation.status.in_(["reserved", "checked_in"])
        ).all()
        reserved_seat_numbers = {seat[0] for seat in reserved_seats if seat[0]}
        
        if booking_data["seat_number"] in reserved_seat_numbers:
            raise HTTPException(status_code=400, detail="Selected seat is no longer available")
        
        # Create the reservation
        db_reservation = Reservation(
            user_id=user_id,
            parking_id=booking_data["parking_id"],
            seat_number=booking_data["seat_number"],
            check_in_time=check_in_time,
            check_out_time=check_out_time,
            status="reserved"
        )
        db.add(db_reservation)
        db.commit()
        db.refresh(db_reservation)
        
        # Decrease available slots
        await self._update_parking_slots(booking_data["parking_id"], -1)
        
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
        
        # Release seats in parking service
        if reservation.seat_number:
            try:
                async with httpx.AsyncClient() as client:
                    # Get parking seats to find seat ID
                    seats_response = await client.get(
                        f"http://parking-service:8002/parkings/{reservation.parking_id}/seats"
                    )
                    if seats_response.status_code == 200:
                        seats = seats_response.json()
                        # Parse seat number (e.g., "A-01" -> row A, col 01)
                        seat_parts = reservation.seat_number.split('-')
                        if len(seat_parts) == 2:
                            row_letter = seat_parts[0]
                            col_num = int(seat_parts[1])
                            # Convert row letter to number (A=1, B=2, etc.)
                            row_num = ord(row_letter.upper()) - ord('A') + 1
                            
                            print(f"Looking for seat: row={row_num}, col={col_num}")
                            
                            # Find matching seat
                            seat_found = False
                            for seat in seats:
                                if seat.get('row') == row_num and seat.get('col') == col_num:
                                    print(f"Found seat ID: {seat['id']}, releasing...")
                                    # Release the seat
                                    release_response = await client.post(
                                        f"http://parking-service:8002/seats/{seat['id']}/release"
                                    )
                                    if release_response.status_code == 200:
                                        print(f"Seat {seat['id']} released successfully")
                                        seat_found = True
                                    else:
                                        print(f"Failed to release seat: {release_response.text}")
                                    break
                            
                            if not seat_found:
                                print(f"Seat not found for {reservation.seat_number}")
                                print(f"Available seats: {[(s.get('row'), s.get('col')) for s in seats]}")
            except Exception as e:
                print(f"Failed to release seat: {e}")
                # Continue with checkout even if seat release fails
        
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
        
        # Release seats in parking service
        if reservation.seat_number:
            try:
                async with httpx.AsyncClient() as client:
                    # Get parking seats to find seat ID
                    seats_response = await client.get(
                        f"http://parking-service:8002/parkings/{reservation.parking_id}/seats"
                    )
                    if seats_response.status_code == 200:
                        seats = seats_response.json()
                        # Parse seat number (e.g., "A-01" -> row A, col 01)
                        seat_parts = reservation.seat_number.split('-')
                        if len(seat_parts) == 2:
                            row_letter = seat_parts[0]
                            col_num = int(seat_parts[1])
                            # Convert row letter to number (A=1, B=2, etc.)
                            row_num = ord(row_letter.upper()) - ord('A') + 1
                            
                            print(f"Cancelling - Looking for seat: row={row_num}, col={col_num}")
                            
                            # Find matching seat
                            seat_found = False
                            for seat in seats:
                                if seat.get('row') == row_num and seat.get('col') == col_num:
                                    print(f"Found seat ID: {seat['id']}, releasing...")
                                    # Release the seat
                                    release_response = await client.post(
                                        f"http://parking-service:8002/seats/{seat['id']}/release"
                                    )
                                    if release_response.status_code == 200:
                                        print(f"Seat {seat['id']} released successfully")
                                        seat_found = True
                                    else:
                                        print(f"Failed to release seat: {release_response.text}")
                                    break
                            
                            if not seat_found:
                                print(f"Seat not found for {reservation.seat_number}")
            except Exception as e:
                print(f"Failed to release seat: {e}")
                # Continue with cancellation even if seat release fails
        
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