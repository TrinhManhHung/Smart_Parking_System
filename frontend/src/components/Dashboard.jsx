import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { parkingAPI, reservationAPI, userAPI, paymentAPI } from '../api/api'
import '../styles/Dashboard.css'

function Dashboard() {
  const [parkings, setParkings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [quickBookData, setQuickBookData] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchParkings()
    fetchPaymentMethods()
  }, [])

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

  const fetchParkings = async () => {
    try {
      const response = await parkingAPI.getAllParkings()
      setParkings(response.data)
    } catch (error) {
      console.error('Error fetching parkings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookSeats = (parkingId) => {
    navigate(`/parking/${parkingId}/seats`)
  }

  const handleReserve = async (parkingId) => {
    if (paymentMethods.length === 0) {
      alert('⚠️ Please add a payment method in your profile first')
      navigate('/profile')
      return
    }

    try {
      // Create quick book reservation
      const response = await reservationAPI.quickBook(parkingId)
      const reservation = response.data
      
      // Calculate payment
      const paymentRes = await paymentAPI.calculatePayment({
        parking_id: parkingId,
        check_in_time: reservation.check_in_time,
        check_out_time: reservation.check_out_time
      })

      // Store data for payment modal
      setQuickBookData({
        reservation: reservation,
        payment: paymentRes.data,
        parkingId: parkingId
      })
      
      setShowPaymentModal(true)
    } catch (error) {
      console.error('Quick book error:', error)
      alert(`Failed to create reservation: ${error.response?.data?.detail || error.message}`)
    }
  }

  const confirmQuickBookPayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method')
      return
    }

    setBookingLoading(true)
    
    try {
      const paymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod)
      
      alert(`✅ Quick Booking & Payment Successful!\n\nSeat: ${quickBookData.reservation.seat_number}\nAmount Paid: $${quickBookData.payment.total_cost}\nPayment Method: ${paymentMethod?.card_type} •••• ${paymentMethod?.last_four_digits}\n\nReserved for 2 hours`)
      
      setShowPaymentModal(false)
      fetchParkings()
    } catch (error) {
      alert('Payment failed: ' + error.message)
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

  const handleAddToFavorites = async (parkingId) => {
    try {
      await userAPI.addFavorite({ parking_id: parkingId })
      alert('Added to favorites!')
    } catch (error) {
      if (error.response?.data?.detail?.includes('already in favorites')) {
        alert('This parking is already in your favorites')
      } else {
        alert('Failed to add to favorites')
      }
    }
  }

  const filteredParkings = parkings.filter(parking =>
    parking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parking.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading parking lots...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🚗 Available Parking Lots</h1>
        <p className="dashboard-subtitle">Find and reserve your perfect parking spot</p>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="parking-grid">
        {filteredParkings.length === 0 ? (
          <div className="no-results">
            <p>No parking lots found</p>
          </div>
        ) : (
          filteredParkings.map(parking => (
            <div key={parking.id} className="parking-card">
              <div className="parking-header">
                <h3>{parking.name}</h3>
                <div className="availability-badge">
                  {parking.available_slots > 0 ? (
                    <span className="available">{parking.available_slots} spots</span>
                  ) : (
                    <span className="full">Full</span>
                  )}
                </div>
              </div>
              
              <div className="parking-info">
                <p><span className="icon">📍</span> {parking.address}</p>
                <p><span className="icon">🚗</span> {parking.available_slots} / {parking.total_slots} spots</p>
                <p><span className="icon">💰</span> ${parking.rate_per_hour}/hour</p>
              </div>
              
              <div className="button-group">
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleBookSeats(parking.id)}
                  disabled={parking.available_slots === 0}
                >
                  {parking.available_slots === 0 ? 'No Spots Available' : 'View Details'}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleReserve(parking.id)}
                  disabled={parking.available_slots === 0}
                >
                  Quick Book
                </button>
                <button 
                  className="btn btn-favorite" 
                  onClick={() => handleAddToFavorites(parking.id)}
                  title="Add to favorites"
                >
                  ⭐
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Method Selection Modal */}
      {showPaymentModal && quickBookData && (
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
              <div className="checkout-summary">
                <h3>Quick Booking Summary</h3>
                <div className="summary-row">
                  <span>Seat:</span>
                  <span><strong>{quickBookData.reservation.seat_number}</strong></span>
                </div>
                <div className="summary-row">
                  <span>Duration:</span>
                  <span>{quickBookData.payment.duration_minutes} minutes (2 hours)</span>
                </div>
                <div className="summary-row">
                  <span>Rate:</span>
                  <span>${quickBookData.payment.rate_per_hour}/hour</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>${quickBookData.payment.total_cost}</span>
                </div>
              </div>

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
                onClick={confirmQuickBookPayment}
                disabled={bookingLoading || !selectedPaymentMethod}
              >
                {bookingLoading ? 'Processing...' : `Pay $${quickBookData.payment.total_cost}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard