import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Navigation.css'

function Navigation() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    // Dispatch custom event to notify App component
    window.dispatchEvent(new Event('authChange'))
    navigate('/login')
  }

  return (
    <nav className="nav">
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/recommendations">Find Parking</Link></li>
        <li><Link to="/reservations">My Reservations</Link></li>
        <li><button className="btn" onClick={handleLogout}>Logout</button></li>
      </ul>
    </nav>
  )
}

export default Navigation