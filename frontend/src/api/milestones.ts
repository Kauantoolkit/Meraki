import { api } from './client'

export interface DeliveryPayload {
  milestoneId: string
  projectId: string
  deliveryNotes?: string
  deliveredFiles?: string[]
}

export interface DeliveryData {
  id: string
  milestoneId: string
  projectId: string
  specialistId: string
  deliveredFiles: string[]
  deliveryNotes: string | null
  status: string
  createdAt: string
}

export const milestonesApi = {
  start: (milestoneId: string) =>
    api.put(`/milestones/${milestoneId}/start`),

  getDelivery: (milestoneId: string) =>
    api.get<DeliveryData | null>(`/milestones/${milestoneId}/delivery`),

  submit: (data: DeliveryPayload) =>
    api.post('/milestones/' + data.milestoneId + '/submit', {
      projectId: data.projectId,
      deliveryNotes: data.deliveryNotes,
      deliveredFiles: data.deliveredFiles,
    }),

  approve: (milestoneId: string, amount?: number) =>
    api.put(`/milestones/${milestoneId}/approve`, amount != null ? { amount } : {}),

  reject: (milestoneId: string, reason: string) =>
    api.put(`/milestones/${milestoneId}/reject`, { reason }),

  getHistory: (projectId: string) =>
    api.get(`/projects/${projectId}/history`),

  addComment: (milestoneId: string, text: string) =>
    api.post(`/milestones/${milestoneId}/comments`, { comment: text }),

  getComments: (milestoneId: string) =>
    api.get(`/milestones/${milestoneId}/comments`),
}
