# Payment Service

Payment Processing and Calculation Service for Smart Parking System.

## 📋 Overview

The Payment Service handles all payment-related calculations and processing logic for the Smart Parking System. It provides comprehensive cost calculations including base fees, taxes, service charges, discounts, and final payment amounts with detailed breakdowns.

## 🚀 Features

- **Payment Calculations**
  - Base parking fee calculations
  - Duration-based pricing
  - Hourly rate applications
  - Minimum charge handling

- **Fee Management**
  - Service fee calculations
  - Tax computations (VAT)
  - Processing fee applications
  - Dynamic fee structures

- **Discount System**
  - Discount code validation
  - Percentage-based discounts
  - Member discount applications
  - Promotional pricing

- **Advanced Pricing**
  - Vehicle type-specific pricing
  - Time-based rate adjustments
  - Bulk discount calculations
  - Complex fee structures

## 🛠 Technology Stack

- **Framework**: FastAPI
- **Validation**: Pydantic models
- **Mathematics**: Decimal precision for financial calculations
- **Date/Time**: Python datetime for timestamp handling
- **Async Support**: Full async/await implementation

## 📁 Project Structure

```
payment-service/
├── routers/
│   └── payment.py           # API endpoints
├── services/
│   └── payment_service.py   # Business logic & calculations
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
   uvicorn main:app --host 0.0.0.0 --port 8005 --reload
   ```

3. **Access the service**:
   - API: http://localhost:8005
   - Documentation: http://localhost:8005/docs

### Docker Development

1. **Build the image**:
   ```bash
   docker build -t payment-service .
   ```

2. **Run the container**:
   ```bash
   docker run -p 8005:8005 payment-service
   ```

## 📚 API Documentation

### Base URL
- Local: `http://localhost:8005`
- Gateway: `http://localhost:8000`

### Authentication
No authentication required - internal service.

### Key Endpoints

#### Payment Processing
- `POST /payment/calculate` - Calculate payment amount
- `GET /health` - Service health status

For complete API documentation, see: [payment-service.yaml](../../docs/api-specs/payment-service.yaml)

## 💰 Payment Calculation Logic

### Base Calculation
```python
base_amount = duration_hours * rate_per_hour
```

### Fee Structure
1. **Base Amount**: Duration × Hourly Rate
2. **Service Fee**: 4% of base amount
3. **Tax (VAT)**: 10% of (base + service fee)
4. **Processing Fee**: Fixed 1,000 VND
5. **Discounts**: Applied to subtotal
6. **Final Amount**: Total after all calculations

### Minimum Charge
- Minimum billing period: 1 hour
- Partial hours rounded up to next hour
- Example: 1.5 hours → charged as 2 hours

## 📊 Request/Response Format

### Payment Calculation Request
```json
{
  "parking_id": 1,
  "duration_hours": 2.5,
  "rate_per_hour": 20000,
  "user_id": 1,
  "vehicle_type": "car",
  "discount_code": "FIRST_TIME_10",
  "is_member": false
}
```

### Payment Calculation Response
```json
{
  "parking_id": 1,
  "duration_hours": 2.5,
  "base_amount": 50000,
  "additional_fees": {
    "service_fee": 2000,
    "tax": 5200,
    "processing_fee": 1000
  },
  "discounts": {
    "discount_code": "FIRST_TIME_10",
    "discount_amount": 5000,
    "member_discount": 0
  },
  "total_before_discount": 58200,
  "total_discount": 5000,
  "final_amount": 53200,
  "currency": "VND",
  "calculation_time": "2024-01-01T12:00:00Z",
  "breakdown": {
    "rate_per_hour": 20000,
    "hours_charged": 2.5,
    "minimum_charge_hours": 1.0,
    "tax_rate": 10.0,
    "service_fee_rate": 4.0
  }
}
```

## 🧮 Calculation Examples

### Example 1: Standard Calculation
- **Duration**: 2.5 hours
- **Rate**: 20,000 VND/hour
- **Base**: 50,000 VND
- **Service Fee (4%)**: 2,000 VND
- **Tax (10%)**: 5,200 VND
- **Processing Fee**: 1,000 VND
- **Total**: 58,200 VND

### Example 2: With Discount
- **Subtotal**: 58,200 VND
- **Discount (10%)**: 5,820 VND
- **Final**: 52,380 VND

### Example 3: Minimum Charge
- **Duration**: 0.5 hours
- **Charged**: 1.0 hour (minimum)
- **Base**: 20,000 VND

## 🧪 Testing

### Manual Testing
Use the interactive API documentation at `/docs` endpoint.

### Example Requests

**Basic Calculation**:
```bash
curl -X POST "http://localhost:8005/payment/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "parking_id": 1,
    "duration_hours": 2.5,
    "rate_per_hour": 20000
  }'
```

