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
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED'
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
  create: async (data: CreateProjectPayload) => {
    const { milestones, ...projectData } = data
    const res = await api.post<Project>('/projects', projectData)
    if (milestones && milestones.length > 0) {
      for (const m of milestones) {
        await api.post(`/projects/${res.data.id}/milestones`, m)
      }
    }
    return res
  },
  getMilestones: (projectId: string) => api.get<Milestone[]>(`/projects/${projectId}/milestones`),
}
