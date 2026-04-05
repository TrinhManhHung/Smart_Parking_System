import React, { useState, useEffect } from 'react'
import { reservationAPI, paymentAPI, parkingAPI } from '../api/api'

function Reservations() {
  const [reservations, setReservations] = useState([])
  const [parkingDetails, setParkingDetails] = useState({})
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [paymentData, setPaymentData] = useState({
    parking_id: '',
    check_in_time: '',
    check_out_time: ''
  })
  const [paymentResult, setPaymentResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchReservations()
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchReservations, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchReservations = async () => {
    try {
      const response = await reservationAPI.getUserReservations()
      setReservations(response.data)
      
      // Fetch parking details for each reservation
      const parkingIds = [...new Set(response.data.map(r => r.parking_id))]
      const details = {}
      for (const id of parkingIds) {
        try {
          const parkingRes = await parkingAPI.getParkingById(id)
          details[id] = parkingRes.data
        } catch (err) {
          console.error(`Failed to fetch parking ${id}:`, err)
        }
      }
      setParkingDetails(details)
    } catch (error) {
      console.error('Error fetching reservations:', error)
      setError('Failed to load reservations')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (reservationId) => {
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      await reservationAPI.checkIn(reservationId)
      setSuccess('Checked in successfully!')
      await fetchReservations()
      setSelectedReservation(null)
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to check in')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async (reservationId) => {
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      await reservationAPI.checkOut(reservationId)
      setSuccess('Checked out successfully!')
      await fetchReservations()
      setSelectedReservation(null)
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to check out')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return
    }
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      await reservationAPI.cancelReservation(reservationId)
      setSuccess('Reservation cancelled successfully!')
      await fetchReservations()
      setSelectedReservation(null)
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to cancel reservation')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePaymentCalculation = async (e) => {
    e.preventDefault()
    setActionLoading(true)
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
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      reserved: { label: 'Reserved', class: 'status-reserved', icon: '📅' },
      checked_in: { label: 'Checked In', class: 'status-checked-in', icon: '✅' },
      completed: { label: 'Completed', class: 'status-completed', icon: '✓' }
    }
    const config = statusConfig[status] || statusConfig.reserved
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    )
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading reservations...</p>
      </div>
    )
  }

  return (
    <div className="reservations-page">
      <div className="reservations-header">
        <h1>🎫 My Reservations</h1>
        <p className="subtitle">Manage your parking reservations</p>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}
      {success && <div className="success-message">✅ {success}</div>}

      <div className="reservations-container">
        {/* Reservations List */}
        <div className="reservations-list-section">
          <h2>📋 Your Reservations ({reservations.length})</h2>
          
          {reservations.length === 0 ? (
            <div className="no-reservations">
              <p>You don't have any reservations yet.</p>
              <p className="hint">Book a parking spot from the Dashboard!</p>
            </div>
          ) : (
            <div className="reservations-list">
              {reservations.map((reservation) => {
                const parking = parkingDetails[reservation.parking_id]
                const isSelected = selectedReservation?.id === reservation.id
                const isCompleted = reservation.status === 'completed'
                
                return (
                  <div 
                    key={reservation.id} 
                    className={`reservation-item ${isSelected ? 'selected' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => !isCompleted && setSelectedReservation(reservation)}
                  >
                    <div className="reservation-header">
                      <div className="reservation-id">
                        <span className="label">ID:</span>
                        <span className="value">#{reservation.id}</span>
                      </div>
                      {getStatusBadge(reservation.status)}
                    </div>

                    <div className="reservation-details">
                      <h3>{parking?.name || `Parking #${reservation.parking_id}`}</h3>
                      {parking && (
                        <p className="parking-address">
                          <span className="icon">📍</span>
                          {parking.address}
                        </p>
                      )}
                      
                      <div className="time-info">
                        <div className="time-row">
                          <span className="icon">🕐</span>
                          <div>
                            <strong>Check-in:</strong> {formatDateTime(reservation.check_in_time)}
                          </div>
                        </div>
                        <div className="time-row">
                          <span className="icon">🕐</span>
                          <div>
                            <strong>Check-out:</strong> {formatDateTime(reservation.check_out_time)}
                          </div>
                        </div>
                      </div>

                      {reservation.checked_in_at && (
                        <p className="actual-time">
                          <span className="icon">✓</span>
                          Checked in at: {formatDateTime(reservation.checked_in_at)}
                        </p>
                      )}
                      {reservation.checked_out_at && (
                        <p className="actual-time">
                          <span className="icon">✓</span>
                          Checked out at: {formatDateTime(reservation.checked_out_at)}
                        </p>
                      )}
                    </div>

                    {!isCompleted && (
                      <div className="reservation-actions">
                        {reservation.status === 'reserved' && (
                          <>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCheckIn(reservation.id)
                              }}
                              disabled={actionLoading}
                            >
                              ✓ Check In
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCancel(reservation.id)
                              }}
                              disabled={actionLoading}
                            >
                              ✕ Cancel
                            </button>
                          </>
                        )}
                        {reservation.status === 'checked_in' && (
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCheckOut(reservation.id)
                            }}
                            disabled={actionLoading}
                          >
                            ✓ Check Out
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Payment Calculator */}
        <div className="payment-calculator-section">
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
              <button type="submit" className="btn" disabled={actionLoading}>
                {actionLoading ? 'Calculating...' : '💳 Calculate Payment'}
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
    </div>
  )
}

export default Reservations
