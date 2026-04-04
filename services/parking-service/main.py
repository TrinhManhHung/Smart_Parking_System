from fastapi import FastAPI
from database import create_tables, seed_data
from routers import parking

app = FastAPI()

@app.on_event("startup")
async def startup():
    create_tables()
    seed_data()

app.include_router(parking.router)