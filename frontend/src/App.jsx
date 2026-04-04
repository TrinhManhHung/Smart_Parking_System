import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Recommendations from './components/Recommendations'
import Reservations from './components/Reservations'
import SeatBooking from './components/SeatBooking'
import Navigation from './components/Navigation'

function App() {
  const token = localStorage.getItem('token')

  return (
    <Router>
      <div className="App">
        {token && <Navigation />}
        <div className="container">
          <Routes>
            <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/recommendations" element={token ? <Recommendations /> : <Navigate to="/login" />} />
            <Route path="/reservations" element={token ? <Reservations /> : <Navigate to="/login" />} />
            <Route path="/parking/:parkingId/seats" element={token ? <SeatBooking /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
            <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App