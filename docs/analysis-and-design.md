# Analysis and Design — Business Process Automation Solution

> **Goal**: Analyze a specific business process and design a service-oriented automation solution (SOA/Microservices).
> Scope: 4–6 week assignment — focus on **one business process**, not an entire system.

**References:**
1. *Service-Oriented Architecture: Analysis and Design for Services and Microservices* — Thomas Erl (2nd Edition)
2. *Microservices Patterns: With Examples in Java* — Chris Richardson
3. *Bài tập — Phát triển phần mềm hướng dịch vụ* — Hung Dang (available in Vietnamese)

---

## Part 1 — Analysis Preparation

### 1.1 Business Process Definition

Describe or diagram the high-level Business Process to be automated.

- **Domain**: *(fill in)*
- **Business Process**: *(fill in)*
- **Actors**: *(fill in)*
- **Scope**: *(fill in)*

**Process Diagram:**

*(Insert BPMN, flowchart, or image into `docs/asset/` and reference here)*

### 1.2 Existing Automation Systems

List existing systems, databases, or legacy logic related to this process.

| System Name | Type | Current Role | Interaction Method |
|-------------|------|--------------|-------------------|
|             |      |              |                   |

> If none exist, state: *"None — the process is currently performed manually."*

### 1.3 Non-Functional Requirements

Non-functional requirements serve as input for identifying Utility Service and Microservice Candidates in step 2.7.

| Requirement    | Description |
|----------------|-------------|
| Performance    |             |
| Security       |             |
| Scalability    |             |
| Availability   |             |

---

## Part 2 — REST/Microservices Modeling

### 2.1 Decompose Business Process & 2.2 Filter Unsuitable Actions

Decompose the process from 1.1 into granular actions. Mark actions unsuitable for service encapsulation.

| # | Action | Actor | Description | Suitable? |
|---|--------|-------|-------------|-----------|
|   |        |       |             | ✅ / ❌    |

> Actions marked ❌: manual-only, require human judgment, or cannot be encapsulated as a service.

### 2.3 Entity Service Candidates

Identify business entities and group reusable (agnostic) actions into Entity Service Candidates.

| Entity | Service Candidate | Agnostic Actions |
|--------|-------------------|------------------|
|        |                   |                  |

### 2.4 Task Service Candidate

Group process-specific (non-agnostic) actions into a Task Service Candidate.

| Non-agnostic Action | Task Service Candidate |
|---------------------|------------------------|
|                     |                        |

### 2.5 Identify Resources

Map entities/processes to REST URI Resources.

| Entity / Process | Resource URI |
|------------------|--------------|
|                  |              |

### 2.6 Associate Capabilities with Resources and Methods

| Service Candidate | Capability | Resource | HTTP Method |
|-------------------|------------|----------|-------------|
|                   |            |          |             |

### 2.7 Utility Service & Microservice Candidates

Based on Non-Functional Requirements (1.3) and Processing Requirements, identify cross-cutting utility logic or logic requiring high autonomy/performance.

| Candidate | Type (Utility / Microservice) | Justification |
|-----------|-------------------------------|---------------|
|           |                               |               |

### 2.8 Service Composition Candidates

Interaction diagram showing how Service Candidates collaborate to fulfill the business process.

```mermaid
sequenceDiagram
    participant Client
    participant TaskService
    participant EntityServiceA
    participant EntityServiceB
    participant UtilityService

    Client->>TaskService: (fill in)
    TaskService->>EntityServiceA: (fill in)
    EntityServiceA-->>TaskService: (fill in)
    TaskService->>EntityServiceB: (fill in)
    EntityServiceB-->>TaskService: (fill in)
    TaskService-->>Client: (fill in)
```

---

## Part 3 — Service-Oriented Design

### 3.1 Uniform Contract Design

Service Contract specification for each service. Full OpenAPI specs:
- [`docs/api-specs/service-a.yaml`](api-specs/service-a.yaml)
- [`docs/api-specs/service-b.yaml`](api-specs/service-b.yaml)

**Service A:**

| Endpoint | Method | Media Type | Response Codes |
|----------|--------|------------|----------------|
|          |        |            |                |

