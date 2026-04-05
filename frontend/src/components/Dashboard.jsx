import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { parkingAPI, reservationAPI, userAPI } from '../api/api'
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
      // Quick book: auto-set time to now + 2 hours
      const now = new Date()
      const checkInTime = new Date(now.getTime() + 5 * 60000) // 5 minutes from now
      const checkOutTime = new Date(checkInTime.getTime() + 2 * 60 * 60000) // 2 hours later
      
      const reservationData = { 
        parking_id: parkingId,
        check_in_time: checkInTime.toISOString(),
        check_out_time: checkOutTime.toISOString()
      }
      
      console.log('Quick book data:', reservationData)
      
      const response = await reservationAPI.createReservation(reservationData)
      console.log('Quick book response:', response)
      alert('Quick booking successful! Reserved for 2 hours.')
      fetchParkings()
    } catch (error) {
      console.error('Quick book error:', error)
      console.error('Error response:', error.response?.data)
      alert(`Failed to create reservation: ${error.response?.data?.detail || error.message}`)
    }
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
    </div>
  )
}

export default Dashboard