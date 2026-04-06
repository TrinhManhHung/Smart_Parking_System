# Parking Service

Parking Location and Seat Management Service for Smart Parking System.

## 📋 Overview

The Parking Service manages all parking-related operations including parking locations, seat/slot management, real-time availability tracking, and seat booking operations. It serves as the core parking data provider for the entire Smart Parking System.

## 🚀 Features

- **Parking Location Management**
  - CRUD operations for parking locations
  - Geographic coordinates (latitude/longitude)
  - Capacity and availability tracking
  - Hourly rate management

- **Seat Management**
  - Grid-based seat layout (rows and columns)
  - Real-time seat availability
  - Seat type categorization
  - Dynamic pricing per seat

- **Booking Operations**
  - Seat reservation with time slots
  - Conflict detection and prevention
  - Automatic seat release
  - Booking history tracking

- **Availability Checking**
  - Real-time availability queries
  - Time-based availability filtering
  - Bulk availability updates
  - Occupancy statistics

## 🛠 Technology Stack

- **Framework**: FastAPI
- **Database**: SQLite with SQLAlchemy ORM
- **Validation**: Pydantic models
- **Date/Time**: Python datetime with timezone support
- **Math**: Haversine distance calculations

## 📁 Project Structure

```
parking-service/
├── routers/
│   └── parking.py           # API endpoints
├── services/
│   └── parking_service.py   # Business logic
├── database.py              # Database models and connection
├── schemas.py               # Pydantic schemas
├── main.py                  # FastAPI application
├── requirements.txt         # Python dependencies
├── update_parking_data.py   # Data seeding script
└── Dockerfile              # Container configuration
```

## 🔧 Installation & Setup

### Prerequisites
- Python 3.11+
- pip or poetry

### Local Development

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the service**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8002 --reload
   ```

3. **Access the service**:
   - API: http://localhost:8002
   - Documentation: http://localhost:8002/docs

### Docker Development

1. **Build the image**:
   ```bash
   docker build -t parking-service .
   ```

2. **Run the container**:
   ```bash
   docker run -p 8002:8002 parking-service
   ```

## 📚 API Documentation

### Base URL
- Local: `http://localhost:8002`
- Gateway: `http://localhost:8000`

### Key Endpoints

#### Parking Locations
- `GET /parkings` - Get all parking locations
- `GET /parkings/{id}` - Get specific parking location
- `POST /parkings` - Create new parking location
- `PATCH /parkings/{id}/slots` - Update available slots

#### Seat Management
- `GET /parkings/{id}/seats` - Get seats for parking location
- `POST /seats/{id}/book` - Book a specific seat
- `POST /seats/{id}/release` - Release a booked seat

#### Health Check
- `GET /health` - Service health status

For complete API documentation, see: [parking-service.yaml](../../docs/api-specs/parking-service.yaml)

## 🗄 Database Schema

### Parkings Table
- `id` (Primary Key)
- `name` - Parking location name
- `address` - Full address
- `latitude`, `longitude` - GPS coordinates
- `total_slots` - Total parking capacity
- `available_slots` - Currently available slots
- `rate_per_hour` - Hourly parking rate (VND)

### Seats Table
- `id` (Primary Key)
- `parking_id` (Foreign Key)
- `row`, `col` - Grid position
- `seat_type` - Type of seat (standard, premium, etc.)
- `status` - Current status (available, booked)
- `price_per_hour` - Seat-specific pricing

### Seat Reservations Table
- `id` (Primary Key)
- `seat_id` (Foreign Key)
- `user_id` - User who made the reservation
- `start_time`, `end_time` - Reservation time slot
- `status` - Reservation status (active, completed, cancelled)
- `created_at` - Reservation timestamp

## 🏢 Default Parking Locations (Hanoi)

The service comes pre-seeded with 9 parking locations in Hanoi:

