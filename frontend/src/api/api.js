import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token')
      localStorage.removeItem('setupComplete')
      // Dispatch custom event to notify App component
      window.dispatchEvent(new Event('authChange'))
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (userData) => api.post('/login', userData),
}

export const parkingAPI = {
  getAllParkings: () => api.get('/parkings'),
  getParkingById: (id) => api.get(`/parkings/${id}`),
  getParkingSeats: (parkingId, startTime = null, endTime = null) => {
    let url = `/parkings/${parkingId}/seats`
    if (startTime && endTime) {
      url += `?start_time=${encodeURIComponent(startTime)}&end_time=${encodeURIComponent(endTime)}`
    }
    return api.get(url)
  },
  bookSeat: (seatId) => api.post(`/seats/${seatId}/book`),
  bookSeatWithTime: (seatId, startTime, endTime, userId = 1) => 
    api.post(`/seats/${seatId}/book`, {
      start_time: startTime,
      end_time: endTime,
      user_id: userId
    }),
  releaseSeat: (seatId) => api.post(`/seats/${seatId}/release`),
}

export const reservationAPI = {
  getUserReservations: () => api.get('/reservations'),
  createReservation: (reservationData) => api.post('/reservations', reservationData),
  quickBookPrepare: (parkingId) => api.post(`/reservations/quick-book-prepare/${parkingId}`),
  quickBookConfirm: (bookingData) => api.post('/reservations/quick-book-confirm', bookingData),
  getBookedSeats: (parkingId) => api.get(`/reservations/booked-seats/${parkingId}`),
  checkIn: (reservationId) => api.post(`/reservations/${reservationId}/check-in`),
  checkOut: (reservationId) => api.post(`/reservations/${reservationId}/check-out`),
  cancelReservation: (reservationId) => api.delete(`/reservations/${reservationId}`),
}

export const userAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (profileData) => api.put('/profile', profileData),
  getVehicles: () => api.get('/vehicles'),
  createVehicle: (vehicleData) => api.post('/vehicles', vehicleData),
  updateVehicle: (vehicleId, vehicleData) => api.put(`/vehicles/${vehicleId}`, vehicleData),
  deleteVehicle: (vehicleId) => api.delete(`/vehicles/${vehicleId}`),
  getPaymentMethods: () => api.get('/payment-methods'),
  createPaymentMethod: (paymentData) => api.post('/payment-methods', paymentData),
  updatePaymentMethod: (paymentId, paymentData) => api.put(`/payment-methods/${paymentId}`, paymentData),
  deletePaymentMethod: (paymentId) => api.delete(`/payment-methods/${paymentId}`),
  getFavorites: () => api.get('/favorites'),
  addFavorite: (favoriteData) => api.post('/favorites', favoriteData),
  updateFavorite: (favoriteId, favoriteData) => api.put(`/favorites/${favoriteId}`, favoriteData),
  removeFavorite: (favoriteId) => api.delete(`/favorites/${favoriteId}`),
  getStatistics: () => api.get('/statistics'),
  getHistory: (limit = 50, offset = 0) => api.get(`/history?limit=${limit}&offset=${offset}`),
}

export const recommendationAPI = {
  getRecommendations: (lat, lng, filters = {}) => {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString()
    })
    
    if (filters.maxDistance) params.append('max_distance', filters.maxDistance)
    if (filters.minAvailableSlots) params.append('min_available_slots', filters.minAvailableSlots)
    if (filters.maxPrice) params.append('max_price', filters.maxPrice)
    if (filters.sortBy) params.append('sort_by', filters.sortBy)
    
    return api.get(`/recommendations?${params.toString()}`)
  },
}

export const paymentAPI = {
  calculatePayment: (paymentData) => api.post('/payment/calculate', paymentData),
}

export default api