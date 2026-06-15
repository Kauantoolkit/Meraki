import { api } from './client'

export interface ProfileLink {
  label: string
  url: string
}

export interface PublicProfile {
  id: string
  userId: string
  name: string
  type: 'specialist' | 'company'
  bio?: string
  skills?: string[]
  skillBadges?: Record<string, 'yellow' | 'green'>
  links?: ProfileLink[]
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

export interface Review {
  id: string
  specialistId: string
  companyId: string
  companyName?: string
  rating: number
  comment: string
  createdAt: string
}

export const portfolioApi = {
  getMyProfile: () => api.get<PublicProfile>('/portfolio/me'),
  updateProfile: (data: { bio?: string; skills?: string[]; links?: ProfileLink[] }) => api.patch<PublicProfile>('/portfolio/me', data),
  getPublicProfile: (specialistId: string) => api.get<PublicProfile>(`/portfolio/specialist/${specialistId}`),
  getCompanyProfile: (companyId: string) => api.get<PublicProfile>(`/portfolio/company/${companyId}`),
  listReviews: (specialistId: string) => api.get<Review[]>(`/reviews/specialist/${specialistId}`),
  createReview: (data: { specialistId: string; projectId: string; reviewerId: string; rating: number; comment: string }) =>
    api.post<Review>('/reviews', data),
  listSpecialists: (search?: string, skills?: string) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (skills) params.set('skills', skills)
    const qs = params.toString()
    return api.get<PublicProfile[]>(`/portfolio/specialists${qs ? `?${qs}` : ''}`)
  },
}
