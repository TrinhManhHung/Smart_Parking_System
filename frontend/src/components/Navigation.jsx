import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navigation() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
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