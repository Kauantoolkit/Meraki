import { api } from './client'

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  metadata: Record<string, any>
  createdAt: string
}

export interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
}

export const notificationsApi = {
  list: () => api.get<NotificationsResponse>('/notifications').then(r => r.data),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
}
