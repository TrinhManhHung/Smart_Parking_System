import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { parkingAPI, reservationAPI } from '../api/api'

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
    <div>
      <h1>Parking Lots</h1>
      {parkings.map(parking => (
        <div key={parking.id} className="parking-card">
          <h3>{parking.name}</h3>
          <p><strong>Address:</strong> {parking.address}</p>
          <p><strong>Available Slots:</strong> {parking.available_slots} / {parking.total_slots}</p>
          <p><strong>Rate:</strong> ${parking.rate_per_hour}/hour</p>
          <div className="button-group">
            <button 
              className="btn btn-primary" 
              onClick={() => handleBookSeats(parking.id)}
            >
              Book Seats
            </button>
            <button 
              className="btn" 
              onClick={() => handleReserve(parking.id)}
              disabled={parking.available_slots === 0}
            >
              {parking.available_slots === 0 ? 'Full' : 'Quick Reserve'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Dashboard