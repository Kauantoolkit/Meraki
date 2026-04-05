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
  getPublicProfile: (specialistId: string) => api.get<PublicProfile>(`/portfolio/specialist/${specialistId}`),
  listSpecialists: (search?: string, skills?: string) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (skills) params.set('skills', skills)
    const qs = params.toString()
    return api.get<PublicProfile[]>(`/portfolio/specialists${qs ? `?${qs}` : ''}`)
  },
}
