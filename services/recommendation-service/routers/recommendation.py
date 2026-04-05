from fastapi import APIRouter, Query
from typing import List, Optional
from services.recommendation_service import RecommendationService

router = APIRouter()
recommendation_service = RecommendationService()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/recommendations")
async def get_recommendations(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    max_distance: Optional[float] = Query(None, description="Maximum distance in km"),
    min_available_slots: Optional[int] = Query(None, description="Minimum available slots"),
    max_price: Optional[float] = Query(None, description="Maximum price per hour"),
    sort_by: str = Query("distance", description="Sort by: distance, price, availability, score")
):
    """
    Get parking recommendations based on location and filters
    
    - **lat**: User's latitude
    - **lng**: User's longitude
    - **max_distance**: Filter by maximum distance (km)
    - **min_available_slots**: Filter by minimum available slots
    - **max_price**: Filter by maximum price per hour
    - **sort_by**: Sort results by distance, price, availability, or score
    """
    return await recommendation_service.get_nearest_parkings(
        lat=lat,
        lng=lng,
        max_distance=max_distance,
        min_available_slots=min_available_slots,
        max_price=max_price,
        sort_by=sort_by
    )