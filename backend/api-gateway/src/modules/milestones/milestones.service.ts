import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';
import { SubmitDeliveryDto } from './dto/submit-delivery.dto';

const DELIVERY_URL = process.env.DELIVERY_SERVICE_URL || 'http://localhost:3004';

@Injectable()
export class MilestonesService {
  constructor(private readonly proxy: HttpProxyService) {}

  submitDelivery(milestoneId: string, dto: SubmitDeliveryDto, token: string) {
    return this.proxy.post(`${DELIVERY_URL}/api/deliveries`, { ...dto, milestoneId }, this.proxy.authHeaders(token));
  }

  approveDelivery(milestoneId: string, amount: number | undefined, token: string) {
    return this.proxy.put(`${DELIVERY_URL}/api/deliveries/${milestoneId}/approve`, { amount }, this.proxy.authHeaders(token));
  }

  rejectDelivery(milestoneId: string, reason: string, token: string) {
    return this.proxy.put(`${DELIVERY_URL}/api/deliveries/${milestoneId}/reject`, { reason }, this.proxy.authHeaders(token));
  }

  getKanbanBoard(projectId: string, token: string) {
    return this.proxy.get(`${DELIVERY_URL}/api/kanban/${projectId}`, this.proxy.authHeaders(token));
  }

  addComment(milestoneId: string, comment: string, token: string) {
    return this.proxy.post(`${DELIVERY_URL}/api/deliveries/${milestoneId}/comments`, { comment }, this.proxy.authHeaders(token));
  }

  getProjectHistory(projectId: string, token: string) {
    return this.proxy.get(`${DELIVERY_URL}/api/history/${projectId}`, this.proxy.authHeaders(token));
  }
}
