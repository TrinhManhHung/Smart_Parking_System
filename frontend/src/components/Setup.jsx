import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../api/api'
import '../styles/Setup.css'

function Setup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Vehicle form
  const [vehicleForm, setVehicleForm] = useState({
    license_plate: '',
    vehicle_type: 'car',
    brand: '',
    model: '',
    color: '',
    is_default: true
  })

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    method_type: 'credit_card',
    card_number: '',
    card_holder: '',
    expiry_date: '',
    is_default: true
  })

  const handleVehicleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await userAPI.createVehicle(vehicleForm)
      setStep(2)
    } catch (err) {
      console.error('Vehicle creation error:', err)
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.')
        setTimeout(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('setupComplete')
          window.location.href = '/login'
        }, 2000)
      } else {
        setError(err.response?.data?.detail || 'Failed to add vehicle')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await userAPI.createPaymentMethod(paymentForm)
      // Mark setup as complete
      localStorage.setItem('setupComplete', 'true')
      // Reload page to update app state
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Payment method creation error:', err)
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.')
        setTimeout(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('setupComplete')
          window.location.href = '/login'
        }, 2000)
      } else {
        setError(err.response?.data?.detail || 'Failed to add payment method')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <h1>🚀 Welcome! Let's Get Started</h1>
          <p>Complete your profile to start using the parking system</p>
          <div className="progress-bar">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Vehicle Info</div>
            </div>
            <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Payment Info</div>
            </div>
          </div>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {/* Step 1: Vehicle Information */}
        {step === 1 && (
          <form onSubmit={handleVehicleSubmit} className="setup-form">
            <h2>🚗 Add Your Vehicle</h2>
            <p className="form-description">We need your vehicle information for parking reservations</p>

            <div className="form-group">
              <label>License Plate *</label>
              <input
                type="text"
                value={vehicleForm.license_plate}
                onChange={(e) => setVehicleForm({...vehicleForm, license_plate: e.target.value})}
                placeholder="e.g., ABC-1234"
                required
              />
            </div>

            <div className="form-group">
              <label>Vehicle Type *</label>
              <select
                value={vehicleForm.vehicle_type}
                onChange={(e) => setVehicleForm({...vehicleForm, vehicle_type: e.target.value})}
                required
              >
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="truck">Truck</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  value={vehicleForm.brand}
                  onChange={(e) => setVehicleForm({...vehicleForm, brand: e.target.value})}
                  placeholder="e.g., Toyota"
                />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                  placeholder="e.g., Camry"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                value={vehicleForm.color}
                onChange={(e) => setVehicleForm({...vehicleForm, color: e.target.value})}
                placeholder="e.g., Black"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Continue →'}
            </button>
          </form>
        )}

        {/* Step 2: Payment Information */}
        {step === 2 && (
          <form onSubmit={handlePaymentSubmit} className="setup-form">
            <h2>💳 Add Payment Method</h2>
            <p className="form-description">Add a payment method for easy checkout</p>

            <div className="form-group">
              <label>Payment Type *</label>
              <select
                value={paymentForm.method_type}
                onChange={(e) => setPaymentForm({...paymentForm, method_type: e.target.value})}
                required
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="e_wallet">E-Wallet</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            {(paymentForm.method_type === 'credit_card' || paymentForm.method_type === 'debit_card') && (
              <>
                <div className="form-group">
                  <label>Card Number *</label>
                  <input
                    type="text"
                    value={paymentForm.card_number}
                    onChange={(e) => setPaymentForm({...paymentForm, card_number: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Card Holder Name *</label>
                  <input
                    type="text"
                    value={paymentForm.card_holder}
                    onChange={(e) => setPaymentForm({...paymentForm, card_holder: e.target.value})}
                    placeholder="JOHN DOE"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="text"
                    value={paymentForm.expiry_date}
                    onChange={(e) => setPaymentForm({...paymentForm, expiry_date: e.target.value})}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>
              </>
            )}

            <div className="button-group">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ← Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Completing...' : 'Complete Setup ✓'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Setup
