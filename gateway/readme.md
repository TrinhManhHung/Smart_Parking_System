# API Gateway

Central API Gateway for Smart Parking System - Single entry point for all client requests.

## 📋 Overview

The API Gateway serves as the unified entry point for the Smart Parking System, providing request routing, authentication, load balancing, and response aggregation. It acts as a reverse proxy that routes client requests to appropriate microservices while handling cross-cutting concerns like security and monitoring.

## 🚀 Features

- **Request Routing**
  - Intelligent request routing to microservices
  - Path-based routing configuration
  - Load balancing across service instances
  - Automatic service discovery

- **Authentication & Authorization**
  - JWT token validation
  - Bearer token authentication
  - User context extraction
  - Authorization header forwarding

- **Security**
  - CORS configuration
  - Rate limiting (future)
  - Request/response filtering
  - Security headers management

- **Monitoring & Logging**
  - Request/response logging
  - Performance monitoring
  - Error tracking
  - Health check aggregation

## 🛠 Technology Stack

- **Framework**: FastAPI
- **HTTP Client**: httpx for service communication
- **Authentication**: JWT token validation
- **CORS**: FastAPI CORS middleware
- **Async Support**: Full async/await implementation

## 📁 Project Structure

```
gateway/
├── routers/
│   └── gateway.py           # All API endpoints and routing logic
├── main.py                  # FastAPI application and middleware
├── requirements.txt         # Python dependencies
├── Dockerfile              # Container configuration
└── README.md               # This file
```

## 🔧 Installation & Setup

### Prerequisites
- Python 3.11+
- pip or poetry
- All microservices running (auth, parking, reservation, etc.)

### Local Development

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the gateway**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Access the gateway**:
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs

### Docker Development

1. **Build the image**:
   ```bash
   docker build -t gateway .
   ```

2. **Run the container**:
   ```bash
   docker run -p 8000:8000 gateway
   ```

## 📚 API Documentation

### Base URL
- Local: `http://localhost:8000`
- Production: Configure as needed

### Service Routing Map

| Endpoint Pattern | Target Service | Port | Description |
|-----------------|----------------|------|-------------|
| `/register`, `/login` | Auth Service | 8001 | Authentication |
| `/profile`, `/vehicles`, `/payment-methods`, `/favorites` | Auth Service | 8001 | User management |
| `/parkings`, `/seats` | Parking Service | 8002 | Parking data |
| `/reservations`, `/statistics`, `/history` | Reservation Service | 8003 | Booking management |
| `/recommendations` | Recommendation Service | 8004 | Location recommendations |
| `/payment/calculate` | Payment Service | 8005 | Payment calculations |

For complete API documentation, see: [gateway-service.yaml](../docs/api-specs/gateway-service.yaml)

## 🔐 Authentication Flow

### JWT Token Validation
```python
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### Protected Endpoints
Most endpoints require authentication except:
- `GET /` - Gateway info
- `GET /health` - Health check
- `POST /register` - User registration
- `POST /login` - User login
- `GET /parkings` - Public parking data
- `GET /recommendations` - Public recommendations

## 🔄 Request Flow

### Typical Request Flow
1. **Client Request** → Gateway (port 8000)
2. **Authentication** → JWT token validation (if required)
3. **Routing** → Determine target microservice
4. **Proxy Request** → Forward to microservice
5. **Response** → Return microservice response to client

### Example Flow Diagram
```
Client → Gateway:8000 → Auth Service:8001
                    ↓
                Parking Service:8002
                    ↓
            Reservation Service:8003
                    ↓
        Recommendation Service:8004
                    ↓
            Payment Service:8005
```

## 🧪 Testing

### Manual Testing
Use the interactive API documentation at `/docs` endpoint.

### Example Requests

**Gateway Info**:
```bash
curl -X GET "http://localhost:8000/"
```

**Health Check**:
```bash
curl -X GET "http://localhost:8000/health"
```

**Register User** (proxied to Auth Service):
```bash
curl -X POST "http://localhost:8000/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

**Get Parkings** (proxied to Parking Service):
```bash
curl -X GET "http://localhost:8000/parkings"
```

**Get Recommendations** (proxied to Recommendation Service):
```bash
curl -X GET "http://localhost:8000/recommendations?lat=21.0285&lng=105.8542"
```

