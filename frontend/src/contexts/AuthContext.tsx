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
    const storedToken = localStorage.getItem('meraki_token')
    const storedUser = localStorage.getItem('meraki_user')
    // Reject tokens that were incorrectly saved as the literal string "undefined"
    if (storedToken && storedToken !== 'undefined' && storedUser && storedUser !== 'undefined') {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('meraki_token')
        localStorage.removeItem('meraki_user')
      }
    } else {
      localStorage.removeItem('meraki_token')
      localStorage.removeItem('meraki_user')
    }
    setIsLoading(false)

    const handleUnauthorized = () => {
      setToken(null)
      setUser(null)
    }
    window.addEventListener('meraki:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('meraki:unauthorized', handleUnauthorized)
  }, [])

  function login(newToken: string, newUser: UserProfile) {
    localStorage.setItem('meraki_token', newToken)
    localStorage.setItem('meraki_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    localStorage.removeItem('meraki_token')
    localStorage.removeItem('meraki_user')
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
