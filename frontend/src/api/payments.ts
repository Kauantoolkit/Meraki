import { api } from './client'

export interface Payment {
  id: string
  projectId: string
  milestoneId: string
  amount: number
  specialistAmount: number
  platformFee: number
  status: 'PENDING' | 'ESCROW_HELD' | 'RELEASED' | 'REFUNDED'
  createdAt: string
}

export interface PaymentMethodResponse {
  type: 'pix' | 'card' | 'bank_transfer'
  identifier: string
  amount: number
  expiresAt: string
  qrCode?: string
  qrCodeText?: string
  externalId?: string
}

export interface HiringPaymentResponse {
  payment: Payment
  paymentMethod: PaymentMethodResponse
}

export interface CreateHiringPaymentDto {
  projectId: string
  specialistId: string
  amount: number
  milestoneId?: string
}

export const paymentsApi = {
  list: () => api.get<Payment[]>('/payments/my'),
  listMine: () => api.get<Payment[]>('/payments/my'),
  listByCompany: () => api.get<{ data: Payment[] }>('/payments/company'),
  listByProject: (projectId: string) => api.get<Payment[]>(`/payments/project/${projectId}`),
  releaseMilestone: (milestoneId: string) => api.post<Payment>('/payments/release', { milestoneId }),
  createHiringPayment: (dto: CreateHiringPaymentDto) =>
    api.post<HiringPaymentResponse>('/payments/hiring', dto),
  confirmHiringPayment: (paymentId: string) =>
    api.patch<{ payment: Payment }>(`/payments/hiring/${paymentId}/confirm`),
}
