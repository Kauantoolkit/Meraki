import { api } from './client'

export interface ProfileLink {
  label: string
  url: string
}

export interface Certification {
  id: string
  specialistId: string
  name: string
  issuer: string
  issueDate?: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
  createdAt: string
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
  avatarUrl?: string
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

export interface Certification {
  id: string
  specialistId: string
  name: string
  issuer: string
  issueDate?: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
}

export const portfolioApi = {
  getMyProfile: () => api.get<PublicProfile>('/portfolio/me'),
  updateProfile: (data: { bio?: string; skills?: string[]; links?: ProfileLink[]; avatarUrl?: string }) => api.patch<PublicProfile>('/portfolio/me', data),
  updateCompanyProfile: (data: { avatarUrl?: string }) => api.patch<PublicProfile>('/portfolio/me/company', data),
  getPublicProfile: (specialistId: string) => api.get<PublicProfile>(`/portfolio/specialist/${specialistId}`),
  getCompanyProfile: (companyId: string) => api.get<PublicProfile>(`/portfolio/company/${companyId}`),
  listReviews: (specialistId: string) => api.get<Review[]>(`/reviews/specialist/${specialistId}`),
  listCertifications: (specialistId: string) => api.get<Certification[]>(`/certifications/specialist/${specialistId}`),
  createReview: (data: { specialistId: string; projectId: string; reviewerId: string; rating: number; comment: string }) =>
    api.post<Review>('/reviews', data),
  listSpecialists: (search?: string, skills?: string) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (skills) params.set('skills', skills)
    const qs = params.toString()
    return api.get<PublicProfile[]>(`/portfolio/specialists${qs ? `?${qs}` : ''}`)
  },
  listCertifications: (specialistId: string) =>
    api.get<Certification[]>(`/certifications/specialist/${specialistId}`),
  createCertification: (data: { title: string; institution: string; issuedAt?: string; credentialUrl?: string }) =>
    api.post<Certification>('/portfolio/me/certifications', data),
  deleteCertification: (id: string) =>
    api.delete<void>(`/certifications/${id}`),
}
