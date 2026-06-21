import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';

const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL as string;
const PROJECT_URL = process.env.PROJECT_SERVICE_URL as string;

@Injectable()
export class PaymentsService {
  constructor(private readonly proxy: HttpProxyService) {}

  createEscrow(dto: Record<string, any>, token: string) {
    return this.proxy.post(`${PAYMENT_URL}/api/payments/escrow`, dto, this.proxy.authHeaders(token));
  }

  releasePayment(milestoneId: string, token: string) {
    return this.proxy.post(`${PAYMENT_URL}/api/payments/release`, { milestoneId }, this.proxy.authHeaders(token));
  }

  findMine(token: string) {
    return this.proxy.get(`${PAYMENT_URL}/api/payments/my`, this.proxy.authHeaders(token));
  }

  async findByCompany(token: string) {
    const projectsRes = await this.proxy.get(`${PROJECT_URL}/api/projects`, this.proxy.authHeaders(token));
    const projects: any[] = projectsRes?.data ?? projectsRes ?? [];
    const paymentArrays = await Promise.all(
      projects.map((p: any) =>
        this.proxy.get(`${PAYMENT_URL}/api/payments/project/${p.id}`, this.proxy.authHeaders(token))
          .then(r => Array.isArray(r) ? r : r?.data ?? [])
          .catch(() => [])
      )
    );
    return { data: paymentArrays.flat() };
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

  requestWithdrawal(dto: Record<string, unknown>, token: string) {
    return this.proxy.post(`${PAYMENT_URL}/api/withdrawals`, dto, this.proxy.authHeaders(token));
  }

  getBalance(token: string) {
    return this.proxy.get(`${PAYMENT_URL}/api/withdrawals/balance`, this.proxy.authHeaders(token));
  }
}
