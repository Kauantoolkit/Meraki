import { api } from './client'

export interface DeliveryPayload {
  milestoneId: string
  repositoryUrl?: string
  releaseNotes?: string
}

export const milestonesApi = {
  submit: (data: DeliveryPayload) => api.post('/deliveries', data),
  approve: (milestoneId: string) => api.patch(`/milestones/${milestoneId}/approve`),
  updateStatus: (milestoneId: string, status: string) =>
    api.patch(`/milestones/${milestoneId}/status`, { status }),
  getHistory: (projectId: string) => api.get(`/deliveries/project/${projectId}/history`),
  addComment: (milestoneId: string, text: string) =>
    api.post(`/milestones/${milestoneId}/comments`, { text }),
  getComments: (milestoneId: string) =>
    api.get(`/milestones/${milestoneId}/comments`),
}
