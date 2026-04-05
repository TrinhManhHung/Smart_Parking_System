import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { parkingAPI, paymentAPI, reservationAPI, userAPI } from '../api/api'
import '../styles/SeatBooking.css'

function SeatBooking() {
  const { parkingId } = useParams()
  const navigate = useNavigate()
  const [seats, setSeats] = useState([])
  const [parking, setParking] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [bookedSeats, setBookedSeats] = useState([])
  const [duration, setDuration] = useState(1)
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    fetchParkingAndSeats()
    fetchPaymentMethods()
  }, [parkingId, startTime, duration])

  const fetchPaymentMethods = async () => {
    try {
      const response = await userAPI.getPaymentMethods()
      setPaymentMethods(response.data)
      const defaultMethod = response.data.find(pm => pm.is_default)
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id)
      } else if (response.data.length > 0) {
        setSelectedPaymentMethod(response.data[0].id)
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  const fetchParkingAndSeats = async () => {
    try {
      const parkingRes = await parkingAPI.getParkingById(parkingId)
      setParking(parkingRes.data)
      
      // Get booked seats
      const bookedRes = await reservationAPI.getBookedSeats(parkingId)
      setBookedSeats(bookedRes.data.booked_seats || [])
      
      // Tính toán thời gian kết thúc
      const checkInTime = new Date(startTime)
      const checkOutTime = new Date(checkInTime.getTime() + duration * 3600000)
      
      // Lấy danh sách chỗ ngồi với kiểm tra tính khả dụng theo thời gian
      const seatsRes = await parkingAPI.getParkingSeats(
        parkingId, 
        checkInTime.toISOString(), 
        checkOutTime.toISOString()
      )
      setSeats(seatsRes.data)
    } catch (err) {
      setError('Failed to load parking and seats')
    } finally {
      setLoading(false)
    }
  }

  const toggleSeat = (seat) => {
    if (seat.status === 'booked') return
    
    const isSelected = selectedSeats.some(s => s.id === seat.id)
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id))
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  const calculateTotal = () => {
    return selectedSeats.reduce((sum, seat) => sum + (seat.price_per_hour * duration), 0)
  }

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one parking spot')
      return
    }

    if (paymentMethods.length === 0) {
      setError('Please add a payment method in your profile first')
      return
    }

    // Calculate payment info
    const checkInTime = new Date(startTime)
    const checkOutTime = new Date(checkInTime.getTime() + duration * 3600000)
    
    try {
      const paymentRes = await paymentAPI.calculatePayment({
        parking_id: parseInt(parkingId),
        check_in_time: checkInTime.toISOString(),
        check_out_time: checkOutTime.toISOString()
      })
      setPaymentInfo(paymentRes.data)
      setShowPaymentModal(true)
    } catch (err) {
      console.error('Payment calculation error:', err)
      setError('Failed to calculate payment')
    }
  }

  const confirmBookingAndPayment = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method')
      return
    }

    setBookingLoading(true)
    setError('')

    try {
      const checkInTime = new Date(startTime)
      const checkOutTime = new Date(checkInTime.getTime() + duration * 3600000)

      // Book seats
      for (const seat of selectedSeats) {
        await parkingAPI.bookSeatWithTime(
          seat.id, 
          checkInTime.toISOString(), 
          checkOutTime.toISOString(),
          1
        )
      }

      // Get seat number
      const firstSeat = selectedSeats[0]
      const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F']
      const rowLetter = rowLetters[firstSeat.row - 1] || 'A'
      const seatNumber = `${rowLetter}-${String(firstSeat.col).padStart(2, '0')}`

      // Create reservation
      await reservationAPI.createReservation({
        parking_id: parseInt(parkingId),
        check_in_time: checkInTime.toISOString(),
        check_out_time: checkOutTime.toISOString(),
        seat_number: seatNumber
      })

      const paymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod)
      alert(`✅ Booking & Payment Successful!\n\nSeat: ${seatNumber}\nAmount Paid: $${paymentInfo.total_cost}\nPayment Method: ${paymentMethod?.card_type} •••• ${paymentMethod?.last_four_digits}`)
      
      navigate('/reservations')
    } catch (err) {
      console.error('Booking error:', err)
      setError('Booking failed: ' + (err.response?.data?.detail || err.message))
    } finally {
      setBookingLoading(false)
    }
  }

  const getPaymentMethodIcon = (cardType) => {
    const icons = {
      'Visa': '💳',
      'Mastercard': '💳',
      'American Express': '💳',
      'Discover': '💳',
      'PayPal': '💰',
      'Apple Pay': '🍎',
      'Google Pay': '🔵',
      'CASH': '💵',
      'CREDIT CARD': '💳'
    }
    return icons[cardType] || '💳'
  }

  if (loading) return <div>Loading...</div>
  if (!parking) return <div>Parking not found</div>

  return (
    <div className="seat-booking">
      <h1>{parking.name} - Select Parking Spots</h1>
      
      {error && <div className="error">{error}</div>}

      <div className="booking-container">
        <div className="seat-grid-section">
          <div className="legend">
            <div><span className="seat available"></span> Available</div>
            <div><span className="seat selected"></span> Selected</div>
            <div><span className="seat booked"></span> Booked</div>
          </div>

          <div className="seat-grid">
            <div className="parking-lot-header">
              <h3>🚗 Parking Layout</h3>
              <p>Select your preferred parking spots</p>
            </div>
            {[...Array(5)].map((_, row) => {
              const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F']
              const rowLetter = rowLetters[row] || 'A'
              
              return (
                <div key={row} className="seat-row">
                  <div className="row-label">Row {rowLetter}</div>
                  {[...Array(8)].map((_, col) => {
                    // Format: A-01, B-02, etc.
                    const seatNumber = `${rowLetter}-${String(col + 1).padStart(2, '0')}`
                    const isBooked = bookedSeats.includes(seatNumber)
                    const seat = seats.find(s => s.row === row + 1 && s.col === col + 1)
                    if (!seat) return <div key={col} className="empty-spot"></div>
                    
                    const isSelected = selectedSeats.some(s => s.id === seat.id)
                    const seatClass = `seat ${isBooked ? 'booked' : seat.status} ${isSelected ? 'selected' : ''}`
                    
                    return (
                      <button
                        key={col}
                        className={seatClass}
                        onClick={() => toggleSeat(seat)}
                        disabled={isBooked || seat.status === 'booked'}
                        title={`${seatNumber} - ${isBooked ? 'Booked' : seat.price_per_hour + '/hr'}`}
                      >
                        <div className="seat-number">{seatNumber}</div>
                        <div className="seat-price">${seat.price_per_hour}/h</div>
                      </button>
                    )
                  })}
                  <div className="row-label">Row {rowLetter}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="booking-summary">
          <h3>Booking Summary</h3>
          
          <div className="datetime-selector">
            <label>Start Time:</label>
            <input 
              type="datetime-local" 
              value={startTime} 
              onChange={(e) => setStartTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="duration-selector">
            <label>Duration (hours):</label>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              <option value={0.5}>30 minutes</option>
              <option value={1}>1 hour</option>
              <option value={2}>2 hours</option>
              <option value={4}>4 hours</option>
              <option value={8}>Full day (8 hours)</option>
            </select>
          </div>

          <div className="selected-seats">
            <div className="selected-seats-header">
              <h4>Selected Spots ({selectedSeats.length}):</h4>
              {selectedSeats.length > 0 && (
                <button 
                  className="clear-all-btn"
                  onClick={() => setSelectedSeats([])}
                  title="Clear all selected spots"
                >
                  Clear All
                </button>
              )}
            </div>
            <ul>
              {selectedSeats.length === 0 ? (
                <li className="no-seats-selected">
                  <span>No parking spots selected</span>
                  <span className="hint">👆 Click on available spots above</span>
                </li>
              ) : (
                selectedSeats.map(seat => {
                  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F']
                  const rowLetter = rowLetters[seat.row - 1] || 'A'
                  const seatNumber = `${rowLetter}-${String(seat.col).padStart(2, '0')}`
                  
                  return (
                    <li key={seat.id}>
                      <div className="seat-info">
                        <span>{seatNumber} - ${(seat.price_per_hour * duration).toFixed(2)}</span>
                        <button 
                          className="remove-seat-btn"
                          onClick={() => toggleSeat(seat)}
                          title="Remove this spot"
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  )
                })
              )}
            </ul>
          </div>

          <div className="booking-time-info">
            <p><strong>Start:</strong> {new Date(startTime).toLocaleString()}</p>
            <p><strong>Duration:</strong> {duration} hour(s)</p>
            <p><strong>End:</strong> {new Date(new Date(startTime).getTime() + duration * 3600000).toLocaleString()}</p>
          </div>

          <div className="price-breakdown">
            <div className="price-line">
              <span>Subtotal:</span>
              <span>${selectedSeats.reduce((sum, s) => sum + s.price_per_hour * duration, 0).toFixed(2)}</span>
            </div>
            <div className="price-line total">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <button 
            className="btn-book" 
            onClick={handleBooking}
            disabled={selectedSeats.length === 0}
          >
            Book & Pay (${calculateTotal().toFixed(2)})
          </button>
        </div>
      </div>

      {/* Payment Method Selection Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => !bookingLoading && setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💳 Complete Payment</h2>
              <button 
                className="modal-close"
                onClick={() => setShowPaymentModal(false)}
                disabled={bookingLoading}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {paymentInfo && (
                <div className="checkout-summary">
                  <h3>Payment Summary</h3>
                  <div className="summary-row">
                    <span>Parking:</span>
                    <span>{parking?.name}</span>
                  </div>
                  <div className="summary-row">
                    <span>Duration:</span>
                    <span>{paymentInfo.duration_minutes} minutes ({duration} hour{duration > 1 ? 's' : ''})</span>
                  </div>
                  <div className="summary-row">
                    <span>Rate:</span>
                    <span>${paymentInfo.rate_per_hour}/hour</span>
                  </div>
                  <div className="summary-row">
                    <span>Seats:</span>
                    <span>{selectedSeats.length} spot{selectedSeats.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount:</span>
                    <span>${paymentInfo.total_cost}</span>
                  </div>
                </div>
              )}

              <div className="payment-methods-list">
                <h3>Choose Payment Method</h3>
                {paymentMethods.length === 0 ? (
                  <div className="no-payment-methods">
                    <p>No payment methods available</p>
                    <p className="hint">Please add a payment method in your profile</p>
                  </div>
                ) : (
                  paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`payment-method-item ${selectedPaymentMethod === method.id ? 'selected' : ''}`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <div className="payment-method-radio">
                        <input
                          type="radio"
                          name="payment-method"
                          checked={selectedPaymentMethod === method.id}
                          onChange={() => setSelectedPaymentMethod(method.id)}
                        />
                      </div>
                      <div className="payment-method-info">
                        <div className="payment-method-header">
                          <span className="payment-icon">{getPaymentMethodIcon(method.card_type)}</span>
                          <span className="payment-type">{method.card_type}</span>
                          {method.is_default && (
                            <span className="default-badge">Default</span>
                          )}
                        </div>
                        <div className="payment-method-details">
                          <span>•••• •••• •••• {method.last_four_digits}</span>
                          {method.expiry_date && <span className="expiry">Exp: {method.expiry_date}</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowPaymentModal(false)}
                disabled={bookingLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmBookingAndPayment}
                disabled={bookingLoading || !selectedPaymentMethod}
              >
                {bookingLoading ? 'Processing...' : `Pay $${paymentInfo?.total_cost || '0.00'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SeatBooking
