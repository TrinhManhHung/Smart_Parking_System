import React, { useState } from 'react'
import { recommendationAPI, reservationAPI } from '../api/api'

function Recommendations() {
  const [location, setLocation] = useState({ lat: '', lng: '' })
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    setLocation({
      ...location,
      [e.target.name]: e.target.value
    })
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await recommendationAPI.getRecommendations(location.lat, location.lng)
      setRecommendations(response.data)
    } catch (error) {
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

  return (
    <div>
      <h1>Find Nearest Parking</h1>
      <form onSubmit={handleSearch} className="form">
        <div className="form-group">
          <label>Latitude:</label>
          <input
            type="number"
            step="any"
            name="lat"
            value={location.lat}
            onChange={handleInputChange}
            placeholder="40.7128"
            required
          />
        </div>
        <div className="form-group">
          <label>Longitude:</label>
          <input
            type="number"
            step="any"
            name="lng"
            value={location.lng}
            onChange={handleInputChange}
            placeholder="-74.0060"
            required
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Searching...' : 'Find Parking'}
        </button>
      </form>

      {recommendations.length > 0 && (
        <div>
          <h2>Recommended Parking Lots</h2>
          {recommendations.map(parking => (
            <div key={parking.id} className="parking-card">
              <h3>{parking.name}</h3>
              <p><strong>Address:</strong> {parking.address}</p>
              <p><strong>Distance:</strong> {parking.distance} km</p>
              <p><strong>Available Slots:</strong> {parking.available_slots} / {parking.total_slots}</p>
              <p><strong>Rate:</strong> ${parking.rate_per_hour}/hour</p>
              <button 
                className="btn" 
                onClick={() => handleReserve(parking.id)}
                disabled={parking.available_slots === 0}
              >
                {parking.available_slots === 0 ? 'Full' : 'Reserve'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Recommendations