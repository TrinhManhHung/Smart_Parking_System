# Recommendation Service

Location-based Parking Recommendation Service for Smart Parking System.

## 📋 Overview

The Recommendation Service provides intelligent parking recommendations based on user location, preferences, and real-time availability data. It uses advanced algorithms to score and rank parking options, helping users find the best parking spots quickly and efficiently.

## 🚀 Features

- **Location-based Recommendations**
  - GPS coordinate-based proximity search
  - Haversine distance calculations
  - Walking time estimations
  - Geographic filtering

- **Smart Filtering**
  - Distance-based filtering
  - Price range filtering
  - Availability threshold filtering
  - Custom sorting options

- **Intelligent Scoring**
  - Multi-factor recommendation algorithm
  - Distance, price, and availability weighting
  - Dynamic scoring based on user preferences
  - Real-time score adjustments

- **Flexible Sorting**
  - Sort by distance (nearest first)
  - Sort by price (cheapest first)
  - Sort by availability (most available first)
  - Sort by overall score (best match first)

## 🛠 Technology Stack

- **Framework**: FastAPI
- **HTTP Client**: httpx for service communication
- **Mathematics**: Haversine formula for distance calculations
- **Async Support**: Full async/await implementation
- **Validation**: Pydantic models with Query parameters

## 📁 Project Structure

```
recommendation-service/
├── routers/
│   └── recommendation.py    # API endpoints
├── services/
│   └── recommendation_service.py # Business logic & algorithms
├── main.py                  # FastAPI application
├── requirements.txt         # Python dependencies
└── Dockerfile              # Container configuration
```

## 🔧 Installation & Setup

### Prerequisites
- Python 3.11+
- pip or poetry
- Running Parking Service (for parking data)

### Local Development

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the service**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8004 --reload
   ```

3. **Access the service**:
   - API: http://localhost:8004
   - Documentation: http://localhost:8004/docs

### Docker Development

1. **Build the image**:
   ```bash
   docker build -t recommendation-service .
   ```

2. **Run the container**:
   ```bash
   docker run -p 8004:8004 recommendation-service
   ```

## 📚 API Documentation

### Base URL
- Local: `http://localhost:8004`
- Gateway: `http://localhost:8000`

### Authentication
No authentication required - public service.

### Key Endpoints

#### Recommendations
- `GET /recommendations` - Get parking recommendations
- `GET /health` - Service health status

#### Query Parameters
- `lat` (required): User latitude (-90 to 90)
- `lng` (required): User longitude (-180 to 180)
- `max_distance` (optional): Maximum distance in km
- `min_available_slots` (optional): Minimum available slots
- `max_price` (optional): Maximum price per hour (VND)
- `sort_by` (optional): Sort criteria (distance, price, availability, score)

For complete API documentation, see: [recommendation-service.yaml](../../docs/api-specs/recommendation-service.yaml)

## 🧮 Recommendation Algorithm

### Distance Calculation
Uses the Haversine formula for accurate GPS distance:

```python
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat/2)**2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon/2)**2)
    c = 2 * math.asin(math.sqrt(a))
    return R * c
```

### Scoring Algorithm
Multi-factor scoring system:

```python
def calculate_score(distance, price, availability, max_distance, max_price):
    # Distance score (closer = better)
    distance_score = max(0, (max_distance - distance) / max_distance * 40)
    
    # Price score (cheaper = better)
    price_score = max(0, (max_price - price) / max_price * 30)
    
    # Availability score (more available = better)
    availability_score = min(availability / 100 * 30, 30)
    
    return distance_score + price_score + availability_score
```

### Walking Time Estimation
Assumes average walking speed of 5 km/h:

```python
walking_time_minutes = int(distance_km / 5 * 60)
```

## 📊 Response Format

### Recommendation Object
```json
{
  "id": 1,
  "name": "Bãi đỗ xe Tràng Tiền Plaza",
  "address": "24 Hai Bà Trưng, Hoàn Kiếm, Hà Nội",
  "latitude": 21.0245,
  "longitude": 105.8572,
  "total_slots": 200,
  "available_slots": 45,
  "rate_per_hour": 20000,
  "distance_km": 1.2,
  "walking_time_minutes": 15,
  "availability_percentage": 22.5,
  "recommendation_score": 85.3,
  "price_category": "moderate",
  "availability_status": "low"
}
```

### Status Categories

#### Price Categories
- **cheap**: Below average pricing
- **moderate**: Average pricing
- **expensive**: Above average pricing

