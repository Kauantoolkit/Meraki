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

    // Valida o token e puxa dados frescos do servidor
    setToken(storedToken)
    authApi.me()
      .then(res => {
        const user = {
          ...res.data,
          type: res.data.userType === 'COMPANY' ? 'company' as const : 'specialist' as const,
        }
        setUser(user)
        sessionStorage.setItem('meraki_user', JSON.stringify(user))
      })
      .catch(() => {
        // Token inválido ou expirado — força logout silencioso
        sessionStorage.removeItem('meraki_token')
        sessionStorage.removeItem('meraki_user')
        setToken(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))

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
