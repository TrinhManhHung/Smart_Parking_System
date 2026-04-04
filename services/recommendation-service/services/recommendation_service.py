import httpx
import math
from typing import List, Dict

class RecommendationService:
    async def get_nearest_parkings(self, lat: float, lng: float) -> List[Dict]:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://parking-service:8002/parkings")
            parkings = response.json()
        
        for parking in parkings:
            distance = self._haversine_distance(lat, lng, parking["latitude"], parking["longitude"])
            parking["distance"] = round(distance, 2)
        
        parkings.sort(key=lambda x: x["distance"])
        return parkings[:5]
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371
        
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c