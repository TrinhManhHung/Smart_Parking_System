# Auth Service

Authentication and User Management Service for Smart Parking System.

## 📋 Overview

The Auth Service handles all user-related operations including authentication, profile management, vehicle management, payment methods, and favorite parkings. It serves as the central identity provider for the entire Smart Parking System.

## 🚀 Features

- **User Authentication**
  - User registration with email validation
  - JWT-based login system
  - Secure password hashing
  - Token-based session management

- **Profile Management**
  - User profile CRUD operations
  - Avatar upload support
  - Personal information management

- **Vehicle Management**
  - Multiple vehicle support per user
  - Vehicle type categorization (car, motorcycle, truck, van)
  - Default vehicle selection
  - License plate validation

- **Payment Methods**
  - Credit/debit card management
  - E-wallet integration support
  - Default payment method selection
  - Secure card information storage

- **Favorite Parkings**
  - Save frequently used parking locations
  - Custom nicknames for parking spots
  - Quick access to preferred locations

## 🛠 Technology Stack

- **Framework**: FastAPI
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Pydantic models

## 📁 Project Structure

```
auth-service/
├── routers/
│   └── auth.py              # API endpoints
├── services/
│   └── auth_service.py      # Business logic
├── database.py              # Database models and connection
├── schemas.py               # Pydantic schemas
├── main.py                  # FastAPI application
├── requirements.txt         # Python dependencies
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
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

3. **Access the service**:
   - API: http://localhost:8001
   - Documentation: http://localhost:8001/docs

### Docker Development

1. **Build the image**:
   ```bash
   docker build -t auth-service .
   ```

2. **Run the container**:
   ```bash
   docker run -p 8001:8001 auth-service
   ```

## 📚 API Documentation

### Base URL
- Local: `http://localhost:8001`
- Gateway: `http://localhost:8000`

### Authentication
Most endpoints require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

### Key Endpoints

#### Authentication
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /health` - Health check

#### Profile Management
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

#### Vehicle Management
- `GET /vehicles` - Get user vehicles
- `POST /vehicles` - Add new vehicle
- `PUT /vehicles/{id}` - Update vehicle
- `DELETE /vehicles/{id}` - Delete vehicle

#### Payment Methods
- `GET /payment-methods` - Get payment methods
- `POST /payment-methods` - Add payment method
- `PUT /payment-methods/{id}` - Update payment method
- `DELETE /payment-methods/{id}` - Delete payment method

#### Favorites
- `GET /favorites` - Get favorite parkings
- `POST /favorites` - Add favorite parking
- `PUT /favorites/{id}` - Update favorite
- `DELETE /favorites/{id}` - Remove favorite

For complete API documentation, see: [auth-service.yaml](../../docs/api-specs/auth-service.yaml)

## 🗄 Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `password_hash`
- `full_name`
- `phone`
- `avatar_url`
- `created_at`

### Vehicles Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `license_plate` (Unique)
- `vehicle_type`
- `brand`, `model`, `color`
- `is_default`
- `created_at`

### Payment Methods Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `method_type`
- `card_number` (Encrypted)
- `card_holder`
- `expiry_date`
- `is_default`
- `created_at`

### Favorite Parkings Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `parking_id`
- `nickname`
- `created_at`

## 🔐 Security Features

- **Password Security**: bcrypt hashing with salt
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Pydantic model validation
- **SQL Injection Protection**: SQLAlchemy ORM
- **CORS Configuration**: Configurable cross-origin requests

## 🧪 Testing

### Manual Testing
Use the interactive API documentation at `/docs` endpoint.

### Example Requests

**Register User**:
```bash
curl -X POST "http://localhost:8001/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

**Login**:
```bash
curl -X POST "http://localhost:8001/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

## 🔄 Integration

### With Other Services
- **Gateway**: Routes all client requests through API Gateway
- **Reservation Service**: Validates user identity for bookings
- **All Services**: Provides user authentication and profile data

### Environment Variables
- `SECRET_KEY`: JWT signing key (default: "your-secret-key")
- `ALGORITHM`: JWT algorithm (default: "HS256")
- `DATABASE_URL`: SQLite database path

## 🚨 Error Handling

Standard HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid token/credentials)
- `404`: Not Found
- `409`: Conflict (duplicate email/license plate)

## 📈 Performance

- **Database**: SQLite for development, easily upgradeable to PostgreSQL
- **Connection Pooling**: SQLAlchemy session management
- **Async Support**: FastAPI async capabilities

## 🔧 Configuration

Key configuration in `main.py`:
- CORS settings
- Database initialization
- Startup events

## 📝 Logging

- Request/response logging
- Error tracking
- Authentication events
- Database operations

## 🤝 Contributing

1. Follow FastAPI best practices
2. Use Pydantic for data validation
3. Maintain database migrations
4. Update API documentation
5. Add appropriate error handling

## 📞 Support

For issues related to authentication, user management, or this service, please check:
1. Service logs
2. Database connectivity
3. JWT token validity
4. API documentation at `/docs`