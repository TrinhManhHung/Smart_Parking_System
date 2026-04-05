from fastapi import FastAPI
from database import create_tables
from routers import reservation, statistics

app = FastAPI()

@app.on_event("startup")
async def startup():
    create_tables()

app.include_router(reservation.router)
app.include_router(statistics.router)