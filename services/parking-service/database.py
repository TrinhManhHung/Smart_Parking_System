from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import math

DATABASE_URL = "sqlite:///./parking.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Parking(Base):
    __tablename__ = "parkings"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    total_slots = Column(Integer)
    available_slots = Column(Integer)
    rate_per_hour = Column(Float)

class Seat(Base):
    __tablename__ = "seats"
    
    id = Column(Integer, primary_key=True, index=True)
    parking_id = Column(Integer, ForeignKey("parkings.id"))
    row = Column(Integer)
    col = Column(Integer)
    seat_type = Column(String, default="standard")  # Giữ lại để tương thích, nhưng tất cả sẽ là "standard"
    status = Column(String, default="available")  # "available" or "booked"
    price_per_hour = Column(Float)

class SeatReservation(Base):
    __tablename__ = "seat_reservations"
    
    id = Column(Integer, primary_key=True, index=True)
    seat_id = Column(Integer, ForeignKey("seats.id"))
    user_id = Column(Integer)  # ID của người đặt
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    status = Column(String, default="active")  # "active", "completed", "cancelled"
    created_at = Column(DateTime, default=datetime.utcnow)

def create_tables():
    Base.metadata.create_all(bind=engine)

def calculate_grid_size(total_slots):
    """Calculate optimal grid size for parking slots"""
    import math
    sqrt_slots = math.sqrt(total_slots)
    rows = int(sqrt_slots)
    cols = math.ceil(total_slots / rows)
    return rows, cols

def seed_data():
    db = SessionLocal()
    if db.query(Parking).count() == 0:
        # New Hanoi parking locations
        parkings_data = [
            {
                "name": "Bãi đỗ xe Tràng Tiền Plaza",
                "address": "24 Hai Bà Trưng, Hoàn Kiếm, Hà Nội",
                "latitude": 21.0245,
                "longitude": 105.8572,
                "total_slots": 200,
                "available_slots": 45,
                "rate_per_hour": 20000
            },
            {
                "name": "Bãi gửi xe Vincom Bà Triệu",
                "address": "191 Bà Triệu, Hai Bà Trưng, Hà Nội",
                "latitude": 21.0117,
                "longitude": 105.8495,
                "total_slots": 300,
                "available_slots": 120,
                "rate_per_hour": 25000
            },
            {
                "name": "Bãi đỗ xe Hồ Gươm",
                "address": "Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội",
                "latitude": 21.0288,
                "longitude": 105.8524,
                "total_slots": 150,
                "available_slots": 30,
                "rate_per_hour": 30000
            },
            {
                "name": "Bãi gửi xe Times City",
                "address": "458 Minh Khai, Hai Bà Trưng, Hà Nội",
                "latitude": 20.9958,
                "longitude": 105.8683,
                "total_slots": 500,
                "available_slots": 200,
                "rate_per_hour": 15000
            },
            {
                "name": "Bãi đỗ xe Keangnam",
                "address": "Phạm Hùng, Nam Từ Liêm, Hà Nội",
                "latitude": 21.0167,
                "longitude": 105.7833,
                "total_slots": 400,
                "available_slots": 180,
                "rate_per_hour": 20000
            },
            {
                "name": "Bãi gửi xe Lotte Center",
                "address": "54 Liễu Giai, Ba Đình, Hà Nội",
                "latitude": 21.0338,
                "longitude": 105.8142,
                "total_slots": 350,
                "available_slots": 90,
                "rate_per_hour": 25000
            },
            {
                "name": "Bãi đỗ xe Big C Thăng Long",
                "address": "222 Trần Duy Hưng, Cầu Giấy, Hà Nội",
                "latitude": 21.0076,
                "longitude": 105.8025,
                "total_slots": 450,
                "available_slots": 210,
                "rate_per_hour": 10000
            },
            {
                "name": "Bãi gửi xe Royal City",
                "address": "72 Nguyễn Trãi, Thanh Xuân, Hà Nội",
                "latitude": 21.0039,
                "longitude": 105.8156,
                "total_slots": 600,
                "available_slots": 300,
                "rate_per_hour": 15000
            },
            {
                "name": "Bãi gửi xe Học viện Bưu chính Viễn thông",
                "address": "Km10 Nguyễn Trãi, Hà Đông, Hà Nội",
                "latitude": 20.9804,
                "longitude": 105.7872,
                "total_slots": 250,
                "available_slots": 75,
                "rate_per_hour": 10000
            }
        ]
        
        for parking_data in parkings_data:
            parking = Parking(
                name=parking_data["name"],
                address=parking_data["address"],
                latitude=parking_data["latitude"],
                longitude=parking_data["longitude"],
                total_slots=parking_data["total_slots"],
                available_slots=parking_data["available_slots"],
                rate_per_hour=parking_data["rate_per_hour"]
            )
            db.add(parking)
            db.flush()
            
            # Create seats with optimal grid layout
            rows, cols = calculate_grid_size(parking_data["total_slots"])
            seat_count = 0
            booked_slots = parking_data["total_slots"] - parking_data["available_slots"]
            
            for row in range(1, rows + 1):
                for col in range(1, cols + 1):
                    if seat_count >= parking_data["total_slots"]:
                        break
                    
                    # Set status based on available slots
                    status = "booked" if seat_count < booked_slots else "available"
                    
                    seat = Seat(
                        parking_id=parking.id,
                        row=row,
                        col=col,
                        seat_type="standard",
                        status=status,
                        price_per_hour=parking_data["rate_per_hour"]
                    )
                    db.add(seat)
                    seat_count += 1
                
                if seat_count >= parking_data["total_slots"]:
                    break
        
        db.commit()
        print(f"✅ Seeded {len(parkings_data)} parking locations with seats")
    db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()