#### Availability Status
- **high**: >50% available slots
- **medium**: 20-50% available slots
- **low**: 1-20% available slots
- **full**: 0% available slots

## 🧪 Testing

### Manual Testing
Use the interactive API documentation at `/docs` endpoint.

### Example Requests

**Basic Recommendations** (near Hoan Kiem Lake):
```bash
curl -X GET "http://localhost:8004/recommendations?lat=21.0285&lng=105.8542"
```

**Filtered Recommendations**:
```bash
curl -X GET "http://localhost:8004/recommendations?lat=21.0285&lng=105.8542&max_distance=2.0&min_available_slots=20&max_price=25000&sort_by=score"
```

**Distance-sorted**:
```bash
curl -X GET "http://localhost:8004/recommendations?lat=21.0285&lng=105.8542&sort_by=distance"
```

**Price-sorted**:
```bash
curl -X GET "http://localhost:8004/recommendations?lat=21.0285&lng=105.8542&sort_by=price"
```

## 🔄 Integration

### Service Dependencies
- **Parking Service**: Real-time parking data and availability

### External API Calls
```python
# Fetch all parking locations
response = await client.get("http://parking-service:8002/parkings")
parkings = response.json()
```

## 🚨 Error Handling

### Common Error Scenarios
- **400 Bad Request**: Invalid coordinates or parameters
- **503 Service Unavailable**: Parking service unavailable
- **500 Internal Server Error**: Algorithm calculation errors

### Validation Rules
- Latitude: -90 to 90 degrees
- Longitude: -180 to 180 degrees
- max_distance: >= 0 km
- min_available_slots: >= 0
- max_price: >= 0 VND
- sort_by: one of [distance, price, availability, score]

## ⚡ Performance Features

- **Async Operations**: Non-blocking HTTP requests
- **Efficient Algorithms**: Optimized distance calculations
- **Minimal Dependencies**: Lightweight service design
- **Fast Sorting**: In-memory sorting algorithms

## 📈 Algorithm Tuning

### Scoring Weights (Configurable)
- **Distance Weight**: 40% of total score
- **Price Weight**: 30% of total score
- **Availability Weight**: 30% of total score

### Distance Thresholds
- **Default Max Distance**: 10 km
- **Walking Speed**: 5 km/h average
- **Distance Precision**: 2 decimal places

## 🔧 Configuration

### Environment Variables
- `PARKING_SERVICE_URL`: Parking service endpoint
- `MAX_RECOMMENDATIONS`: Maximum results to return (default: 50)
- `DEFAULT_MAX_DISTANCE`: Default search radius (default: 10 km)

### Service URLs (Docker)
- Parking Service: `http://parking-service:8002`

## 📊 Monitoring & Logging

### Key Metrics
- Average response time
- Recommendation accuracy
- Popular search areas
- Filter usage patterns

### Logging Events
- Recommendation requests
- Distance calculations
- Sorting operations
- Service integration calls
- Error tracking

## 🧪 Testing Scenarios

### Test Locations in Hanoi
1. **Hoan Kiem Lake**: lat=21.0285, lng=105.8542
2. **Times City**: lat=20.9958, lng=105.8683
3. **Keangnam Tower**: lat=21.0167, lng=105.7833
4. **Lotte Center**: lat=21.0338, lng=105.8142

### Expected Behaviors
- Closer parkings should have higher distance scores
- Cheaper parkings should rank higher with price sorting
- More available parkings should rank higher with availability sorting
- Balanced scoring should consider all factors

## 🤝 Contributing

1. Follow async/await patterns
2. Maintain algorithm accuracy
3. Update API documentation
4. Test with real GPS coordinates
5. Consider edge cases (no results, service unavailable)

## 📞 Support

For issues related to recommendations or this service:

1. **Check Dependencies**: Ensure Parking Service is running
2. **Validate Coordinates**: Verify GPS coordinates are valid
3. **Test Algorithms**: Check distance calculations manually
4. **Review Logs**: Look for service communication errors
5. **Performance**: Monitor response times and accuracy

## 🔮 Future Enhancements

- **Machine Learning**: AI-powered personalized recommendations
- **Traffic Integration**: Real-time traffic data for walking times
- **Weather Consideration**: Weather-based recommendations
- **Historical Data**: Usage pattern analysis
- **User Preferences**: Personalized scoring weights
- **Real-time Updates**: WebSocket for live availability updates
- **Advanced Filters**: Time-based pricing, amenities, security
- **Route Optimization**: Multi-stop parking recommendations
- **Social Features**: User ratings and reviews integration