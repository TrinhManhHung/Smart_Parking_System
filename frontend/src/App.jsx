import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Recommendations from './components/Recommendations'
import Reservations from './components/Reservations'
import SeatBooking from './components/SeatBooking'
import Profile from './components/Profile'
import Setup from './components/Setup'
import Navigation from './components/Navigation'
import { userAPI } from './api/api'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [setupComplete, setSetupComplete] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem('token'))
      setSetupComplete(null) // Reset setup check on auth change
    }

    window.addEventListener('authChange', handleAuthChange)
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange)
    }
  }, [])

  useEffect(() => {
    const checkSetupStatus = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      // Check localStorage first
      const localSetup = localStorage.getItem('setupComplete')
      if (localSetup === 'true') {
        setSetupComplete(true)
        setLoading(false)
        return
      }

      try {
        // Check if user has vehicles and payment methods
        const [vehiclesRes, paymentsRes] = await Promise.all([
          userAPI.getVehicles(),
          userAPI.getPaymentMethods()
        ])

        const hasVehicle = vehiclesRes.data.length > 0
        const hasPayment = paymentsRes.data.length > 0
        const isComplete = hasVehicle && hasPayment

        setSetupComplete(isComplete)
        if (isComplete) {
          localStorage.setItem('setupComplete', 'true')
        }
      } catch (error) {
        console.error('Error checking setup status:', error)
        setSetupComplete(false)
      } finally {
        setLoading(false)
      }
    }

    checkSetupStatus()
  }, [token])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  const ProtectedRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" />
    if (setupComplete === false) return <Navigate to="/setup" />
    return children
  }

  return (
    <Router>
      <div className="App">
        {token && setupComplete && <Navigation />}
        <div className="container">
          <Routes>
            <Route path="/login" element={!token ? <Login /> : setupComplete === false ? <Navigate to="/setup" /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!token ? <Register /> : setupComplete === false ? <Navigate to="/setup" /> : <Navigate to="/dashboard" />} />
            <Route path="/setup" element={token && setupComplete === false ? <Setup /> : token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
            <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/parking/:parkingId/seats" element={<ProtectedRoute><SeatBooking /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to={token ? (setupComplete === false ? "/setup" : "/dashboard") : "/login"} />} />
            <Route path="*" element={<Navigate to={token ? (setupComplete === false ? "/setup" : "/dashboard") : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App