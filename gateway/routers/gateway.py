from fastapi import APIRouter, Request, HTTPException
import httpx
import jwt

router = APIRouter()

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/")
async def root():
    return {"message": "Smart Parking System API Gateway", "status": "running"}

@router.get("/health")
async def health():
    return {"status": "ok"}

@router.post("/register")
async def register(request: Request):
    body = await request.json()
    async with httpx.AsyncClient() as client:
        response = await client.post("http://auth-service:8001/register", json=body)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@router.post("/login")
async def login(request: Request):
    body = await request.json()
    async with httpx.AsyncClient() as client:
        response = await client.post("http://auth-service:8001/login", json=body)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@router.get("/parkings")
async def get_parkings():
    async with httpx.AsyncClient() as client:
        response = await client.get("http://parking-service:8002/parkings")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@router.get("/parkings/{parking_id}")
async def get_parking(parking_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"http://parking-service:8002/parkings/{parking_id}")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@router.get("/parkings/{parking_id}/seats")
async def get_parking_seats(parking_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"http://parking-service:8002/parkings/{parking_id}/seats")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@router.post("/seats/{seat_id}/book")
async def book_seat(seat_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"http://parking-service:8002/seats/{seat_id}/book")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@router.post("/seats/{seat_id}/release")
async def release_seat(seat_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"http://parking-service:8002/seats/{seat_id}/release")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@router.post("/reservations")
async def create_reservation(request: Request):
    auth_header = request.headers.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    body = await request.json()
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://reservation-service:8003/reservations",
            json=body,
            headers={"authorization": auth_header}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@router.post("/reservations/{reservation_id}/check-in")
async def check_in(reservation_id: int, request: Request):
    auth_header = request.headers.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"http://reservation-service:8003/reservations/{reservation_id}/check-in",
            headers={"authorization": auth_header}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@router.post("/reservations/{reservation_id}/check-out")
async def check_out(reservation_id: int, request: Request):
    auth_header = request.headers.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"http://reservation-service:8003/reservations/{reservation_id}/check-out",
            headers={"authorization": auth_header}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@router.delete("/reservations/{reservation_id}")
async def cancel_reservation(reservation_id: int, request: Request):
    auth_header = request.headers.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"http://reservation-service:8003/reservations/{reservation_id}",
            headers={"authorization": auth_header}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@router.get("/recommendations")
async def get_recommendations(lat: float, lng: float):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"http://recommendation-service:8004/recommendations?lat={lat}&lng={lng}")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@router.post("/payment/calculate")
async def calculate_payment(request: Request):
    body = await request.json()
    async with httpx.AsyncClient() as client:
        response = await client.post("http://payment-service:8005/payment/calculate", json=body)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()