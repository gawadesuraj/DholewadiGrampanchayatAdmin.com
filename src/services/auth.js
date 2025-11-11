/* eslint-disable no-unused-vars */
class AuthService {
  constructor() {
    this.tokenKey = 'psshirala_token'
    this.userKey = 'psshirala_user'
  }

  // Store authentication token
  setToken(token) {
    localStorage.setItem(this.tokenKey, token)
  }

  // Get authentication token
  getToken() {
    return localStorage.getItem(this.tokenKey)
  }

  // Remove authentication token
  removeToken() {
    localStorage.removeItem(this.tokenKey)
  }

  // Store user data
  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user))
  }

  // Get user data
  getUser() {
    const user = localStorage.getItem(this.userKey)
    return user ? JSON.parse(user) : null
  }

  // Remove user data
  removeUser() {
    localStorage.removeItem(this.userKey)
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken()
    return !!token && !this.isTokenExpired(token)
  }

  // Check if token is expired
  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      return true
    }
  }

  // Login with credentials
  async login(credentials) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      this.setToken(data.token)
      this.setUser(data.user)
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Logout
  logout() {
    this.removeToken()
    this.removeUser()
    window.location.href = '/'
  }

  // Get authorization header
  getAuthHeader() {
    const token = this.getToken()
    return token ? `Bearer ${token}` : null
  }
}

export const authService = new AuthService()