**Service B:**

| Endpoint | Method | Media Type | Response Codes |
|----------|--------|------------|----------------|
|          |        |            |                |

### 3.2 Service Logic Design

Internal processing flow for each service.

**Service A:**

```mermaid
flowchart TD
    A[Receive Request] --> B{Validate?}
    B -->|Valid| C[(Process / DB)]
    B -->|Invalid| D[Return 4xx Error]
    C --> E[Return Response]
```

**Service B:**

```mermaid
flowchart TD
    A[Receive Request] --> B{Validate?}
    B -->|Valid| C[(Process / DB)]
    B -->|Invalid| D[Return 4xx Error]
    C --> E[Return Response]
```


---

# Smart Parking System - Analysis and Design Documentation

## Part 1 — Analysis Preparation

### 1.1 Business Process Definition

- **Domain**: Smart Parking Management and Reservation System
- **Business Process**: Automated parking space discovery, reservation, and payment
- **Actors**: 
  - End Users (Drivers looking for parking)
  - System Administrators (Parking lot managers)
  - Payment Processors
- **Scope**: 
  - User registration and authentication
  - Parking lot and seat management
  - Real-time seat availability tracking
  - Smart parking recommendations based on location
  - Online reservation and payment
  - Check-in/Check-out management
  - User profile and preferences management

**Process Diagram:**

```mermaid
graph TD
    A[User Opens App] --> B{Registered?}
    B -->|No| C[Register Account]
    B -->|Yes| D[Login]
    C --> D
    D --> E[View Available Parkings]
    E --> F{Search Method}
    F -->|Browse| G[View All Parkings]
    F -->|Location-based| H[Find Nearest Parking]
    G --> I{Select Parking}
    H --> I
    I --> J{Booking Method}
    J -->|Quick Book| K[Auto-assign Seat]
    J -->|View Details| L[Select Specific Seat]
    K --> M[Select Payment Method]
    L --> M
    M --> N[Confirm Payment]
    N --> O[Reservation Created]
    O --> P[Check-in at Parking]
    P --> Q[Park Vehicle]
    Q --> R[Check-out]
    R --> S[Reservation Completed]
    S --> T[Seat Released]
```

### 1.2 Existing Automation Systems

| System Name | Type | Current Role | Interaction Method |
|-------------|------|--------------|-------------------|
| None | - | - | - |

> The process is currently performed manually or through basic parking management systems without integrated online booking.

### 1.3 Non-Functional Requirements

| Requirement    | Description |
|----------------|-------------|
| **Performance** | - Response time < 2 seconds for search queries<br/>- Support 100+ concurrent users<br/>- Real-time seat availability updates |
| **Security** | - JWT-based authentication<br/>- Password encryption (bcrypt)<br/>- Secure payment information storage<br/>- HTTPS for all communications |
| **Scalability** | - Microservices architecture for independent scaling<br/>- Database per service pattern<br/>- Horizontal scaling capability |
| **Availability** | - 99.9% uptime target<br/>- Health check endpoints<br/>- Graceful error handling<br/>- Service redundancy support |
| **Usability** | - Responsive web interface<br/>- Intuitive booking flow<br/>- Multi-language support (future)<br/>- Mobile-friendly design |
| **Maintainability** | - Clean code architecture<br/>- Comprehensive API documentation<br/>- Containerized deployment<br/>- Automated testing (future) |

---

## Part 2 — REST/Microservices Modeling

### 2.1 Decompose Business Process & 2.2 Filter Unsuitable Actions

