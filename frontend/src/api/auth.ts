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

export const usersApi = {
  updateProfile: (data: { bio?: string; skills?: string[]; avatarUrl?: string; pixKey?: string }) =>
    api.put<void>('/users/me/profile', data),
}

export const passwordApi = {
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
}

export const authApi = {
  login: async (data: LoginPayload) => {
    const res = await api.post<AuthResponse>('/auth/login', data)
    return { token: res.data.accessToken, user: normalizeUser(res.data.user) }
  },
  register: async (data: RegisterPayload) => {
    await api.post('/auth/register', data)
  },
  me: () => api.get<UserProfile>('/users/me'),
}
