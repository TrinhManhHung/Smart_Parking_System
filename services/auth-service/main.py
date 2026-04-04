from fastapi import FastAPI
from database import create_tables
from routers import auth

app = FastAPI()

@app.on_event("startup")
async def startup():
    create_tables()

app.include_router(auth.router)