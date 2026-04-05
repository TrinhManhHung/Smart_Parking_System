import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api/api'

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    agreeToTerms: false
  })
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const calculatePasswordStrength = (password) => {
    if (password.length === 0) return ''
    if (password.length < 6) return 'weak'
    if (password.length < 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'medium'
    if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) return 'strong'
    return 'medium'
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    setFormData({
      ...formData,
      [name]: newValue
    })

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }

    // Clear error when user starts typing
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Please enter your full name')
      return false
    }
    if (!formData.email.trim()) {
      setError('Please enter your email')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (formData.phone && !/^[0-9]{10,}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      setError('Please enter a valid phone number')
      return false
    }
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password
      })
      localStorage.setItem('token', response.data.access_token)
      window.dispatchEvent(new Event('authChange'))
      navigate('/dashboard')
    } catch (error) {
      setError(error.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="form">
        <h2>Create Account</h2>
        <p className="form-subtitle">Join our smart parking community</p>
        
        {error && <div className="error-message">⚠️ {error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+84 123 456 789"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
            />
            {passwordStrength && (
              <div className="password-strength">
                <div className={`password-strength-bar password-strength-${passwordStrength}`}></div>
              </div>
            )}
            {passwordStrength && (
              <small style={{ color: passwordStrength === 'weak' ? '#f56565' : passwordStrength === 'medium' ? '#ed8936' : '#48bb78', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Password strength: {passwordStrength}
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
            />
            <label htmlFor="agreeToTerms">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="form-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register