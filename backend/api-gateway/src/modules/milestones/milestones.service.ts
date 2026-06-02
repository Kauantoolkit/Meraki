import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';
import { SubmitDeliveryDto } from './dto/submit-delivery.dto';

const DELIVERY_URL = process.env.DELIVERY_SERVICE_URL as string;
const PROJECT_URL = process.env.PROJECT_SERVICE_URL as string;

@Injectable()
export class MilestonesService {
  constructor(private readonly proxy: HttpProxyService) {}

  startMilestone(milestoneId: string, token: string) {
    return this.proxy.put(`${PROJECT_URL}/api/projects/milestones/${milestoneId}/start`, {}, this.proxy.authHeaders(token));
  }

  async submitDelivery(milestoneId: string, dto: SubmitDeliveryDto, token: string) {
    const result = await this.proxy.post(`${DELIVERY_URL}/api/deliveries`, { ...dto, milestoneId }, this.proxy.authHeaders(token));
    await this.proxy.put(`${PROJECT_URL}/api/projects/milestones/${milestoneId}/submit`, {}, this.proxy.authHeaders(token)).catch(() => {});
    return result;
  }

  async approveDelivery(milestoneId: string, amount: number | undefined, token: string) {
    const result = await this.proxy.put(`${DELIVERY_URL}/api/deliveries/${milestoneId}/approve`, { amount }, this.proxy.authHeaders(token));
    await this.proxy.put(`${PROJECT_URL}/api/projects/milestones/${milestoneId}/approve`, {}, this.proxy.authHeaders(token)).catch(() => {});
    return result;
  }

  async rejectDelivery(milestoneId: string, reason: string, token: string) {
    const result = await this.proxy.put(`${DELIVERY_URL}/api/deliveries/${milestoneId}/reject`, { reason }, this.proxy.authHeaders(token));
    await this.proxy.put(`${PROJECT_URL}/api/projects/milestones/${milestoneId}/reject`, {}, this.proxy.authHeaders(token)).catch(() => {});
    return result;
  }

  getKanbanBoard(projectId: string, token: string) {
    return this.proxy.get(`${DELIVERY_URL}/api/kanban/${projectId}`, this.proxy.authHeaders(token));
  }

  addComment(milestoneId: string, comment: string, token: string) {
    return this.proxy.post(`${DELIVERY_URL}/api/deliveries/${milestoneId}/comments`, { comment }, this.proxy.authHeaders(token));
  }

  getComments(milestoneId: string, token: string) {
    return this.proxy.get(`${DELIVERY_URL}/api/deliveries/${milestoneId}/comments`, this.proxy.authHeaders(token));
  }

  getProjectHistory(projectId: string, token: string) {
    return this.proxy.get(`${DELIVERY_URL}/api/history/${projectId}`, this.proxy.authHeaders(token));
  }
}