| # | Action | Actor | Description | Suitable? |
|---|--------|-------|-------------|-----------|
| 1 | Register account | User | Create new user account with email and password | ✅ |
| 2 | Login | User | Authenticate user and generate JWT token | ✅ |
| 3 | Update profile | User | Modify user information (name, phone, avatar) | ✅ |
| 4 | Add vehicle | User | Register vehicle information | ✅ |
| 5 | Add payment method | User | Store payment method details | ✅ |
| 6 | Browse parking lots | User | View list of available parking lots | ✅ |
| 7 | Search by location | User | Find nearest parking based on GPS coordinates | ✅ |
| 8 | View parking details | User | See parking information and seat layout | ✅ |
| 9 | Check seat availability | System | Real-time availability checking | ✅ |
| 10 | Select seat | User | Choose specific parking seat | ✅ |
| 11 | Quick book | User | Auto-assign available seat | ✅ |
| 12 | Calculate payment | System | Compute parking fee based on duration | ✅ |
| 13 | Process payment | System | Handle payment transaction | ✅ |
| 14 | Create reservation | System | Generate booking record | ✅ |
| 15 | Send confirmation | System | Notify user of successful booking | ✅ |
| 16 | Check-in | User | Mark arrival at parking lot | ✅ |
| 17 | Park vehicle | User | Physical parking action | ❌ |
| 18 | Check-out | User | Mark departure from parking lot | ✅ |
| 19 | Release seat | System | Free up parking seat | ✅ |
| 20 | Update availability | System | Refresh parking slot count | ✅ |
| 21 | Add to favorites | User | Save frequently used parking lots | ✅ |
| 22 | Get recommendations | System | Suggest best parking options | ✅ |
| 23 | View reservation history | User | See past bookings | ✅ |
| 24 | Cancel reservation | User | Cancel active booking | ✅ |

> Action #17 marked ❌: Physical action that cannot be automated through software.

### 2.3 Entity Service Candidates

| Entity | Service Candidate | Agnostic Actions |
|--------|-------------------|------------------|
| User | Auth Service | Register, Login, Get Profile, Update Profile, Manage Vehicles, Manage Payment Methods, Manage Favorites |
| Parking | Parking Service | Get All Parkings, Get Parking Details, Get Seats, Book Seat, Release Seat, Update Availability |
| Reservation | Reservation Service | Create Reservation, Get Reservations, Check-in, Check-out, Cancel Reservation, Quick Book |
| Payment | Payment Service | Calculate Payment, Process Payment |
| Recommendation | Recommendation Service | Get Nearest Parkings, Calculate Distance, Score Parkings |

### 2.4 Task Service Candidate

| Non-agnostic Action | Task Service Candidate |
|---------------------|------------------------|
| Complete booking flow (search → select → pay → confirm) | Booking Orchestration (handled by Gateway) |
| User onboarding (register → add vehicle → add payment) | Setup Wizard (handled by Frontend) |
| Smart recommendation with filters | Recommendation Service |

### 2.5 Identify Resources

| Entity / Process | Resource URI |
|------------------|--------------|
| User Authentication | `/register`, `/login` |
| User Profile | `/profile` |
| Vehicles | `/vehicles`, `/vehicles/{id}` |
| Payment Methods | `/payment-methods`, `/payment-methods/{id}` |
| Favorite Parkings | `/favorites`, `/favorites/{id}` |
| Parkings | `/parkings`, `/parkings/{id}` |
| Seats | `/parkings/{id}/seats`, `/seats/{id}` |
| Reservations | `/reservations`, `/reservations/{id}` |
| Quick Booking | `/reservations/quick-book/{parking_id}` |
| Check-in/out | `/reservations/{id}/check-in`, `/reservations/{id}/check-out` |
| Payment Calculation | `/payment/calculate` |
| Recommendations | `/recommendations` |
| Health Check | `/health` |

### 2.6 Associate Capabilities with Resources and Methods