**With Discount**:
```bash
curl -X POST "http://localhost:8005/payment/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "parking_id": 1,
    "duration_hours": 2.5,
    "rate_per_hour": 20000,
    "user_id": 1,
    "discount_code": "FIRST_TIME_10",
    "vehicle_type": "car"
  }'
```

**Member Pricing**:
```bash
curl -X POST "http://localhost:8005/payment/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "parking_id": 1,
    "duration_hours": 2.5,
    "rate_per_hour": 20000,
    "user_id": 1,
    "is_member": true
  }'
```

## 🔄 Integration

### Service Dependencies
- **Reservation Service**: Provides booking duration and parking details
- **Gateway**: Routes payment calculation requests
- **Future**: Payment gateway integration for actual processing

### Usage Pattern
```python
# Called by Reservation Service during check-out
payment_data = {
    "parking_id": reservation.parking_id,
    "duration_hours": actual_duration,
    "rate_per_hour": parking.rate_per_hour,
    "user_id": reservation.user_id
}

response = await client.post("/payment/calculate", json=payment_data)
cost_breakdown = response.json()
```

## 🚨 Error Handling

### Validation Errors
- **400 Bad Request**: Invalid duration (negative values)
- **400 Bad Request**: Invalid rate (zero or negative)
- **400 Bad Request**: Invalid parking_id
- **422 Unprocessable Entity**: Schema validation errors

### Error Response Format
```json
{
  "detail": "Duration must be positive"
}
```

## 💳 Discount System

### Supported Discount Types
1. **Percentage Discounts**: 10%, 15%, 20%
2. **Fixed Amount**: Specific VND amounts
3. **Member Discounts**: Premium member benefits
4. **First-time User**: New user promotions

### Discount Codes (Examples)
- `FIRST_TIME_10`: 10% off for new users
- `MEMBER_15`: 15% member discount
- `WEEKEND_20`: 20% weekend special
- `STUDENT_25`: 25% student discount

## ⚡ Performance Features

- **Fast Calculations**: Optimized mathematical operations
- **Decimal Precision**: Accurate financial calculations
- **Minimal Dependencies**: Lightweight service design
- **Async Support**: Non-blocking operations

## 🔧 Configuration

### Fee Rates (Configurable)
```python
SERVICE_FEE_RATE = 0.04  # 4%
TAX_RATE = 0.10          # 10% VAT
PROCESSING_FEE = 1000    # Fixed 1,000 VND
MINIMUM_HOURS = 1.0      # Minimum billing period
```

### Environment Variables
- `SERVICE_FEE_RATE`: Service fee percentage
- `TAX_RATE`: VAT tax rate
- `PROCESSING_FEE`: Fixed processing fee
- `CURRENCY`: Currency code (default: VND)

## 📊 Monitoring & Logging

### Key Metrics
- Average transaction amount
- Discount usage rates
- Fee collection totals
- Calculation accuracy

### Logging Events
- Payment calculations
- Discount applications
- Error conditions
- Performance metrics

## 🔐 Security Features

- **Input Validation**: Pydantic model validation
- **Precision Handling**: Decimal arithmetic for accuracy
- **Rate Limiting**: Prevent calculation abuse
- **Audit Trail**: Transaction logging

## 🧪 Test Cases

### Standard Test Scenarios
1. **Basic Calculation**: Standard duration and rate
2. **Minimum Charge**: Sub-hour durations
3. **Long Duration**: Multi-day parking
4. **Zero Duration**: Edge case handling
5. **Discount Application**: Various discount types
6. **Member Pricing**: Premium user benefits

### Edge Cases
- Negative duration (should error)
- Zero rate (should error)
- Very large amounts
- Multiple discount codes
- Invalid discount codes

## 🤝 Contributing

1. Maintain calculation accuracy
2. Follow financial precision standards
3. Update fee structures carefully
4. Test all calculation paths
5. Document formula changes

## 📞 Support

For issues related to payment calculations:

1. **Verify Input Data**: Check duration and rate values
2. **Review Calculations**: Manually verify math
3. **Check Discount Logic**: Validate discount applications
4. **Test Edge Cases**: Minimum charges, zero values
5. **Monitor Precision**: Ensure decimal accuracy

## 🔮 Future Enhancements

- **Payment Gateway Integration**: Actual payment processing
- **Dynamic Pricing**: Time-based rate adjustments
- **Loyalty Programs**: Points and rewards system
- **Multi-currency Support**: International payments
- **Advanced Discounts**: Complex promotional rules
- **Subscription Models**: Monthly/yearly parking passes
- **Corporate Accounts**: Business billing features
- **Refund Processing**: Cancellation and refund logic
- **Split Payments**: Multiple payment methods
- **Installment Plans**: Deferred payment options