1. **Bãi đỗ xe Tràng Tiền Plaza** - Hoàn Kiếm District
2. **Bãi gửi xe Vincom Bà Triệu** - Hai Bà Trưng District
3. **Bãi đỗ xe Hồ Gươm** - Hoàn Kiếm District
4. **Bãi gửi xe Times City** - Hai Bà Trưng District
5. **Bãi đỗ xe Keangnam** - Nam Từ Liêm District
6. **Bãi gửi xe Lotte Center** - Ba Đình District
7. **Bãi đỗ xe Big C Thăng Long** - Cầu Giấy District
8. **Bãi gửi xe Royal City** - Thanh Xuân District
9. **Bãi gửi xe Học viện Bưu chính Viễn thông** - Hà Đông District

## 🔄 Seat Layout Algorithm

The service automatically generates optimal seat layouts:

```python
def calculate_grid_size(total_slots):
    sqrt_slots = math.sqrt(total_slots)
    rows = int(sqrt_slots)
    cols = math.ceil(total_slots / rows)
    return rows, cols
```

This creates roughly rectangular grids for efficient space utilization.

## ⏰ Time-Based Availability

### Availability Checking
- Supports ISO 8601 datetime format
- Timezone-aware calculations
- Conflict detection for overlapping reservations
- Real-time status updates

### Example Query
```bash
GET /parkings/1/seats?start_time=2024-01-01T10:00:00Z&end_time=2024-01-01T12:00:00Z
```

## 🧪 Testing

### Manual Testing
Use the interactive API documentation at `/docs` endpoint.

### Example Requests

**Get All Parkings**:
```bash
curl -X GET "http://localhost:8002/parkings"
```

**Get Seats with Availability**:
```bash
curl -X GET "http://localhost:8002/parkings/1/seats?start_time=2024-01-01T10:00:00Z&end_time=2024-01-01T12:00:00Z"
```

**Book a Seat**:
```bash
curl -X POST "http://localhost:8002/seats/1/book" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "start_time": "2024-01-01T10:00:00Z",
    "end_time": "2024-01-01T12:00:00Z"
  }'
```

## 🔄 Integration

### With Other Services
- **Gateway**: Routes parking-related requests
- **Reservation Service**: Provides parking data for bookings
- **Recommendation Service**: Supplies location and availability data
- **Payment Service**: Provides pricing information

### Data Seeding
The service automatically seeds parking data on startup via `seed_data()` function in `database.py`.

## 🚨 Error Handling

Standard HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid datetime, booking conflicts)
- `404`: Not Found (parking/seat not found)
- `409`: Conflict (seat already booked)

## 📊 Performance Features

- **Efficient Queries**: Optimized SQLAlchemy queries
- **Bulk Operations**: Batch seat status updates
- **Indexing**: Database indexes on frequently queried fields
- **Connection Pooling**: SQLAlchemy session management

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL`: SQLite database path
- `PYTHONPATH`: Python module path

### Startup Configuration
- Automatic table creation
- Data seeding on first run
- Health check endpoint

## 📈 Monitoring

### Key Metrics
- Total parking locations
- Total available seats
- Booking success rate
- Average occupancy rate

### Logging
- Booking operations
- Seat status changes
- Database operations
- Error tracking

## 🔄 Data Management

### Backup
- SQLite database file: `parking.db`
- Regular backups recommended for production

### Migration
- Schema changes via SQLAlchemy migrations
- Data migration scripts in `update_parking_data.py`

## 🤝 Contributing

1. Follow FastAPI best practices
2. Maintain database consistency
3. Update API documentation
4. Test booking logic thoroughly
5. Consider timezone implications

## 📞 Support

For issues related to parking locations, seat management, or this service:

1. Check service logs for booking conflicts
2. Verify database connectivity
3. Validate datetime formats
4. Review API documentation at `/docs`
5. Check seat availability calculations

## 🔮 Future Enhancements

- **Real-time Updates**: WebSocket support for live availability
- **Advanced Booking**: Recurring reservations
- **Dynamic Pricing**: Time-based pricing algorithms
- **Analytics**: Occupancy patterns and insights
- **Integration**: IoT sensor data for real-time occupancy