import { api } from './client'

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string; type: 'company' | 'specialist' }

export const authApi = {
  login: (data: LoginPayload) => api.post<{ access_token: string; user: UserProfile }>('/auth/login', data),
  register: (data: RegisterPayload) => api.post<{ access_token: string; user: UserProfile }>('/auth/register', data),
  me: () => api.get<UserProfile>('/auth/me'),
}

export interface UserProfile {
  id: string
  name: string
  email: string
  type: 'company' | 'specialist'
  role?: string
}
