import { api } from './client'

export interface PublicProfile {
  id: string
  userId: string
  name: string
  type: 'specialist' | 'company'
  bio?: string
  skills?: string[]
  rating?: number
  completedProjects?: number
  workHistory?: WorkHistoryItem[]
}

export interface WorkHistoryItem {
  projectId: string
  projectTitle: string
  companyName: string
  completedAt: string
  amount: number
}

export const portfolioApi = {
  getMyProfile: () => api.get<PublicProfile>('/portfolio/me'),
  getPublicProfile: (userId: string) => api.get<PublicProfile>(`/portfolio/${userId}`),
  listSpecialists: (search?: string) =>
    api.get<PublicProfile[]>(`/portfolio/specialists${search ? `?search=${search}` : ''}`),
}
