import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';

const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005';

@Injectable()
export class PaymentsService {
  constructor(private readonly proxy: HttpProxyService) {}

  createEscrow(dto: any, token: string) {
    return this.proxy.post(`${PAYMENT_URL}/api/payments/escrow`, dto, this.proxy.authHeaders(token));
  }

  releasePayment(milestoneId: string, token: string) {
    return this.proxy.post(`${PAYMENT_URL}/api/payments/release`, { milestoneId }, this.proxy.authHeaders(token));
  }

  findMine(token: string) {
    return this.proxy.get(`${PAYMENT_URL}/api/payments/my`, this.proxy.authHeaders(token));
  }

  findByProject(projectId: string, token: string) {
    return this.proxy.get(`${PAYMENT_URL}/api/payments/project/${projectId}`, this.proxy.authHeaders(token));
  }

  findByMilestone(milestoneId: string, token: string) {
    return this.proxy.get(`${PAYMENT_URL}/api/payments/milestone/${milestoneId}`, this.proxy.authHeaders(token));
  }

  findOne(id: string, token: string) {
    return this.proxy.get(`${PAYMENT_URL}/api/payments/${id}`, this.proxy.authHeaders(token));
  }
}