**Authenticated Request** (proxied to Auth Service):
```bash
curl -X GET "http://localhost:8000/profile" \
  -H "Authorization: Bearer <jwt_token>"
```

## 🔄 Service Integration

### Microservice URLs (Docker)
```python
SERVICE_URLS = {
    "auth": "http://auth-service:8001",
    "parking": "http://parking-service:8002", 
    "reservation": "http://reservation-service:8003",
    "recommendation": "http://recommendation-service:8004",
    "payment": "http://payment-service:8005"
}
```

### HTTP Client Configuration
```python
async with httpx.AsyncClient() as client:
    response = await client.get(f"{service_url}{endpoint}")
    return response.json()
```

## 🚨 Error Handling

### Error Propagation
The gateway forwards errors from microservices:

```python
if response.status_code != 200:
    raise HTTPException(
        status_code=response.status_code, 
        detail=response.text
    )
```

### Common Error Scenarios
- **401 Unauthorized**: Invalid JWT token
- **404 Not Found**: Service or resource not found
- **503 Service Unavailable**: Microservice down
- **500 Internal Server Error**: Gateway or service error

## ⚡ Performance Features

- **Async Operations**: Non-blocking request handling
- **Connection Pooling**: Efficient HTTP connections
- **Request Pipelining**: Concurrent request processing
- **Response Streaming**: Large response handling

## 🔧 Configuration

### Environment Variables
- `SECRET_KEY`: JWT signing key (default: "your-secret-key")
- `ALGORITHM`: JWT algorithm (default: "HS256")
- `CORS_ORIGINS`: Allowed CORS origins (default: "*")

### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📊 Monitoring & Logging

### Key Metrics
- Request count per endpoint
- Response times per service
- Error rates by service
- Authentication success/failure rates

### Logging Events
- Incoming requests
- Service routing decisions
- Authentication events
- Error conditions
- Performance metrics

## 🔐 Security Features

- **JWT Validation**: Secure token verification
- **CORS Protection**: Cross-origin request control
- **Header Forwarding**: Secure header propagation
- **Input Validation**: Request parameter validation

## 🧪 Health Checks

### Gateway Health
- `GET /health` - Gateway status
- Service dependency checks
- Database connectivity (future)
- External service availability

### Service Health Monitoring
The gateway can aggregate health status from all microservices:

```python
async def check_service_health():
    services = ["auth", "parking", "reservation", "recommendation", "payment"]
    health_status = {}
    
    for service in services:
        try:
            response = await client.get(f"{service_url}/health")
            health_status[service] = "healthy"
        except:
            health_status[service] = "unhealthy"
    
    return health_status
```

## 🔄 Load Balancing

### Future Enhancements
- Round-robin load balancing
- Health-based routing
- Circuit breaker pattern
- Service discovery integration

## 🤝 Contributing

1. Follow FastAPI best practices
2. Maintain service routing accuracy
3. Update API documentation
4. Test authentication flows
5. Monitor performance impact

## 📞 Support

For issues related to the API Gateway:

1. **Check Service Status**: Verify all microservices are running
2. **Validate Tokens**: Ensure JWT tokens are valid and not expired
3. **Review Routing**: Check endpoint routing configuration
4. **Monitor Logs**: Look for service communication errors
5. **Test Endpoints**: Use `/docs` for interactive testing

## 🔮 Future Enhancements

- **Rate Limiting**: Request throttling per user/IP
- **Caching**: Response caching for frequently accessed data
- **Load Balancing**: Multiple instance support per service
- **Circuit Breaker**: Fault tolerance patterns
- **API Versioning**: Multiple API version support
- **Request Transformation**: Request/response modification
- **Analytics**: Advanced request analytics and insights
- **WebSocket Support**: Real-time communication proxy
- **GraphQL Gateway**: GraphQL API aggregation
- **Service Mesh Integration**: Istio/Linkerd compatibility

## 🏗 Architecture Benefits

### Centralized Management
- Single entry point for all clients
- Unified authentication and authorization
- Consistent error handling
- Centralized logging and monitoring

### Microservice Benefits
- Service isolation and independence
- Technology diversity support
- Scalability per service
- Fault tolerance and resilience

### Client Benefits
- Simplified API consumption
- Consistent response formats
- Single authentication flow
- Reduced client complexity