import { api } from './client'

export interface Bid {
  id: string
  projectId: string
  specialistId: string
  specialistName?: string
  amount: number
  durationDays: number
  proposalText: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
  createdAt: string
}

export interface SubmitBidPayload {
  projectId: string
  amount: number
  durationDays: number
  proposalText: string
}

export const bidsApi = {
  submit: (data: SubmitBidPayload) => api.post<Bid>('/bids', data),
  listForProject: (projectId: string) => api.get<Bid[]>(`/bids/project/${projectId}`),
  myBids: () => api.get<Bid[]>('/bids/my'),
  accept: (bidId: string) => api.patch<Bid>(`/bids/${bidId}/accept`),
  reject: (bidId: string) => api.patch<Bid>(`/bids/${bidId}/reject`),
}
