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
  list: () => api.get<Payment[]>('/payments'),
  getEscrowBalance: () => api.get<{ balance: number }>('/payments/escrow'),
}
