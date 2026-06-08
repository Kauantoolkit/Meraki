import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Injeta JWT em toda requisição
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('meraki_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** Extrai a mensagem de erro da resposta da API (suporta string e array do class-validator). */
export function extractApiError(err: unknown, fallback = 'Verifique os dados e tente novamente.'): string {
  const data = (err as any)?.response?.data
  const raw = data?.message ?? data?.error
  if (Array.isArray(raw)) return raw.join(' | ')
  return typeof raw === 'string' ? raw : fallback
}

// Notifica o AuthContext quando o token expirar (sem hard reload)
// Ignora rotas de auth para não interferir com credenciais inválidas
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url: string = error.config?.url ?? ''
    const isAuthRoute = url.includes('/auth/')
    if (error.response?.status === 401 && !isAuthRoute) {
      sessionStorage.removeItem('meraki_token')
      sessionStorage.removeItem('meraki_user')
      window.dispatchEvent(new CustomEvent('meraki:unauthorized'))
    }
    return Promise.reject(error)
  },
)