| Service Candidate | Capability | Resource | HTTP Method |
|-------------------|------------|----------|-------------|
| Auth Service | Register user | `/register` | POST |
| Auth Service | Login user | `/login` | POST |
| Auth Service | Get profile | `/profile` | GET |
| Auth Service | Update profile | `/profile` | PUT |
| Auth Service | List vehicles | `/vehicles` | GET |
| Auth Service | Add vehicle | `/vehicles` | POST |
| Auth Service | Update vehicle | `/vehicles/{id}` | PUT |
| Auth Service | Delete vehicle | `/vehicles/{id}` | DELETE |
| Auth Service | List payment methods | `/payment-methods` | GET |
| Auth Service | Add payment method | `/payment-methods` | POST |
| Auth Service | Update payment method | `/payment-methods/{id}` | PUT |
| Auth Service | Delete payment method | `/payment-methods/{id}` | DELETE |
| Auth Service | List favorites | `/favorites` | GET |
| Auth Service | Add favorite | `/favorites` | POST |
| Auth Service | Update favorite | `/favorites/{id}` | PUT |
| Auth Service | Remove favorite | `/favorites/{id}` | DELETE |
| Parking Service | List parkings | `/parkings` | GET |
| Parking Service | Get parking details | `/parkings/{id}` | GET |
| Parking Service | Get parking seats | `/parkings/{id}/seats` | GET |
| Parking Service | Book seat | `/seats/{id}/book` | POST |
| Parking Service | Release seat | `/seats/{id}/release` | POST |
| Parking Service | Update slots | `/parkings/{id}/slots` | PATCH |
| Reservation Service | List reservations | `/reservations` | GET |
| Reservation Service | Create reservation | `/reservations` | POST |
| Reservation Service | Quick book | `/reservations/quick-book/{parking_id}` | POST |
| Reservation Service | Get booked seats | `/reservations/booked-seats/{parking_id}` | GET |
| Reservation Service | Check-in | `/reservations/{id}/check-in` | POST |
| Reservation Service | Check-out | `/reservations/{id}/check-out` | POST |
| Reservation Service | Cancel reservation | `/reservations/{id}` | DELETE |
| Payment Service | Calculate payment | `/payment/calculate` | POST |
| Recommendation Service | Get recommendations | `/recommendations` | GET |

### 2.7 Utility Service & Microservice Candidates

| Candidate | Type | Justification |
|-----------|------|---------------|
| Auth Service | Microservice | High autonomy required for security. Handles sensitive user data and authentication. Independent scaling for user management. |
| Parking Service | Microservice | Core business entity. Requires independent deployment and scaling. Manages parking inventory. |
| Reservation Service | Microservice | Complex business logic for booking flow. Needs to coordinate with multiple services. High transaction volume. |
| Recommendation Service | Microservice | Computationally intensive (Haversine calculations, scoring). Can be scaled independently based on search traffic. |
| Payment Service | Utility Service | Cross-cutting concern for payment calculations. Stateless and reusable across different booking flows. |
| API Gateway | Utility Service | Cross-cutting concerns: routing, authentication, request aggregation. Single entry point for all clients. |

### 2.8 Service Composition Candidates

#### Booking Flow Composition

```mermaid
sequenceDiagram
    participant Client
    participant Gateway
    participant Auth
    participant Parking
    participant Payment
    participant Reservation
    
    Client->>Gateway: POST /parkings/{id}/seats (JWT)
    Gateway->>Auth: Validate JWT
    Auth-->>Gateway: User ID
    Gateway->>Parking: GET /parkings/{id}/seats
    Parking-->>Gateway: Available seats
    Gateway-->>Client: Seat grid
    
    Client->>Gateway: POST /payment/calculate
    Gateway->>Payment: Calculate cost
    Payment->>Parking: GET /parkings/{id}
    Parking-->>Payment: Parking rate
    Payment-->>Gateway: Total cost
    Gateway-->>Client: Payment info
    
    Client->>Gateway: POST /reservations (with seat_number)
    Gateway->>Parking: POST /seats/{id}/book
    Parking-->>Gateway: Seat booked
    Gateway->>Reservation: POST /reservations
    Reservation->>Parking: PATCH /parkings/{id}/slots (decrease)
    Parking-->>Reservation: Slots updated
    Reservation-->>Gateway: Reservation created
    Gateway-->>Client: Booking confirmed
```

#### Quick Book Flow Composition

```mermaid
sequenceDiagram
    participant Client
    participant Gateway
    participant Auth
    participant Reservation
    participant Parking
    participant Payment
    
    Client->>Gateway: POST /reservations/quick-book/{parking_id} (JWT)
    Gateway->>Auth: Validate JWT
    Auth-->>Gateway: User ID
    Gateway->>Reservation: Quick book request
    Reservation->>Parking: GET /parkings/{id}
    Parking-->>Reservation: Parking info
    Reservation->>Reservation: Auto-select available seat
    Reservation->>Parking: PATCH /parkings/{id}/slots (decrease)
    Parking-->>Reservation: Slots updated
    Reservation-->>Gateway: Reservation with seat_number
    Gateway->>Payment: Calculate payment
    Payment-->>Gateway: Cost
    Gateway-->>Client: Booking + Payment info
```

