from fastapi import HTTPException
from sqlalchemy.orm import Session
from database import Parking
from schemas import ParkingCreate

class ParkingService:
    def get_all_parkings(self, db: Session):
        return db.query(Parking).all()
    
    def get_parking_by_id(self, parking_id: int, db: Session):
        parking = db.query(Parking).filter(Parking.id == parking_id).first()
        if not parking:
            raise HTTPException(status_code=404, detail="Parking not found")
        return parking
    
    def create_parking(self, parking: ParkingCreate, db: Session):
        db_parking = Parking(**parking.dict())
        db.add(db_parking)
        db.commit()
        db.refresh(db_parking)
        return db_parking
    
    def update_available_slots(self, parking_id: int, change: int, db: Session):
        parking = self.get_parking_by_id(parking_id, db)
        new_slots = parking.available_slots + change
        if new_slots < 0 or new_slots > parking.total_slots:
            raise HTTPException(status_code=400, detail="Invalid slot count")
        parking.available_slots = new_slots
        db.commit()
        return {"message": "Slots updated successfully"}