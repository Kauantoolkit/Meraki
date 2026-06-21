import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';

const PROJECT_URL = process.env.PROJECT_SERVICE_URL as string;

@Injectable()
export class ProjectsService {
  constructor(private readonly proxy: HttpProxyService) {}

  create(dto: Record<string, any>, token: string) {
    return this.proxy.post(`${PROJECT_URL}/api/projects`, dto, this.proxy.authHeaders(token));
  }

  findAll(query: Record<string, any>, token: string) {
    const params = new URLSearchParams(query as Record<string, string>).toString();
    return this.proxy.get(`${PROJECT_URL}/api/projects?${params}`, this.proxy.authHeaders(token));
  }

  findOne(id: string, token: string) {
    return this.proxy.get(`${PROJECT_URL}/api/projects/${id}`, this.proxy.authHeaders(token));
  }

  update(id: string, dto: Record<string, any>, token: string) {
    return this.proxy.put(`${PROJECT_URL}/api/projects/${id}`, dto, this.proxy.authHeaders(token));
  }

  cancel(id: string, token: string) {
    return this.proxy.delete(`${PROJECT_URL}/api/projects/${id}`, this.proxy.authHeaders(token));
  }

  createMilestone(projectId: string, dto: Record<string, any>, token: string) {
    return this.proxy.post(`${PROJECT_URL}/api/projects/${projectId}/milestones`, dto, this.proxy.authHeaders(token));
  }

  getMilestones(projectId: string, token: string) {
    return this.proxy.get(`${PROJECT_URL}/api/projects/${projectId}/milestones`, this.proxy.authHeaders(token));
  }

  complete(id: string, token: string) {
    return this.proxy.put(`${PROJECT_URL}/api/projects/${id}/complete`, {}, this.proxy.authHeaders(token));
  }

  signContract(id: string, body: any, token: string, ip: string, userAgent: string) {
    return this.proxy.patch(`${PROJECT_URL}/api/projects/${id}/sign-contract`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-forwarded-for': ip,
        'user-agent': userAgent,
      },
    });
  }
}
