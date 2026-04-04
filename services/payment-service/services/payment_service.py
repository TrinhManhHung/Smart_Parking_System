import httpx
from datetime import datetime
from schemas import PaymentCalculation

class PaymentService:
    async def calculate_payment(self, payment: PaymentCalculation):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"http://parking-service:8002/parkings/{payment.parking_id}")
            parking = response.json()
        
        duration = payment.check_out_time - payment.check_in_time
        minutes = duration.total_seconds() / 60
        hours = minutes / 60
        
        total_cost = hours * parking["rate_per_hour"]
        
        return {
            "parking_name": parking["name"],
            "duration_minutes": int(minutes),
            "rate_per_hour": parking["rate_per_hour"],
            "total_cost": round(total_cost, 2)
        }