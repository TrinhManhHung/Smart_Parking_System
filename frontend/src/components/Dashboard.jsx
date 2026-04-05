import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { parkingAPI, reservationAPI } from '../api/api'
import '../styles/Dashboard.css'

function Dashboard() {
  const [parkings, setParkings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchParkings()
  }, [])

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
    try {
      await reservationAPI.createReservation({ parking_id: parkingId })
      alert('Reservation created successfully!')
      fetchParkings()
    } catch (error) {
      alert('Failed to create reservation')
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Dashboard