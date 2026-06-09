import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, UserProfile } from '../api/auth'

interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  login: (token: string, user: UserProfile) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = sessionStorage.getItem('meraki_token')

    const handleUnauthorized = () => {
      setToken(null)
      setUser(null)
    }
    window.addEventListener('meraki:unauthorized', handleUnauthorized)

    if (!storedToken || storedToken === 'undefined') {
      sessionStorage.removeItem('meraki_token')
      sessionStorage.removeItem('meraki_user')
      setIsLoading(false)
      return () => window.removeEventListener('meraki:unauthorized', handleUnauthorized)
    }

    // Usa cached user para render imediato, depois valida com servidor
    setToken(storedToken)
    const storedUser = sessionStorage.getItem('meraki_user')
    if (storedUser) {
      try {
        const cached = JSON.parse(storedUser)
        setUser(cached)
      } catch {}
    }
    setIsLoading(false)

    // Valida em background — só faz logout em 401 (token inválido/expirado)
    // Erros de rede, 5xx ou 429 mantêm o usuário cached para não derrubar sessão por instabilidade
    authApi.me()
      .then(res => {
        const u = {
          ...res.data,
          type: res.data.userType === 'COMPANY' ? 'company' as const : 'specialist' as const,
        }
        setUser(u)
        sessionStorage.setItem('meraki_user', JSON.stringify(u))
      })
      .catch((err: any) => {
        const status = err?.response?.status
        if (status === 401) {
          // Token inválido ou expirado — o interceptor do client.ts já limpou o storage
          setToken(null)
          setUser(null)
        }
        // Qualquer outro erro (rede, 5xx, 429, timeout) — mantém sessão cached
      })

    return () => window.removeEventListener('meraki:unauthorized', handleUnauthorized)
  }, [])

  function login(newToken: string, newUser: UserProfile) {
    sessionStorage.setItem('meraki_token', newToken)
    sessionStorage.setItem('meraki_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    sessionStorage.removeItem('meraki_token')
    sessionStorage.removeItem('meraki_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
