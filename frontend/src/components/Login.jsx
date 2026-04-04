import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api/api'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await authAPI.login(formData)
      localStorage.setItem('token', response.data.access_token)
      navigate('/dashboard')
    } catch (error) {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="form">
      <h2>Login</h2>
      {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn">Login</button>
        <Link to="/register">Don't have an account? Register</Link>
      </form>
    </div>
  )
}

export default Login