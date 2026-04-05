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
  checkIn: (reservationId) => api.post(`/reservations/${reservationId}/check-in`),
  checkOut: (reservationId) => api.post(`/reservations/${reservationId}/check-out`),
  cancelReservation: (reservationId) => api.delete(`/reservations/${reservationId}`),
}

export const recommendationAPI = {
  getRecommendations: (lat, lng) => api.get(`/recommendations?lat=${lat}&lng=${lng}`),
}

export const paymentAPI = {
  calculatePayment: (paymentData) => api.post('/payment/calculate', paymentData),
}

export default api