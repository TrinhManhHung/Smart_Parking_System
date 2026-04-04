import React, { useState } from 'react'
import { reservationAPI, paymentAPI } from '../api/api'

function Reservations() {
  const [reservationId, setReservationId] = useState('')
  const [paymentData, setPaymentData] = useState({
    parking_id: '',
    check_in_time: '',
    check_out_time: ''
  })
  const [paymentResult, setPaymentResult] = useState(null)

  const handleCheckIn = async () => {
    try {
      await reservationAPI.checkIn(reservationId)
      alert('Checked in successfully!')
    } catch (error) {
      alert('Failed to check in')
    }
  }

  const handleCheckOut = async () => {
    try {
      await reservationAPI.checkOut(reservationId)
      alert('Checked out successfully!')
    } catch (error) {
      alert('Failed to check out')
    }
  }

  const handleCancel = async () => {
    try {
      await reservationAPI.cancelReservation(reservationId)
      alert('Reservation cancelled successfully!')
    } catch (error) {
      alert('Failed to cancel reservation')
    }
  }

  const handlePaymentCalculation = async (e) => {
    e.preventDefault()
    try {
      const response = await paymentAPI.calculatePayment({
        ...paymentData,
        check_in_time: new Date(paymentData.check_in_time).toISOString(),
        check_out_time: new Date(paymentData.check_out_time).toISOString()
      })
      setPaymentResult(response.data)
    } catch (error) {
      alert('Failed to calculate payment')
    }
  }

  return (
    <div>
      <h1>My Reservations</h1>
      
      <div className="form">
        <h2>Manage Reservation</h2>
        <div className="form-group">
          <label>Reservation ID:</label>
          <input
            type="number"
            value={reservationId}
            onChange={(e) => setReservationId(e.target.value)}
            placeholder="Enter reservation ID"
          />
        </div>
        <button className="btn" onClick={handleCheckIn}>Check In</button>
        <button className="btn" onClick={handleCheckOut}>Check Out</button>
        <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
      </div>

      <div className="form">
        <h2>Calculate Payment</h2>
        <form onSubmit={handlePaymentCalculation}>
          <div className="form-group">
            <label>Parking ID:</label>
            <input
              type="number"
              value={paymentData.parking_id}
              onChange={(e) => setPaymentData({...paymentData, parking_id: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Check-in Time:</label>
            <input
              type="datetime-local"
              value={paymentData.check_in_time}
              onChange={(e) => setPaymentData({...paymentData, check_in_time: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Check-out Time:</label>
            <input
              type="datetime-local"
              value={paymentData.check_out_time}
              onChange={(e) => setPaymentData({...paymentData, check_out_time: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn">Calculate Payment</button>
        </form>

        {paymentResult && (
          <div style={{marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px'}}>
            <h3>Payment Details</h3>
            <p><strong>Parking:</strong> {paymentResult.parking_name}</p>
            <p><strong>Duration:</strong> {paymentResult.duration_minutes} minutes</p>
            <p><strong>Rate:</strong> ${paymentResult.rate_per_hour}/hour</p>
            <p><strong>Total Cost:</strong> ${paymentResult.total_cost}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reservations