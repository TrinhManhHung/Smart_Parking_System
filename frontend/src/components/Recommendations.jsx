import React, { useState } from 'react'
import { recommendationAPI, reservationAPI } from '../api/api'
import { useNavigate } from 'react-router-dom'

function Recommendations() {
  const navigate = useNavigate()
  const [location, setLocation] = useState({ lat: '', lng: '' })
  const [filters, setFilters] = useState({
    maxDistance: '',
    minAvailableSlots: '',
    maxPrice: '',
    sortBy: 'score'
  })
  const [showFilters, setShowFilters] = useState(false)
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

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const filterParams = {
        maxDistance: filters.maxDistance ? parseFloat(filters.maxDistance) : undefined,
        minAvailableSlots: filters.minAvailableSlots ? parseInt(filters.minAvailableSlots) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        sortBy: filters.sortBy
      }
      
      const response = await recommendationAPI.getRecommendations(
        location.lat, 
        location.lng,
        filterParams
      )
      setRecommendations(response.data)
      
      if (response.data.length === 0) {
        setError('No parking lots found matching your criteria. Try adjusting the filters.')
      }
    } catch (error) {
      setError('Failed to fetch recommendations. Please try again.')
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReserve = async (parkingId) => {
    navigate(`/parking/${parkingId}/seats`)
  }

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6)
          })
          setLoading(false)
        },
        (error) => {
          setError('Unable to get your location. Please enter manually.')
          setLoading(false)
        }
      )
    } else {
      setError('Geolocation is not supported by your browser.')
    }
  }

  const clearFilters = () => {
    setFilters({
      maxDistance: '',
      minAvailableSlots: '',
      maxPrice: '',
      sortBy: 'score'
    })
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#48bb78'
    if (score >= 60) return '#4299e1'
    if (score >= 40) return '#ed8936'
    return '#f56565'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <h1>🔍 Find Nearest Parking</h1>
        <p className="subtitle">Discover the best parking spots near you with smart recommendations</p>
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
            <button type="button" className="btn btn-secondary" onClick={useCurrentLocation} disabled={loading}>
              📍 Use My Location
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '🔼 Hide Filters' : '🔽 Show Filters'}
            </button>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? '🔄 Searching...' : '🔍 Find Parking'}
            </button>
          </div>

          {showFilters && (
            <div className="filters-section">
              <h3>🎯 Advanced Filters</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Max Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="maxDistance"
                    value={filters.maxDistance}
                    onChange={handleFilterChange}
                    placeholder="e.g., 5"
                  />
                </div>
                <div className="form-group">
                  <label>Min Available Slots</label>
                  <input
                    type="number"
                    name="minAvailableSlots"
                    value={filters.minAvailableSlots}
                    onChange={handleFilterChange}
                    placeholder="e.g., 5"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Max Price ($/hour)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="e.g., 10"
                  />
                </div>
                <div className="form-group">
                  <label>Sort By</label>
                  <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                  >
                    <option value="score">Best Match (Score)</option>
                    <option value="distance">Nearest First</option>
                    <option value="price">Cheapest First</option>
                    <option value="availability">Most Available</option>
                  </select>
                </div>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </form>
      </div>

      {recommendations.length > 0 && (
        <div className="recommendations-results">
          <h2>🎯 Recommended Parking Lots ({recommendations.length})</h2>
          <div className="parking-grid">
            {recommendations.map((parking, index) => (
              <div key={parking.id} className="parking-card">
                <div className="parking-rank">#{index + 1}</div>
                
                {parking.score !== undefined && (
                  <div 
                    className="parking-score"
                    style={{ background: getScoreColor(parking.score) }}
                  >
                    <div className="score-value">{parking.score}</div>
                    <div className="score-label">{getScoreLabel(parking.score)}</div>
                  </div>
                )}
                
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
                  <p><span className="icon">📏</span> <strong>{parking.distance} km</strong> away</p>
                  <p><span className="icon">🚗</span> {parking.available_slots} / {parking.total_slots} spots</p>
                  <p><span className="icon">💰</span> <strong>${parking.rate_per_hour}/hour</strong></p>
                </div>
                
                <div className="button-group">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleReserve(parking.id)}
                    disabled={parking.available_slots === 0}
                  >
                    {parking.available_slots === 0 ? 'No Spots Available' : 'View & Reserve'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && recommendations.length === 0 && location.lat && location.lng && (
        <div className="no-results">
          <p>🔍 No parking lots found near this location.</p>
          <p className="hint">Try adjusting your search location or filters.</p>
        </div>
      )}
    </div>
  )
}

export default Recommendations