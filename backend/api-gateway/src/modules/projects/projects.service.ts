import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';

const PROJECT_URL = process.env.PROJECT_SERVICE_URL || 'http://localhost:3002';

@Injectable()
export class ProjectsService {
  constructor(private readonly proxy: HttpProxyService) {}

  create(dto: any, token: string) {
    return this.proxy.post(`${PROJECT_URL}/api/projects`, dto, this.proxy.authHeaders(token));
  }

  findAll(query: Record<string, any>, token: string) {
    const params = new URLSearchParams(query).toString();
    return this.proxy.get(`${PROJECT_URL}/api/projects?${params}`, this.proxy.authHeaders(token));
  }

  findOne(id: string, token: string) {
    return this.proxy.get(`${PROJECT_URL}/api/projects/${id}`, this.proxy.authHeaders(token));
  }

  update(id: string, dto: any, token: string) {
    return this.proxy.put(`${PROJECT_URL}/api/projects/${id}`, dto, this.proxy.authHeaders(token));
  }

  cancel(id: string, token: string) {
    return this.proxy.delete(`${PROJECT_URL}/api/projects/${id}`, this.proxy.authHeaders(token));
  }

  // Milestones do projeto
  createMilestone(projectId: string, dto: any, token: string) {
    return this.proxy.post(`${PROJECT_URL}/api/projects/${projectId}/milestones`, dto, this.proxy.authHeaders(token));
  }

  getMilestones(projectId: string, token: string) {
    return this.proxy.get(`${PROJECT_URL}/api/projects/${projectId}/milestones`, this.proxy.authHeaders(token));
  }
}
