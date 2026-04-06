# Reservation Service

Reservation Management and User Statistics Service for Smart Parking System.

## 📋 Overview

The Reservation Service handles all booking-related operations including reservation management, quick booking functionality, check-in/check-out processes, user statistics, and reservation history. It serves as the central booking engine for the Smart Parking System.

## 🚀 Features

- **Reservation Management**
  - Create, read, update, delete reservations
  - Multi-step booking process
  - Reservation status tracking
  - Automatic seat assignment

- **Quick Booking**
  - One-click parking reservation
  - Automatic seat selection
  - Payment calculation integration
  - Instant confirmation

- **Check-in/Check-out**
  - QR code or manual check-in
  - Automatic time tracking
  - Real-time cost calculation
  - Receipt generation

- **User Statistics**
  - Total reservations and spending
  - Favorite parking locations
  - Usage patterns and history
  - Performance metrics

- **Advanced Features**
  - Booking conflict resolution
  - Automatic cancellation handling
  - Integration with payment systems
  - Real-time availability updates

## 🛠 Technology Stack

- **Framework**: FastAPI
- **Database**: SQLite with SQLAlchemy ORM
- **HTTP Client**: httpx for service communication
- **Authentication**: JWT token validation
- **Validation**: Pydantic models
- **Async Support**: Full async/await implementation

## 📁 Project Structure

```
reservation-service/
├── routers/
│   ├── reservation.py       # Reservation endpoints
│   └── statistics.py        # Statistics endpoints
├── services/
│   ├── reservation_service.py # Business logic
│   └── auth_service.py      # Authentication helpers
├── database.py              # Database models and connection
├── schemas.py               # Pydantic schemas
├── main.py                  # FastAPI application
├── migrate_db.py           # Database migration script
├── requirements.txt         # Python dependencies
└── Dockerfile              # Container configuration
```

## 🔧 Installation & Setup

### Prerequisites
- Python 3.11+
- pip or poetry
- Running Parking Service (for seat data)
- Running Auth Service (for user validation)

### Local Development

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the service**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8003 --reload
   ```

3. **Access the service**:
   - API: http://localhost:8003
   - Documentation: http://localhost:8003/docs

### Docker Development

1. **Build the image**:
   ```bash
   docker build -t reservation-service .
   ```

2. **Run the container**:
   ```bash
   docker run -p 8003:8003 reservation-service
   ```

## 📚 API Documentation

### Base URL
- Local: `http://localhost:8003`
- Gateway: `http://localhost:8000`

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

### Key Endpoints

#### Reservation Management
- `GET /reservations` - Get user reservations
- `POST /reservations` - Create new reservation
- `DELETE /reservations/{id}` - Cancel reservation

#### Quick Booking
- `POST /reservations/quick-book-prepare/{parking_id}` - Prepare quick booking
- `POST /reservations/quick-book-confirm` - Confirm quick booking

#### Check-in/Check-out
- `POST /reservations/{id}/check-in` - Check into reservation
- `POST /reservations/{id}/check-out` - Check out of reservation

#### Statistics & History
- `GET /statistics` - Get user statistics
- `GET /history` - Get reservation history
- `GET /reservations/booked-seats/{parking_id}` - Get booked seats

#### Health Check
- `GET /health` - Service health status

For complete API documentation, see: [reservation-service.yaml](../../docs/api-specs/reservation-service.yaml)

## 🗄 Database Schema

### Reservations Table
- `id` (Primary Key)
- `user_id` - User who made the reservation
- `parking_id` - Target parking location
- `seat_id` - Assigned seat (nullable)
- `vehicle_id` - User's vehicle (nullable)
- `start_time`, `end_time` - Reservation time slot
- `check_in_time`, `check_out_time` - Actual usage times
- `status` - Reservation status (reserved, checked_in, completed, cancelled)
- `total_cost` - Final cost after check-out
- `created_at` - Reservation timestamp

## 🔄 Reservation Workflow

### Standard Booking Flow
1. **Create Reservation** → `POST /reservations`
2. **Check-in** → `POST /reservations/{id}/check-in`
3. **Check-out** → `POST /reservations/{id}/check-out`
4. **Payment Processing** → Automatic cost calculation

### Quick Booking Flow
1. **Prepare** → `POST /reservations/quick-book-prepare/{parking_id}`
2. **Confirm** → `POST /reservations/quick-book-confirm`
3. **Auto Check-in** → Immediate activation

## 📊 Statistics Features

