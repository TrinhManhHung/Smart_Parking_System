import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import '../styles/Navigation.css'

function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.dispatchEvent(new Event('authChange'))
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="nav-logo">🅿️</span>
          <span className="nav-title">Smart Parking</span>
        </div>
        
        <ul className="nav-links">
          <li>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/recommendations" className={isActive('/recommendations') ? 'active' : ''}>
              Find Parking
            </Link>
          </li>
          <li>
            <Link to="/reservations" className={isActive('/reservations') ? 'active' : ''}>
              My Reservations
            </Link>
          </li>
          <li>
            <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
              Profile
            </Link>
          </li>
        </ul>

        <button className="btn btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navigation