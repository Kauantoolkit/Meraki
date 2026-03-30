import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Injeta JWT em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('meraki_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Notifica o AuthContext quando o token expirar (sem hard reload)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('meraki_token')
      localStorage.removeItem('meraki_user')
      window.dispatchEvent(new CustomEvent('meraki:unauthorized'))
    }
    return Promise.reject(error)
  },
)
