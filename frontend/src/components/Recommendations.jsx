import React, { useState } from 'react'
import { recommendationAPI, reservationAPI } from '../api/api'

function Recommendations() {
  const [location, setLocation] = useState({ lat: '', lng: '' })
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    setLocation({
      ...location,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await recommendationAPI.getRecommendations(location.lat, location.lng)
      setRecommendations(response.data)
    } catch (error) {
      setError('Failed to fetch recommendations. Please try again.')
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReserve = async (parkingId) => {
    try {
      await reservationAPI.createReservation({ parking_id: parkingId })
      alert('Reservation created successfully!')
    } catch (error) {
      alert('Failed to create reservation')
    }
  }

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6)
          })
        },
        (error) => {
          setError('Unable to get your location. Please enter manually.')
        }
      )
    } else {
      setError('Geolocation is not supported by your browser.')
    }
  }

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <h1>🔍 Find Nearest Parking</h1>
        <p className="subtitle">Discover the best parking spots near you</p>
      </div>

      <div className="search-container">
        <form onSubmit={handleSearch} className="location-form">
          {error && <div className="error-message">⚠️ {error}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label>📍 Latitude</label>
              <input
                type="number"
                step="any"
                name="lat"
                value={location.lat}
                onChange={handleInputChange}
                placeholder="e.g., 40.7128"
                required
              />
            </div>
            <div className="form-group">
              <label>📍 Longitude</label>
              <input
                type="number"
                step="any"
                name="lng"
                value={location.lng}
                onChange={handleInputChange}
                placeholder="e.g., -74.0060"
                required
              />
            </div>
          </div>

          <div className="button-row">
            <button type="button" className="btn btn-secondary" onClick={useCurrentLocation}>
              📍 Use My Location
            </button>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? '🔄 Searching...' : '🔍 Find Parking'}
            </button>
          </div>
        </form>
      </div>

      {recommendations.length > 0 && (
        <div className="recommendations-results">
          <h2>🎯 Recommended Parking Lots ({recommendations.length})</h2>
          <div className="parking-grid">
            {recommendations.map((parking, index) => (
              <div key={parking.id} className="parking-card">
                <div className="parking-rank">#{index + 1}</div>
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
                  <p><span className="icon">📏</span> {parking.distance} km away</p>
                  <p><span className="icon">🚗</span> {parking.available_slots} / {parking.total_slots} spots</p>
                  <p><span className="icon">💰</span> ${parking.rate_per_hour}/hour</p>
                </div>
                
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleReserve(parking.id)}
                  disabled={parking.available_slots === 0}
                >
                  {parking.available_slots === 0 ? 'No Spots Available' : 'Reserve Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && recommendations.length === 0 && location.lat && location.lng && (
        <div className="no-results">
          <p>No parking lots found near this location.</p>
        </div>
      )}
    </div>
  )
}

export default Recommendations