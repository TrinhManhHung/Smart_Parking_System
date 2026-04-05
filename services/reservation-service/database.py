from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./reservation.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Reservation(Base):
    __tablename__ = "reservations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    parking_id = Column(Integer)
    seat_number = Column(String, nullable=True)  # e.g., "A-01", "B-15"
    status = Column(String, default="reserved")
    check_in_time = Column(DateTime)
    check_out_time = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    checked_in_at = Column(DateTime)
    checked_out_at = Column(DateTime)

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()