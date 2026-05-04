import { api } from './client'

export interface Project {
  id: string
  title: string
  description: string
  budget: number
  deadline: string
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  companyId: string
  specialistId?: string
  skills?: string[]
}

export interface Milestone {
  id: string
  projectId: string
  title: string
  description?: string
  amount: number
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED_REVIEW' | 'APPROVED'
  order: number
}

export interface CreateProjectPayload {
  title: string
  description: string
  budget: number
  deadline: string
  requirements: string[]
  milestones?: { title: string; description: string; amount: number }[]
}

export interface ProjectsPage { data: Project[]; total: number }

export const projectsApi = {
  list: () => api.get<ProjectsPage>('/projects'),
  listOpen: () => api.get<ProjectsPage>('/projects?status=OPEN'),
  listByCompany: () => api.get<ProjectsPage>('/projects'),
  listBySpecialist: () => api.get<ProjectsPage>('/projects'),
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (data: CreateProjectPayload) => api.post<Project>('/projects', data),
  getMilestones: (projectId: string) => api.get<Milestone[]>(`/projects/${projectId}/milestones`),
}
