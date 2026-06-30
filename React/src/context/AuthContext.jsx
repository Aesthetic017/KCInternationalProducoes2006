import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

axios.defaults.baseURL = 'http://localhost:5000'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('kc_token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.get('/api/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('kc_token')
          delete axios.defaults.headers.common['Authorization']
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const persist = (token, userData) => {
    localStorage.setItem('kc_token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
  }

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password })
      persist(data.token, data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed' }
    }
  }

  const register = async ({ name, email, phone, password, country }) => {
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, phone, password, country })
      persist(data.token, data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Registration failed' }
    }
  }

  const forgotPassword = async (email) => {
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email })
      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to send reset email' }
    }
  }

  const resetPassword = async (token, password) => {
    try {
      const { data } = await axios.post(`/api/auth/reset-password/${token}`, { password })
      persist(data.token, data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to reset password' }
    }
  }

  // Update name / email / phone while logged in
  const updateProfile = async ({ name, email, phone }) => {
    try {
      const { data } = await axios.put('/api/auth/me', { name, email, phone })
      setUser(data)
      return { success: true, user: data }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update profile' }
    }
  }

  // Change password while logged in (requires current password)
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/api/auth/change-password', { currentPassword, newPassword })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to change password' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('kc_token')
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      forgotPassword, resetPassword, updateProfile, changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}