### User Statistics Include:
- **Total Reservations**: Lifetime booking count
- **Total Spent**: Cumulative parking costs
- **Total Hours**: Time spent parking
- **Favorite Parking**: Most frequently used location
- **Status Breakdown**: Reservations by status

### Example Statistics Response:
```json
{
  "total_reservations": 25,
  "total_spent": 500000,
  "total_hours": 50.5,
  "favorite_parking_id": 1,
  "favorite_parking_name": "Bãi đỗ xe Tràng Tiền Plaza",
  "most_visited_count": 8,
  "reservations_by_status": {
    "reserved": 2,
    "checked_in": 1,
    "completed": 22
  }
}
```

## 🧪 Testing

### Manual Testing
Use the interactive API documentation at `/docs` endpoint.

### Example Requests

**Create Reservation**:
```bash
curl -X POST "http://localhost:8003/reservations" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "parking_id": 1,
    "start_time": "2024-01-01T10:00:00Z",
    "end_time": "2024-01-01T12:00:00Z",
    "vehicle_id": 1
  }'
```

**Quick Book Prepare**:
```bash
curl -X POST "http://localhost:8003/reservations/quick-book-prepare/1" \
  -H "Authorization: Bearer <token>"
```

**Check-in**:
```bash
curl -X POST "http://localhost:8003/reservations/1/check-in" \
  -H "Authorization: Bearer <token>"
```

**Get Statistics**:
```bash
curl -X GET "http://localhost:8003/statistics" \
  -H "Authorization: Bearer <token>"
```

## 🔄 Integration

### Service Dependencies
- **Auth Service**: User authentication and validation
- **Parking Service**: Seat availability and booking
- **Payment Service**: Cost calculations (future)

### External API Calls
```python
# Get parking information
response = await client.get(f"http://parking-service:8002/parkings/{parking_id}")

# Book seat
response = await client.post(f"http://parking-service:8002/seats/{seat_id}/book")
```

## 🚨 Error Handling

### Common Error Scenarios
- **401 Unauthorized**: Invalid or missing JWT token
- **404 Not Found**: Reservation or parking not found
- **400 Bad Request**: Invalid booking data or conflicts
- **409 Conflict**: Seat already booked for time slot

### Error Response Format
```json
{
  "detail": "Seat is already booked for this time period"
}
```

## ⚡ Performance Features

- **Async Operations**: Full async/await for I/O operations
- **Connection Pooling**: Efficient database connections
- **Batch Processing**: Bulk operations for statistics
- **Caching**: In-memory caching for frequently accessed data

## 🔐 Security Features

- **JWT Validation**: Token-based authentication
- **User Isolation**: Users can only access their own reservations
- **Input Validation**: Pydantic model validation
- **SQL Injection Protection**: SQLAlchemy ORM

## 📈 Monitoring & Logging

### Key Metrics
- Reservation success rate
- Average booking duration
- Check-in/check-out completion rate
- Popular parking locations

### Logging Events
- Reservation creation/cancellation
- Check-in/check-out operations
- Payment calculations
- Service integration calls
- Error tracking

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL`: SQLite database path
- `PYTHONPATH`: Python module path
- `AUTH_SERVICE_URL`: Auth service endpoint
- `PARKING_SERVICE_URL`: Parking service endpoint

### Service URLs (Docker)
- Auth Service: `http://auth-service:8001`
- Parking Service: `http://parking-service:8002`

## 🔄 Data Management

### Database Migration
```bash
python migrate_db.py
```

### Backup Strategy
- Regular database backups
- Reservation history preservation
- Statistics data retention

## 🤝 Contributing

1. Follow async/await patterns
2. Maintain service integration contracts
3. Update API documentation
4. Test booking workflows thoroughly
5. Handle edge cases (cancellations, conflicts)

## 📞 Support

For issues related to reservations, bookings, or this service:

1. **Check Dependencies**: Ensure Auth and Parking services are running
2. **Verify Tokens**: Validate JWT token format and expiration
3. **Review Logs**: Check for service communication errors
4. **Test Endpoints**: Use `/docs` for interactive testing
5. **Database State**: Verify reservation status consistency

## 🔮 Future Enhancements

- **Real-time Notifications**: WebSocket updates for reservation status
- **Advanced Scheduling**: Recurring reservations
- **Smart Recommendations**: AI-powered booking suggestions
- **Mobile Integration**: QR code check-in/check-out
- **Analytics Dashboard**: Advanced usage analytics
- **Multi-vehicle Support**: Enhanced vehicle management
- **Group Bookings**: Multiple seat reservations
- **Loyalty Program**: Points and rewards system