#### Checkout Flow Composition

```mermaid
sequenceDiagram
    participant Client
    participant Gateway
    participant Auth
    participant Reservation
    participant Parking
    
    Client->>Gateway: POST /reservations/{id}/check-out (JWT)
    Gateway->>Auth: Validate JWT
    Auth-->>Gateway: User ID
    Gateway->>Reservation: Check-out request
    Reservation->>Parking: GET /parkings/{id}/seats
    Parking-->>Reservation: Seat list
    Reservation->>Reservation: Find seat by seat_number
    Reservation->>Parking: POST /seats/{id}/release
    Parking->>Parking: Update seat status
    Parking->>Parking: Complete SeatReservation
    Parking-->>Reservation: Seat released
    Reservation->>Parking: PATCH /parkings/{id}/slots (increase)
    Parking-->>Reservation: Slots updated
    Reservation-->>Gateway: Checkout complete
    Gateway-->>Client: Success
```

#### Recommendation Flow Composition

```mermaid
sequenceDiagram
    participant Client
    participant Gateway
    participant Recommendation
    participant Parking
    
    Client->>Gateway: GET /recommendations?lat=X&lng=Y&filters
    Gateway->>Recommendation: Get recommendations
    Recommendation->>Parking: GET /parkings
    Parking-->>Recommendation: All parkings
    Recommendation->>Recommendation: Calculate distances (Haversine)
    Recommendation->>Recommendation: Calculate scores (multi-factor)
    Recommendation->>Recommendation: Apply filters
    Recommendation->>Recommendation: Sort by criteria
    Recommendation-->>Gateway: Top 10 recommendations
    Gateway-->>Client: Recommended parkings
```

---

## Part 3 — Service-Oriented Design

### 3.1 Uniform Contract Design

Full OpenAPI specifications available in:
- [`docs/api-specs/auth-service.yaml`](api-specs/auth-service.yaml)
- [`docs/api-specs/service-a.yaml`](api-specs/service-a.yaml) (Template)
- [`docs/api-specs/service-b.yaml`](api-specs/service-b.yaml) (Template)

#### Auth Service Contract

| Endpoint | Method | Media Type | Response Codes |
|----------|--------|------------|----------------|
| `/health` | GET | application/json | 200 |
| `/register` | POST | application/json | 200, 400 |
| `/login` | POST | application/json | 200, 401 |
| `/profile` | GET | application/json | 200, 401 |
| `/profile` | PUT | application/json | 200, 401 |
| `/vehicles` | GET | application/json | 200, 401 |
| `/vehicles` | POST | application/json | 200, 400, 401 |
| `/vehicles/{id}` | PUT | application/json | 200, 401, 404 |
| `/vehicles/{id}` | DELETE | application/json | 200, 401, 404 |
| `/payment-methods` | GET | application/json | 200, 401 |
| `/payment-methods` | POST | application/json | 200, 401 |
| `/payment-methods/{id}` | PUT | application/json | 200, 401, 404 |
| `/payment-methods/{id}` | DELETE | application/json | 200, 401, 404 |
| `/favorites` | GET | application/json | 200, 401 |
| `/favorites` | POST | application/json | 200, 400, 401 |
| `/favorites/{id}` | PUT | application/json | 200, 401, 404 |
| `/favorites/{id}` | DELETE | application/json | 200, 401, 404 |

#### Parking Service Contract

| Endpoint | Method | Media Type | Response Codes |
|----------|--------|------------|----------------|
| `/health` | GET | application/json | 200 |
| `/parkings` | GET | application/json | 200 |
| `/parkings/{id}` | GET | application/json | 200, 404 |
| `/parkings/{id}/seats` | GET | application/json | 200, 404 |
| `/seats/{id}/book` | POST | application/json | 200, 400, 404 |
| `/seats/{id}/release` | POST | application/json | 200, 404 |
| `/parkings/{id}/slots` | PATCH | application/json | 200, 400, 404 |

