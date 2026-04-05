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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCheckIn = async () => {
    if (!reservationId) {
      setError('Please enter a reservation ID')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await reservationAPI.checkIn(reservationId)
      setSuccess('Checked in successfully!')
      setReservationId('')
    } catch (error) {
      setError('Failed to check in. Please verify your reservation ID.')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!reservationId) {
      setError('Please enter a reservation ID')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await reservationAPI.checkOut(reservationId)
      setSuccess('Checked out successfully!')
      setReservationId('')
    } catch (error) {
      setError('Failed to check out. Please verify your reservation ID.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!reservationId) {
      setError('Please enter a reservation ID')
      return
    }
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await reservationAPI.cancelReservation(reservationId)
      setSuccess('Reservation cancelled successfully!')
      setReservationId('')
    } catch (error) {
      setError('Failed to cancel reservation. Please verify your reservation ID.')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentCalculation = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPaymentResult(null)
    try {
      const response = await paymentAPI.calculatePayment({
        ...paymentData,
        parking_id: parseInt(paymentData.parking_id),
        check_in_time: new Date(paymentData.check_in_time).toISOString(),
        check_out_time: new Date(paymentData.check_out_time).toISOString()
      })
      setPaymentResult(response.data)
    } catch (error) {
      setError('Failed to calculate payment. Please check your input.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reservations-page">
      <div className="reservations-header">
        <h1>🎫 My Reservations</h1>
        <p className="subtitle">Manage your parking reservations and payments</p>
      </div>

      <div className="reservations-container">
        <div className="reservation-card">
          <h2>🚗 Manage Reservation</h2>
          
          {error && <div className="error-message">⚠️ {error}</div>}
          {success && <div className="success-message">✅ {success}</div>}
          
          <div className="form-group">
            <label>Reservation ID</label>
            <input
              type="number"
              value={reservationId}
              onChange={(e) => {
                setReservationId(e.target.value)
                setError('')
                setSuccess('')
              }}
              placeholder="Enter your reservation ID"
            />
          </div>
          
          <div className="button-group">
            <button className="btn btn-primary" onClick={handleCheckIn} disabled={loading}>
              ✓ Check In
            </button>
            <button className="btn btn-secondary" onClick={handleCheckOut} disabled={loading}>
              ✓ Check Out
            </button>
            <button className="btn btn-danger" onClick={handleCancel} disabled={loading}>
              ✕ Cancel
            </button>
          </div>
        </div>

        <div className="reservation-card">
          <h2>💰 Calculate Payment</h2>
          <form onSubmit={handlePaymentCalculation}>
            <div className="form-group">
              <label>Parking ID</label>
              <input
                type="number"
                value={paymentData.parking_id}
                onChange={(e) => setPaymentData({...paymentData, parking_id: e.target.value})}
                placeholder="Enter parking ID"
                required
              />
            </div>
            <div className="form-group">
              <label>Check-in Time</label>
              <input
                type="datetime-local"
                value={paymentData.check_in_time}
                onChange={(e) => setPaymentData({...paymentData, check_in_time: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Check-out Time</label>
              <input
                type="datetime-local"
                value={paymentData.check_out_time}
                onChange={(e) => setPaymentData({...paymentData, check_out_time: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Calculating...' : '💳 Calculate Payment'}
            </button>
          </form>

          {paymentResult && (
            <div className="payment-result">
              <h3>Payment Details</h3>
              <div className="payment-info">
                <div className="payment-row">
                  <span>Parking:</span>
                  <span>{paymentResult.parking_name}</span>
                </div>
                <div className="payment-row">
                  <span>Duration:</span>
                  <span>{paymentResult.duration_minutes} minutes</span>
                </div>
                <div className="payment-row">
                  <span>Rate:</span>
                  <span>${paymentResult.rate_per_hour}/hour</span>
                </div>
                <div className="payment-row total">
                  <span>Total Cost:</span>
                  <span>${paymentResult.total_cost}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reservations