import { api } from './client'

export interface DeliveryPayload {
  milestoneId: string
  projectId: string
  deliveryNotes?: string
  deliveredFiles?: string[]
}

export const milestonesApi = {
  start: (milestoneId: string) =>
    api.put(`/milestones/${milestoneId}/start`),

  submit: (data: DeliveryPayload) =>
    api.post('/milestones/' + data.milestoneId + '/submit', {
      projectId: data.projectId,
      deliveryNotes: data.deliveryNotes,
      deliveredFiles: data.deliveredFiles,
    }),

  approve: (milestoneId: string) =>
    api.put(`/milestones/${milestoneId}/approve`),

  reject: (milestoneId: string, reason: string) =>
    api.put(`/milestones/${milestoneId}/reject`, { reason }),

  getHistory: (projectId: string) =>
    api.get(`/projects/${projectId}/history`),

  addComment: (milestoneId: string, text: string) =>
    api.post(`/milestones/${milestoneId}/comments`, { comment: text }),

  getComments: (milestoneId: string) =>
    api.get(`/milestones/${milestoneId}/comments`),
}