#### Reservation Service Contract

| Endpoint | Method | Media Type | Response Codes |
|----------|--------|------------|----------------|
| `/health` | GET | application/json | 200 |
| `/reservations` | GET | application/json | 200, 401 |
| `/reservations` | POST | application/json | 200, 400, 401 |
| `/reservations/quick-book/{parking_id}` | POST | application/json | 200, 400, 401, 404 |
| `/reservations/booked-seats/{parking_id}` | GET | application/json | 200 |
| `/reservations/{id}/check-in` | POST | application/json | 200, 400, 401, 404 |
| `/reservations/{id}/check-out` | POST | application/json | 200, 400, 401, 404 |
| `/reservations/{id}` | DELETE | application/json | 200, 400, 401, 404 |

#### Payment Service Contract

| Endpoint | Method | Media Type | Response Codes |
|----------|--------|------------|----------------|
| `/health` | GET | application/json | 200 |
| `/payment/calculate` | POST | application/json | 200, 400 |

#### Recommendation Service Contract

| Endpoint | Method | Media Type | Response Codes |
|----------|--------|------------|----------------|
| `/health` | GET | application/json | 200 |
| `/recommendations` | GET | application/json | 200, 400 |

### 3.2 Service Logic Design

#### Auth Service Logic

```mermaid
flowchart TD
    A[Receive Request] --> B{Endpoint Type}
    B -->|Register| C[Validate Email Format]
    B -->|Login| D[Validate Credentials]
    B -->|Profile/CRUD| E[Validate JWT Token]
    
    C --> F{Email Exists?}
    F -->|Yes| G[Return 400 Error]
    F -->|No| H[Hash Password]
    H --> I[Create User Record]
    I --> J[Generate JWT Token]
    J --> K[Return Token + User]
    
    D --> L{Credentials Valid?}
    L -->|No| M[Return 401 Error]
    L -->|Yes| J
    
    E --> N{Token Valid?}
    N -->|No| O[Return 401 Error]
    N -->|Yes| P[Extract User ID]
    P --> Q{Operation Type}
    Q -->|Read| R[Query Database]
    Q -->|Create| S[Insert Record]
    Q -->|Update| T[Update Record]
    Q -->|Delete| U[Delete Record]
    R --> V[Return Data]
    S --> V
    T --> V
    U --> V
```

#### Parking Service Logic

```mermaid
flowchart TD
    A[Receive Request] --> B{Endpoint Type}
    B -->|Get Parkings| C[Query All Parkings]
    B -->|Get Seats| D[Query Seats by Parking ID]
    B -->|Book Seat| E[Validate Seat Availability]
    B -->|Release Seat| F[Find Seat by ID]
    B -->|Update Slots| G[Validate Slot Count]
    
    C --> H[Return Parking List]
    
    D --> I{Time Range Provided?}
    I -->|Yes| J[Check SeatReservations]
    I -->|No| K[Return All Seats]
    J --> L[Mark Conflicting Seats as Booked]
    L --> K
    
    E --> M{Seat Available?}
    M -->|No| N[Return 400 Error]
    M -->|Yes| O[Create SeatReservation]
    O --> P[Update Seat Status = booked]
    P --> Q[Return Success]
    
    F --> R{Seat Exists?}
    R -->|No| S[Return 404 Error]
    R -->|Yes| T[Update Seat Status = available]
    T --> U[Complete SeatReservations]
    U --> Q
    
    G --> V{Valid Count?}
    V -->|No| W[Return 400 Error]
    V -->|Yes| X[Update Available Slots]
    X --> Q
```

#### Reservation Service Logic

