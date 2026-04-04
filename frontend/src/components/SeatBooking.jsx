import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { parkingAPI, paymentAPI, reservationAPI } from '../api/api'
import '../styles/SeatBooking.css'

function SeatBooking() {
  const { parkingId } = useParams()
  const navigate = useNavigate()
  const [seats, setSeats] = useState([])
  const [parking, setParking] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [duration, setDuration] = useState(1)
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchParkingAndSeats()
  }, [parkingId])

  const fetchParkingAndSeats = async () => {
    try {
      const parkingRes = await parkingAPI.getParkingById(parkingId)
      setParking(parkingRes.data)
      
      const seatsRes = await parkingAPI.getParkingSeats(parkingId)
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
      setError('Please select at least one seat')
      return
    }

    try {
      // Calculate check-in and check-out times
      const checkInTime = new Date(startTime)
      const checkOutTime = new Date(checkInTime.getTime() + duration * 3600000)
      
      // Calculate payment with proper datetime fields
      const paymentRes = await paymentAPI.calculatePayment({
        parking_id: parseInt(parkingId),
        check_in_time: checkInTime.toISOString(),
        check_out_time: checkOutTime.toISOString()
      })

      // Book seats
      for (const seat of selectedSeats) {
        await parkingAPI.bookSeat(seat.id)
      }

      // Create reservation
      const reservationRes = await reservationAPI.createReservation({
        parking_id: parseInt(parkingId),
        check_in_time: checkInTime.toISOString(),
        check_out_time: checkOutTime.toISOString()
      })

      alert(`Booking confirmed! Total: $${paymentRes.data.total_cost.toFixed(2)}`)
      navigate('/reservations')
    } catch (err) {
      console.error('Booking error:', err)
      setError('Booking failed: ' + (err.response?.data?.detail || err.message))
    }
  }

  if (loading) return <div>Loading...</div>
  if (!parking) return <div>Parking not found</div>

  return (
    <div className="seat-booking">
      <h1>{parking.name} - Select Seats</h1>
      
      {error && <div className="error">{error}</div>}

      <div className="booking-container">
        <div className="seat-grid-section">
          <div className="legend">
            <div><span className="seat available"></span> Available</div>
            <div><span className="seat selected"></span> Selected</div>
            <div><span className="seat booked"></span> Booked</div>
            <div><span className="seat vip"></span> VIP ($higher)</div>
          </div>

          <div className="seat-grid">
            {[...Array(5)].map((_, row) => (
              <div key={row} className="seat-row">
                {[...Array(8)].map((_, col) => {
                  const seat = seats.find(s => s.row === row + 1 && s.col === col + 1)
                  if (!seat) return <div key={col}></div>
                  
                  const isSelected = selectedSeats.some(s => s.id === seat.id)
                  const seatClass = `seat ${seat.status} ${seat.seat_type} ${isSelected ? 'selected' : ''}`
                  
                  return (
                    <button
                      key={col}
                      className={seatClass}
                      onClick={() => toggleSeat(seat)}
                      disabled={seat.status === 'booked'}
                      title={`Row ${seat.row}, Col ${seat.col} - $${seat.price_per_hour}/hr`}
                    >
                      {row + 1}-{col + 1}
                    </button>
                  )
                })}
              </div>
            ))}
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
            <h4>Selected Seats ({selectedSeats.length}):</h4>
            <ul>
              {selectedSeats.map(seat => (
                <li key={seat.id}>
                  Row {seat.row}, Col {seat.col} ({seat.seat_type}) - ${(seat.price_per_hour * duration).toFixed(2)}
                </li>
              ))}
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
    </div>
  )
}

export default SeatBooking
