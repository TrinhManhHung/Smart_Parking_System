import React, { useState, useEffect } from 'react'
import { reservationAPI, paymentAPI, parkingAPI, userAPI } from '../api/api'

function Reservations() {
  const [reservations, setReservations] = useState([])
  const [parkingDetails, setParkingDetails] = useState({})
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [checkoutReservation, setCheckoutReservation] = useState(null)

  useEffect(() => {
    fetchReservations()
    fetchPaymentMethods()
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchReservations, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedReservation) {
      calculatePayment(selectedReservation)
    } else {
      setPaymentInfo(null)
    }
  }, [selectedReservation])

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

  const fetchPaymentMethods = async () => {
    try {
      const response = await userAPI.getPaymentMethods()
      console.log('Payment methods fetched:', response.data)
      setPaymentMethods(response.data)
      // Set default payment method if available
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

  const calculatePayment = async (reservation) => {
    try {
      const response = await paymentAPI.calculatePayment({
        parking_id: reservation.parking_id,
        check_in_time: reservation.check_in_time,
        check_out_time: reservation.check_out_time
      })
      setPaymentInfo(response.data)
    } catch (error) {
      console.error('Failed to calculate payment:', error)
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
    console.log('handleCheckOut called with reservationId:', reservationId)
    console.log('Payment methods available:', paymentMethods)
    
    // Open payment method selection modal
    const reservation = reservations.find(r => r.id === reservationId)
    setCheckoutReservation(reservation)
    
    if (paymentMethods.length === 0) {
      setError('Please add a payment method in your profile first')
      return
    }
    
    // Calculate payment for checkout reservation
    try {
      const response = await paymentAPI.calculatePayment({
        parking_id: reservation.parking_id,
        check_in_time: reservation.check_in_time,
        check_out_time: reservation.check_out_time
      })
      console.log('Payment info calculated:', response.data)
      setPaymentInfo(response.data)
    } catch (error) {
      console.error('Failed to calculate payment:', error)
    }
    
    console.log('Opening payment modal')
    setShowPaymentModal(true)
  }

  const confirmCheckOut = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method')
      return
    }

    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      await reservationAPI.checkOut(checkoutReservation.id)
      setSuccess(`Checked out successfully! Payment processed via ${paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.card_type || 'selected method'}`)
      await fetchReservations()
      setSelectedReservation(null)
      setShowPaymentModal(false)
      setCheckoutReservation(null)
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

  const getPaymentMethodIcon = (cardType) => {
    const icons = {
      'Visa': '💳',
      'Mastercard': '💳',
      'American Express': '💳',
      'Discover': '💳',
      'PayPal': '💰',
      'Apple Pay': '🍎',
      'Google Pay': '🔵'
    }
    return icons[cardType] || '💳'
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

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMs = end - start
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    }
    return `${diffMinutes}m`
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
                      {reservation.seat_number && (
                        <p className="seat-number">
                          <span className="seat-icon">🅿️</span> Seat: <strong>{reservation.seat_number}</strong>
                        </p>
                      )}
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
                        <div className="time-row">
                          <span className="icon">⏱️</span>
                          <div>
                            <strong>Duration:</strong> {calculateDuration(reservation.check_in_time, reservation.check_out_time)}
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

        {/* Reservation Details & Payment */}
        <div className="reservation-details-section">
          {selectedReservation ? (
            <div className="reservation-card">
              <h2>💳 Reservation Details</h2>
              
              <div className="detail-section">
                <h3>Parking Information</h3>
                <div className="detail-row">
                  <span className="label">Parking:</span>
                  <span className="value">
                    {parkingDetails[selectedReservation.parking_id]?.name || `Parking #${selectedReservation.parking_id}`}
                  </span>
                </div>
                {selectedReservation.seat_number && (
                  <div className="detail-row">
                    <span className="label">Seat Number:</span>
                    <span className="value seat-highlight">
                      🅿️ {selectedReservation.seat_number}
                    </span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Address:</span>
                  <span className="value">
                    {parkingDetails[selectedReservation.parking_id]?.address || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Time Schedule</h3>
                <div className="detail-row">
                  <span className="label">Check-in:</span>
                  <span className="value">{formatDateTime(selectedReservation.check_in_time)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Check-out:</span>
                  <span className="value">{formatDateTime(selectedReservation.check_out_time)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Duration:</span>
                  <span className="value">
                    {calculateDuration(selectedReservation.check_in_time, selectedReservation.check_out_time)}
                  </span>
                </div>
              </div>

              {paymentInfo && (
                <div className="payment-result">
                  <h3>💰 Payment Information</h3>
                  <div className="payment-info">
                    <div className="payment-row">
                      <span>Rate:</span>
                      <span>${paymentInfo.rate_per_hour}/hour</span>
                    </div>
                    <div className="payment-row">
                      <span>Duration:</span>
                      <span>{paymentInfo.duration_minutes} minutes</span>
                    </div>
                    <div className="payment-row total">
                      <span>Estimated Total:</span>
                      <span>${paymentInfo.total_cost}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="detail-actions">
                {selectedReservation.status === 'reserved' && (
                  <>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleCheckIn(selectedReservation.id)}
                      disabled={actionLoading}
                    >
                      ✓ Check In Now
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleCancel(selectedReservation.id)}
                      disabled={actionLoading}
                    >
                      ✕ Cancel Reservation
                    </button>
                  </>
                )}
                {selectedReservation.status === 'checked_in' && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleCheckOut(selectedReservation.id)}
                    disabled={actionLoading}
                  >
                    ✓ Check Out & Pay
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="reservation-card empty-state">
              <div className="empty-state-content">
                <span className="empty-icon">👈</span>
                <h3>Select a Reservation</h3>
                <p>Click on a reservation from the list to view details and payment information</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Method Selection Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💳 Select Payment Method</h2>
              <button 
                className="modal-close"
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {paymentInfo && (
                <div className="checkout-summary">
                  <h3>Payment Summary</h3>
                  <div className="summary-row">
                    <span>Duration:</span>
                    <span>{paymentInfo.duration_minutes} minutes</span>
                  </div>
                  <div className="summary-row">
                    <span>Rate:</span>
                    <span>${paymentInfo.rate_per_hour}/hour</span>
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
                          <span className="expiry">Exp: {method.expiry_date}</span>
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
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmCheckOut}
                disabled={actionLoading || !selectedPaymentMethod}
              >
                {actionLoading ? 'Processing...' : `Pay $${paymentInfo?.total_cost || '0.00'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reservations