```mermaid
flowchart TD
    A[Receive Request] --> B{Endpoint Type}
    B -->|Create| C[Validate Input]
    B -->|Quick Book| D[Get Parking Info]
    B -->|Check-in| E[Find Reservation]
    B -->|Check-out| F[Find Reservation]
    B -->|Cancel| G[Find Reservation]
    
    C --> H[Parse DateTime]
    H --> I[Create Reservation Record]
    I --> J[Call Parking Service]
    J --> K[Decrease Available Slots]
    K --> L[Return Reservation]
    
    D --> M{Slots Available?}
    M -->|No| N[Return 400 Error]
    M -->|Yes| O[Get Reserved Seats]
    O --> P[Generate Available Seats]
    P --> Q[Random Select Seat]
    Q --> R[Create Reservation]
    R --> K
    
    E --> S{Status = reserved?}
    S -->|No| T[Return 400 Error]
    S -->|Yes| U[Update Status = checked_in]
    U --> V[Set checked_in_at]
    V --> L
    
    F --> W{Status = checked_in?}
    W -->|No| T
    W -->|Yes| X[Parse Seat Number]
    X --> Y[Find Seat ID]
    Y --> Z[Call Release Seat API]
    Z --> AA[Update Status = completed]
    AA --> AB[Increase Available Slots]
    AB --> L
    
    G --> AC{Status = reserved?}
    AC -->|No| T
    AC -->|Yes| AD[Parse Seat Number]
    AD --> AE[Find Seat ID]
    AE --> AF[Call Release Seat API]
    AF --> AG[Delete Reservation]
    AG --> AB
```

#### Payment Service Logic

```mermaid
flowchart TD
    A[Receive Calculate Request] --> B[Validate Input]
    B --> C[Call Parking Service]
    C --> D[Get Parking Rate]
    D --> E[Calculate Duration]
    E --> F[Duration = check_out - check_in]
    F --> G[Convert to Hours]
    G --> H[Total = Hours × Rate]
    H --> I[Round to 2 Decimals]
    I --> J[Return Payment Info]
```

#### Recommendation Service Logic

```mermaid
flowchart TD
    A[Receive Request] --> B[Extract Parameters]
    B --> C[Call Parking Service]
    C --> D[Get All Parkings]
    D --> E[For Each Parking]
    E --> F[Calculate Distance]
    F --> G[Haversine Formula]
    G --> H[Calculate Score]
    H --> I[Distance Score 40%]
    I --> J[Availability Score 30%]
    J --> K[Price Score 30%]
    K --> L[Apply Filters]
    L --> M{Max Distance?}
    M -->|Yes| N[Filter by Distance]
    M -->|No| O{Min Slots?}
    N --> O
    O -->|Yes| P[Filter by Slots]
    O -->|No| Q{Max Price?}
    P --> Q
    Q -->|Yes| R[Filter by Price]
    Q -->|No| S[Sort Results]
    R --> S
    S --> T{Sort By?}
    T -->|Distance| U[Sort by Distance]
    T -->|Price| V[Sort by Price]
    T -->|Availability| W[Sort by Slots]
    T -->|Score| X[Sort by Score]
    U --> Y[Return Top 10]
    V --> Y
    W --> Y
    X --> Y
```

---

## Part 4 — Design Patterns Applied

### 4.1 Architectural Patterns

| Pattern | Implementation | Benefits |
|---------|---------------|----------|
| **Microservices** | 6 independent services (Auth, Parking, Reservation, Recommendation, Payment, Gateway) | Scalability, independent deployment, technology diversity |
| **API Gateway** | Single entry point routing to services | Simplified client, centralized auth, request aggregation |
| **Database per Service** | Each service has own SQLite database | Data isolation, loose coupling, independent schema evolution |
| **Saga Pattern** | Booking flow with compensating transactions | Distributed transaction management, eventual consistency |

### 4.2 Design Patterns

| Pattern | Implementation | Location |
|---------|---------------|----------|
| **Repository Pattern** | SQLAlchemy ORM abstracts database access | All services with databases |
| **Service Layer Pattern** | Business logic separated from API routes | `services/` directories |
| **DTO Pattern** | Pydantic schemas for data transfer | `schemas.py` files |
| **Factory Pattern** | Database session creation | `get_db()` dependency |
| **Strategy Pattern** | Multiple sorting strategies in recommendations | Recommendation Service |
| **Facade Pattern** | Gateway simplifies service interactions | API Gateway |

### 4.3 Security Patterns

