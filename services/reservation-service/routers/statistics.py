from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, Reservation
from services.auth_service import get_current_user
import httpx

router = APIRouter()

@router.get("/statistics")
async def get_user_statistics(db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    # Get all user reservations
    reservations = db.query(Reservation).filter(Reservation.user_id == user_id).all()
    
    if not reservations:
        return {
            "total_reservations": 0,
            "total_spent": 0.0,
            "total_hours": 0.0,
            "favorite_parking_id": None,
            "favorite_parking_name": None,
            "most_visited_count": 0,
            "reservations_by_status": {
                "reserved": 0,
                "checked_in": 0,
                "completed": 0
            }
        }
    
    # Calculate statistics
    total_reservations = len(reservations)
    total_spent = 0.0
    total_hours = 0.0
    parking_counts = {}
    status_counts = {"reserved": 0, "checked_in": 0, "completed": 0}
    
    # Fetch parking details and calculate costs
    async with httpx.AsyncClient() as client:
        for reservation in reservations:
            # Count by status
            status_counts[reservation.status] = status_counts.get(reservation.status, 0) + 1
            
            # Count parking visits
            parking_counts[reservation.parking_id] = parking_counts.get(reservation.parking_id, 0) + 1
            
            # Calculate duration and cost
            if reservation.check_in_time and reservation.check_out_time:
                duration = (reservation.check_out_time - reservation.check_in_time).total_seconds() / 3600
                total_hours += duration
                
                # Get parking rate
                try:
                    response = await client.get(f"http://parking-service:8002/parkings/{reservation.parking_id}")
                    if response.status_code == 200:
                        parking_data = response.json()
                        rate = parking_data.get("rate_per_hour", 0)
                        total_spent += duration * rate
                except:
                    pass
    
    # Find most visited parking
    favorite_parking_id = None
    favorite_parking_name = None
    most_visited_count = 0
    
    if parking_counts:
        favorite_parking_id = max(parking_counts, key=parking_counts.get)
        most_visited_count = parking_counts[favorite_parking_id]
        
        # Get parking name
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"http://parking-service:8002/parkings/{favorite_parking_id}")
                if response.status_code == 200:
                    parking_data = response.json()
                    favorite_parking_name = parking_data.get("name")
        except:
            pass
    
    return {
        "total_reservations": total_reservations,
        "total_spent": round(total_spent, 2),
        "total_hours": round(total_hours, 2),
        "favorite_parking_id": favorite_parking_id,
        "favorite_parking_name": favorite_parking_name,
        "most_visited_count": most_visited_count,
        "reservations_by_status": status_counts
    }

@router.get("/history")
def get_reservation_history(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    reservations = db.query(Reservation).filter(
        Reservation.user_id == user_id
    ).order_by(Reservation.created_at.desc()).limit(limit).offset(offset).all()
    
    return reservations
