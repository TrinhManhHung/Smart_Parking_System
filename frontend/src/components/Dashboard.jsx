import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { parkingAPI, reservationAPI } from '../api/api'
import '../styles/Dashboard.css'

function Dashboard() {
  const [parkings, setParkings] = useState([])
  const [loading, setLoading] = useState(true)
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

  if (loading) return <div>Loading...</div>

  return (
    <div className="dashboard">
      <h1>🚗 Available Parking Lots</h1>
      <div className="parking-grid">
        {parkings.map(parking => (
          <div key={parking.id} className="parking-card">
            <div className="parking-header">
              <h3>{parking.name}</h3>
              <div className="availability-badge">
                {parking.available_slots > 0 ? (
                  <span className="available">{parking.available_slots} spots available</span>
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
                {parking.available_slots === 0 ? 'No Spots Available' : 'Reserve Parking'}
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
        ))}
      </div>
    </div>
  )
}

export default Dashboard