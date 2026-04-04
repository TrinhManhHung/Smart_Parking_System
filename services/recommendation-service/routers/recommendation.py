from fastapi import APIRouter, Query
from typing import List
from services.recommendation_service import RecommendationService

router = APIRouter()
recommendation_service = RecommendationService()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/recommendations")
async def get_recommendations(lat: float = Query(...), lng: float = Query(...)):
    return await recommendation_service.get_nearest_parkings(lat, lng)