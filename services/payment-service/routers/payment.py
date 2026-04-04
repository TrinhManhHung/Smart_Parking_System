from fastapi import APIRouter
from services.payment_service import PaymentService
from schemas import PaymentCalculation

router = APIRouter()
payment_service = PaymentService()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.post("/payment/calculate")
async def calculate_payment(payment: PaymentCalculation):
    return await payment_service.calculate_payment(payment)