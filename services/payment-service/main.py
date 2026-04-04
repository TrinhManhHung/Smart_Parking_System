from fastapi import FastAPI
from routers import payment

app = FastAPI()

app.include_router(payment.router)