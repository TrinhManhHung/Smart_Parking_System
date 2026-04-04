from pydantic import BaseModel
from datetime import datetime

class PaymentCalculation(BaseModel):
    parking_id: int
    check_in_time: datetime
    check_out_time: datetime