| Pattern | Implementation | Purpose |
|---------|---------------|---------|
| **JWT Authentication** | Token-based stateless auth | Scalable authentication |
| **Password Hashing** | bcrypt for password storage | Secure credential storage |
| **Bearer Token** | Authorization header | Standard auth mechanism |
| **Token Validation** | Gateway validates before routing | Centralized security |

---

## Part 5 — Data Model

### 5.1 Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ VEHICLE : owns
    USER ||--o{ PAYMENT_METHOD : has
    USER ||--o{ FAVORITE_PARKING : saves
    USER ||--o{ RESERVATION : makes
    
    PARKING ||--o{ SEAT : contains
    PARKING ||--o{ RESERVATION : receives
    PARKING ||--o{ FAVORITE_PARKING : featured_in
    
    SEAT ||--o{ SEAT_RESERVATION : has
    
    RESERVATION }o--|| PARKING : for
    RESERVATION }o--|| USER : by
    
    USER {
        int id PK
        string email UK
        string password_hash
        string full_name
        string phone
        string avatar_url
        datetime created_at
    }
    
    VEHICLE {
        int id PK
        int user_id FK
        string license_plate UK
        string vehicle_type
        string brand
        string model
        string color
        boolean is_default
        datetime created_at
    }
    
    PAYMENT_METHOD {
        int id PK
        int user_id FK
        string method_type
        string card_number
        string card_holder
        string expiry_date
        boolean is_default
        datetime created_at
    }
    
    FAVORITE_PARKING {
        int id PK
        int user_id FK
        int parking_id FK
        string nickname
        datetime created_at
    }
    
    PARKING {
        int id PK
        string name
        string address
        float latitude
        float longitude
        int total_slots
        int available_slots
        float rate_per_hour
    }
    
    SEAT {
        int id PK
        int parking_id FK
        int row
        int col
        string seat_type
        string status
        float price_per_hour
    }
    
    SEAT_RESERVATION {
        int id PK
        int seat_id FK
        int user_id
        datetime start_time
        datetime end_time
        string status
        datetime created_at
    }
    
    RESERVATION {
        int id PK
        int user_id FK
        int parking_id FK
        string seat_number
        datetime check_in_time
        datetime check_out_time
        string status
        datetime checked_in_at
        datetime checked_out_at
        datetime created_at
    }
```

### 5.2 Database Distribution

**Auth Service Database (auth.db):**
- users
- vehicles
- payment_methods
- favorite_parkings

**Parking Service Database (parking.db):**
- parkings
- seats
- seat_reservations

**Reservation Service Database (reservation.db):**
- reservations

---

## Part 6 — Quality Attributes

### 6.1 Performance Metrics

| Metric | Target | Current Implementation |
|--------|--------|----------------------|
| API Response Time | < 2s | Achieved through efficient queries |
| Database Query Time | < 500ms | SQLite with indexed columns |
| Concurrent Users | 100+ | Async FastAPI with Uvicorn |
| Recommendation Calculation | < 1s | Optimized Haversine algorithm |

### 6.2 Reliability Measures

| Measure | Implementation |
|---------|---------------|
| Health Checks | All services expose `/health` endpoint |
| Error Handling | Try-catch blocks with proper HTTP status codes |
| Data Validation | Pydantic schemas validate all inputs |
| Transaction Management | Database transactions with rollback |
| Compensating Transactions | Seat release on cancel/checkout |

### 6.3 Security Measures

| Measure | Implementation |
|---------|---------------|
| Authentication | JWT tokens with HS256 algorithm |
| Password Security | bcrypt hashing with salt |
| Authorization | User ID extracted from JWT |
| Input Validation | Pydantic schemas prevent injection |
| CORS | Configured for frontend domain |

---

## Part 7 — Testing Strategy (Future Implementation)

### 7.1 Unit Testing
- Test individual service methods
- Mock external dependencies
- Coverage target: 80%

### 7.2 Integration Testing
- Test service-to-service communication
- Test database operations
- Test API endpoints

### 7.3 End-to-End Testing
- Test complete user flows
- Test booking process
- Test payment flow

### 7.4 Performance Testing
- Load testing with 100+ concurrent users
- Stress testing for peak loads
- Response time monitoring

---

*Last Updated: 2024*
*Analysis Version: 1.0*
