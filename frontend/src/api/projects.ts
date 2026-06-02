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
  milestones?: Milestone[]
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

function mapMilestone(m: any): Milestone {
  return { ...m, amount: Number(m.amount) }
}

/** Normaliza campos do backend: requirements→skills, decimal strings→number. */
function mapProject(raw: any): Project {
  return {
    ...raw,
    budget: Number(raw.budget),
    skills: raw.requirements ?? raw.skills ?? [],
    milestones: raw.milestones ? raw.milestones.map(mapMilestone) : undefined,
  }
}

function mapPage(raw: any): ProjectsPage {
  return { data: (raw.data ?? []).map(mapProject), total: raw.total ?? 0 }
}

export const projectsApi = {
  list:            () => api.get<any>('/projects').then(r => ({ ...r, data: mapPage(r.data) })),
  listOpen:        () => api.get<any>('/projects?status=OPEN').then(r => ({ ...r, data: mapPage(r.data) })),
  listByCompany:   () => api.get<any>('/projects').then(r => ({ ...r, data: mapPage(r.data) })),
  listBySpecialist:() => api.get<any>('/projects').then(r => ({ ...r, data: mapPage(r.data) })),

  getById: (id: string) =>
    api.get<any>(`/projects/${id}`).then(r => ({ ...r, data: mapProject(r.data) })),

  cancel: (id: string) => api.delete<void>(`/projects/${id}`),

  update: (id: string, data: Partial<Pick<CreateProjectPayload, 'title' | 'description' | 'requirements' | 'budget' | 'deadline'>>) =>
    api.put<any>(`/projects/${id}`, data).then(r => ({ ...r, data: mapProject(r.data) })),

  create: async (data: CreateProjectPayload) => {
    const { milestones, ...projectData } = data
    const res = await api.post<any>('/projects', projectData)
    if (milestones && milestones.length > 0) {
      for (const m of milestones) {
        await api.post(`/projects/${res.data.id}/milestones`, m)
      }
    }
    return { ...res, data: mapProject(res.data) }
  },

  getMilestones: (projectId: string) => api.get<Milestone[]>(`/projects/${projectId}/milestones`),
}
