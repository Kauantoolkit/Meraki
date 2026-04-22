import { api } from './client'

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string; userType: 'COMPANY' | 'SPECIALIST'; companyName?: string }

export interface UserProfile {
  id: string
  name: string
  email: string
  userType: 'COMPANY' | 'SPECIALIST'
  specialistId?: string
  companyId?: string
  // normalized alias used by UI components
  type: 'company' | 'specialist'
}

export interface AuthResponse {
  accessToken: string
  user: {
    id: string
    name: string
    email: string
    userType: 'COMPANY' | 'SPECIALIST'
    specialistId?: string
    companyId?: string
  }
}

function normalizeUser(raw: AuthResponse['user']): UserProfile {
  return {
    ...raw,
    type: raw.userType === 'COMPANY' ? 'company' : 'specialist',
  }
}

export const authApi = {
  login: async (data: LoginPayload) => {
    const res = await api.post<AuthResponse>('/auth/login', data)
    return { token: res.data.accessToken, user: normalizeUser(res.data.user) }
  },
  register: async (data: RegisterPayload) => {
    const res = await api.post<AuthResponse>('/auth/register', data)
    return { token: res.data.accessToken, user: normalizeUser(res.data.user) }
  },
  me: () => api.get<UserProfile>('/auth/me'),
}
