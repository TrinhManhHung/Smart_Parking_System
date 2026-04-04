from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

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
    seat_type = Column(String, default="standard")  # "standard" or "vip"
    status = Column(String, default="available")  # "available" or "booked"
    price_per_hour = Column(Float)

def create_tables():
    Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    if db.query(Parking).count() == 0:
        parkings = [
            Parking(name="Downtown Parking", address="123 Main St", latitude=40.7128, longitude=-74.0060, total_slots=40, available_slots=40, rate_per_hour=5.0),
            Parking(name="Mall Parking", address="456 Oak Ave", latitude=40.7589, longitude=-73.9851, total_slots=40, available_slots=40, rate_per_hour=3.0),
            Parking(name="Airport Parking", address="789 Airport Rd", latitude=40.6892, longitude=-74.1745, total_slots=40, available_slots=40, rate_per_hour=8.0)
        ]
        for parking in parkings:
            db.add(parking)
            db.flush()
            
            # Create 5 rows × 8 cols grid
            for row in range(1, 6):
                for col in range(1, 9):
                    seat_type = "vip" if row <= 2 else "standard"
                    price = parking.rate_per_hour * 1.6 if seat_type == "vip" else parking.rate_per_hour
                    seat = Seat(parking_id=parking.id, row=row, col=col, seat_type=seat_type, status="available", price_per_hour=price)
                    db.add(seat)
        db.commit()
    db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()