import { api } from './client'

export interface Payment {
  id: string
  projectId: string
  milestoneId: string
  amount: number
  fee: number
  netAmount: number
  status: 'PENDING' | 'RELEASED' | 'REFUNDED'
  createdAt: string
}

export const paymentsApi = {
  list: () => api.get<Payment[]>('/payments/my'),
  listMine: () => api.get<Payment[]>('/payments/my'),
  listByProject: (projectId: string) => api.get<Payment[]>(`/payments/project/${projectId}`),
  releaseMilestone: (milestoneId: string) => api.post<Payment>('/payments/release', { milestoneId }),
}
