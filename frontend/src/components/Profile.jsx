import React, { useState, useEffect } from 'react'
import { userAPI, parkingAPI } from '../api/api'
import '../styles/Profile.css'

function Profile() {
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [favorites, setFavorites] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [parkingDetails, setParkingDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Edit states
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [editingPayment, setEditingPayment] = useState(null)

  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: ''
  })
  const [vehicleForm, setVehicleForm] = useState({
    license_plate: '',
    vehicle_type: 'car',
    brand: '',
    model: '',
    color: '',
    is_default: false
  })
  const [paymentForm, setPaymentForm] = useState({
    method_type: 'credit_card',
    card_number: '',
    card_holder: '',
    expiry_date: '',
    is_default: false
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchProfile(),
        fetchVehicles(),
        fetchPaymentMethods(),
        fetchFavorites(),
        fetchStatistics()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile()
      setProfile(response.data)
      setProfileForm({
        full_name: response.data.full_name || '',
        phone: response.data.phone || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await userAPI.getVehicles()
      setVehicles(response.data)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const response = await userAPI.getPaymentMethods()
      setPaymentMethods(response.data)
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  const fetchFavorites = async () => {
    try {
      const response = await userAPI.getFavorites()
      setFavorites(response.data)
      
      // Fetch parking details for favorites
      const details = {}
      for (const fav of response.data) {
        try {
          const parkingRes = await parkingAPI.getParkingById(fav.parking_id)
          details[fav.parking_id] = parkingRes.data
        } catch (err) {
          console.error(`Failed to fetch parking ${fav.parking_id}:`, err)
        }
      }
      setParkingDetails(details)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await userAPI.getStatistics()
      setStatistics(response.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  // Profile handlers
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await userAPI.updateProfile(profileForm)
      setSuccess('Profile updated successfully!')
      await fetchProfile()
    } catch (error) {
      setError('Failed to update profile')
    }
  }

  // Vehicle handlers
  const handleAddVehicle = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await userAPI.createVehicle(vehicleForm)
      setSuccess('Vehicle added successfully!')
      setVehicleForm({
        license_plate: '',
        vehicle_type: 'car',
        brand: '',
        model: '',
        color: '',
        is_default: false
      })
      await fetchVehicles()
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to add vehicle')
    }
  }

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle.id)
    setVehicleForm({
      license_plate: vehicle.license_plate,
      vehicle_type: vehicle.vehicle_type,
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      color: vehicle.color || '',
      is_default: vehicle.is_default
    })
  }

  const handleUpdateVehicle = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await userAPI.updateVehicle(editingVehicle, vehicleForm)
      setSuccess('Vehicle updated successfully!')
      setEditingVehicle(null)
      setVehicleForm({
        license_plate: '',
        vehicle_type: 'car',
        brand: '',
        model: '',
        color: '',
        is_default: false
      })
      await fetchVehicles()
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to update vehicle')
    }
  }

  const handleCancelEditVehicle = () => {
    setEditingVehicle(null)
    setVehicleForm({
      license_plate: '',
      vehicle_type: 'car',
      brand: '',
      model: '',
      color: '',
      is_default: false
    })
  }

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return
    try {
      await userAPI.deleteVehicle(vehicleId)
      setSuccess('Vehicle deleted successfully!')
      await fetchVehicles()
    } catch (error) {
      setError('Failed to delete vehicle')
    }
  }

  // Payment method handlers
  const handleAddPaymentMethod = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await userAPI.createPaymentMethod(paymentForm)
      setSuccess('Payment method added successfully!')
      setPaymentForm({
        method_type: 'credit_card',
        card_number: '',
        card_holder: '',
        expiry_date: '',
        is_default: false
      })
      await fetchPaymentMethods()
    } catch (error) {
      setError('Failed to add payment method')
    }
  }

  const handleEditPayment = (payment) => {
    setEditingPayment(payment.id)
    setPaymentForm({
      method_type: payment.method_type,
      card_number: payment.card_number || '',
      card_holder: payment.card_holder || '',
      expiry_date: payment.expiry_date || '',
      is_default: payment.is_default
    })
  }

  const handleUpdatePayment = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await userAPI.updatePaymentMethod(editingPayment, paymentForm)
      setSuccess('Payment method updated successfully!')
      setEditingPayment(null)
      setPaymentForm({
        method_type: 'credit_card',
        card_number: '',
        card_holder: '',
        expiry_date: '',
        is_default: false
      })
      await fetchPaymentMethods()
    } catch (error) {
      setError('Failed to update payment method')
    }
  }

  const handleCancelEditPayment = () => {
    setEditingPayment(null)
    setPaymentForm({
      method_type: 'credit_card',
      card_number: '',
      card_holder: '',
      expiry_date: '',
      is_default: false
    })
  }

  const handleDeletePaymentMethod = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return
    try {
      await userAPI.deletePaymentMethod(paymentId)
      setSuccess('Payment method deleted successfully!')
      await fetchPaymentMethods()
    } catch (error) {
      setError('Failed to delete payment method')
    }
  }

  // Favorite handlers
  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await userAPI.removeFavorite(favoriteId)
      setSuccess('Removed from favorites!')
      await fetchFavorites()
    } catch (error) {
      setError('Failed to remove favorite')
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>👤 My Profile</h1>
        <p className="subtitle">Manage your account and preferences</p>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}
      {success && <div className="success-message">✅ {success}</div>}

      <div className="profile-container">
        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button 
            className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            📊 Statistics
          </button>
          <button 
            className={`tab ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => setActiveTab('vehicles')}
          >
            🚗 Vehicles
          </button>
          <button 
            className={`tab ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            💳 Payment
          </button>
          <button 
            className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            ⭐ Favorites
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Personal Information</h2>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={profile?.email || ''} disabled />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Update Profile
                </button>
              </form>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && statistics && (
            <div className="statistics-section">
              <h2>Your Parking Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🎫</div>
                  <div className="stat-value">{statistics.total_reservations}</div>
                  <div className="stat-label">Total Reservations</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-value">${statistics.total_spent}</div>
                  <div className="stat-label">Total Spent</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-value">{statistics.total_hours}h</div>
                  <div className="stat-label">Total Hours</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-value">{statistics.most_visited_count}</div>
                  <div className="stat-label">Most Visited</div>
                </div>
              </div>
              
              {statistics.favorite_parking_name && (
                <div className="favorite-parking-info">
                  <h3>Your Favorite Parking</h3>
                  <p>{statistics.favorite_parking_name}</p>
                  <p className="visit-count">Visited {statistics.most_visited_count} times</p>
                </div>
              )}

              <div className="status-breakdown">
                <h3>Reservations by Status</h3>
                <div className="status-bars">
                  <div className="status-bar">
                    <span className="status-label">Reserved</span>
                    <div className="bar-container">
                      <div 
                        className="bar reserved" 
                        style={{width: `${(statistics.reservations_by_status.reserved / statistics.total_reservations) * 100}%`}}
                      ></div>
                    </div>
                    <span className="status-count">{statistics.reservations_by_status.reserved}</span>
                  </div>
                  <div className="status-bar">
                    <span className="status-label">Checked In</span>
                    <div className="bar-container">
                      <div 
                        className="bar checked-in" 
                        style={{width: `${(statistics.reservations_by_status.checked_in / statistics.total_reservations) * 100}%`}}
                      ></div>
                    </div>
                    <span className="status-count">{statistics.reservations_by_status.checked_in}</span>
                  </div>
                  <div className="status-bar">
                    <span className="status-label">Completed</span>
                    <div className="bar-container">
                      <div 
                        className="bar completed" 
                        style={{width: `${(statistics.reservations_by_status.completed / statistics.total_reservations) * 100}%`}}
                      ></div>
                    </div>
                    <span className="status-count">{statistics.reservations_by_status.completed}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicles Tab */}
          {activeTab === 'vehicles' && (
            <div className="vehicles-section">
              <h2>My Vehicles</h2>
              
              <form onSubmit={editingVehicle ? handleUpdateVehicle : handleAddVehicle} className="add-form">
                <h3>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>License Plate *</label>
                    <input
                      type="text"
                      value={vehicleForm.license_plate}
                      onChange={(e) => setVehicleForm({...vehicleForm, license_plate: e.target.value})}
                      placeholder="e.g., ABC-1234"
                      required
                      disabled={editingVehicle !== null}
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
                  <div className="form-group">
                    <label>Color</label>
                    <input
                      type="text"
                      value={vehicleForm.color}
                      onChange={(e) => setVehicleForm({...vehicleForm, color: e.target.value})}
                      placeholder="e.g., Black"
                    />
                  </div>
                </div>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="vehicle-default"
                    checked={vehicleForm.is_default}
                    onChange={(e) => setVehicleForm({...vehicleForm, is_default: e.target.checked})}
                  />
                  <label htmlFor="vehicle-default">Set as default vehicle</label>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary">
                    {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                  </button>
                  {editingVehicle && (
                    <button type="button" className="btn btn-secondary" onClick={handleCancelEditVehicle}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="items-list">
                {vehicles.length === 0 ? (
                  <p className="no-items">No vehicles added yet</p>
                ) : (
                  vehicles.map(vehicle => (
                    <div key={vehicle.id} className="item-card">
                      <div className="item-icon">🚗</div>
                      <div className="item-details">
                        <h4>{vehicle.license_plate}</h4>
                        <p>{vehicle.brand} {vehicle.model} - {vehicle.color}</p>
                        <span className="item-type">{vehicle.vehicle_type}</span>
                        {vehicle.is_default && <span className="default-badge">Default</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-edit"
                          onClick={() => handleEditVehicle(vehicle)}
                          title="Edit vehicle"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payment' && (
            <div className="payment-section">
              <h2>Payment Methods</h2>
              
              <form onSubmit={editingPayment ? handleUpdatePayment : handleAddPaymentMethod} className="add-form">
                <h3>{editingPayment ? 'Edit Payment Method' : 'Add Payment Method'}</h3>
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
                    <div className="form-row">
                      <div className="form-group">
                        <label>Card Holder *</label>
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
                    </div>
                  </>
                )}
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="payment-default"
                    checked={paymentForm.is_default}
                    onChange={(e) => setPaymentForm({...paymentForm, is_default: e.target.checked})}
                  />
                  <label htmlFor="payment-default">Set as default payment method</label>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary">
                    {editingPayment ? 'Update Payment Method' : 'Add Payment Method'}
                  </button>
                  {editingPayment && (
                    <button type="button" className="btn btn-secondary" onClick={handleCancelEditPayment}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="items-list">
                {paymentMethods.length === 0 ? (
                  <p className="no-items">No payment methods added yet</p>
                ) : (
                  paymentMethods.map(payment => (
                    <div key={payment.id} className="item-card">
                      <div className="item-icon">💳</div>
                      <div className="item-details">
                        <h4>{payment.method_type.replace('_', ' ').toUpperCase()}</h4>
                        {payment.card_number && <p>{payment.card_number}</p>}
                        {payment.card_holder && <p>{payment.card_holder}</p>}
                        {payment.is_default && <span className="default-badge">Default</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-edit"
                          onClick={() => handleEditPayment(payment)}
                          title="Edit payment method"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeletePaymentMethod(payment.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="favorites-section">
              <h2>Favorite Parking Lots</h2>
              <div className="items-list">
                {favorites.length === 0 ? (
                  <p className="no-items">No favorite parking lots yet</p>
                ) : (
                  favorites.map(favorite => {
                    const parking = parkingDetails[favorite.parking_id]
                    return (
                      <div key={favorite.id} className="item-card favorite-card">
                        <div className="item-icon">⭐</div>
                        <div className="item-details">
                          <h4>{parking?.name || `Parking #${favorite.parking_id}`}</h4>
                          {parking && <p>📍 {parking.address}</p>}
                          {favorite.nickname && <span className="nickname">{favorite.nickname}</span>}
                        </div>
                        <button 
                          className="btn-delete"
                          onClick={() => handleRemoveFavorite(favorite.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
