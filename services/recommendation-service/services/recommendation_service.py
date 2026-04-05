import httpx
import math
from typing import List, Dict, Optional

class RecommendationService:
    async def get_nearest_parkings(
        self, 
        lat: float, 
        lng: float,
        max_distance: Optional[float] = None,
        min_available_slots: Optional[int] = None,
        max_price: Optional[float] = None,
        sort_by: str = "distance"
    ) -> List[Dict]:
        """
        Get nearest parkings with advanced filtering and sorting
        
        Args:
            lat: User latitude
            lng: User longitude
            max_distance: Maximum distance in km (optional)
            min_available_slots: Minimum available slots (optional)
            max_price: Maximum price per hour (optional)
            sort_by: Sort criteria - "distance", "price", "availability", "score"
        """
        async with httpx.AsyncClient() as client:
            response = await client.get("http://parking-service:8002/parkings")
            parkings = response.json()
        
        # Calculate distance and score for each parking
        for parking in parkings:
            distance = self._haversine_distance(lat, lng, parking["latitude"], parking["longitude"])
            parking["distance"] = round(distance, 2)
            
            # Calculate recommendation score (0-100)
            parking["score"] = self._calculate_score(
                distance=distance,
                available_slots=parking["available_slots"],
                total_slots=parking["total_slots"],
                rate_per_hour=parking["rate_per_hour"]
            )
        
        # Apply filters
        filtered_parkings = parkings
        
        if max_distance is not None:
            filtered_parkings = [p for p in filtered_parkings if p["distance"] <= max_distance]
        
        if min_available_slots is not None:
            filtered_parkings = [p for p in filtered_parkings if p["available_slots"] >= min_available_slots]
        
        if max_price is not None:
            filtered_parkings = [p for p in filtered_parkings if p["rate_per_hour"] <= max_price]
        
        # Sort by selected criteria
        if sort_by == "price":
            filtered_parkings.sort(key=lambda x: x["rate_per_hour"])
        elif sort_by == "availability":
            filtered_parkings.sort(key=lambda x: x["available_slots"], reverse=True)
        elif sort_by == "score":
            filtered_parkings.sort(key=lambda x: x["score"], reverse=True)
        else:  # default: distance
            filtered_parkings.sort(key=lambda x: x["distance"])
        
        # Return top 10 results
        return filtered_parkings[:10]
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        R = 6371  # Earth radius in kilometers
        
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def _calculate_score(
        self, 
        distance: float, 
        available_slots: int, 
        total_slots: int,
        rate_per_hour: float
    ) -> int:
        """
        Calculate recommendation score based on multiple factors
        Score range: 0-100
        
        Factors:
        - Distance (40%): Closer is better
        - Availability (30%): More available slots is better
        - Price (30%): Lower price is better
        """
        # Distance score (0-40): Inverse relationship, max 10km
        distance_score = max(0, 40 * (1 - min(distance, 10) / 10))
        
        # Availability score (0-30): Percentage of available slots
        availability_ratio = available_slots / total_slots if total_slots > 0 else 0
        availability_score = 30 * availability_ratio
        
        # Price score (0-30): Inverse relationship, max $20/hour
        price_score = max(0, 30 * (1 - min(rate_per_hour, 20) / 20))
        
        total_score = distance_score + availability_score + price_score
        return round(total_score)
