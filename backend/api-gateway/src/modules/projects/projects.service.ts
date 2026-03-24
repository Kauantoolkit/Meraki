import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { ListProjectsQueryDto } from './dto/list-projects-query.dto';

const PROJECT_URL = process.env.PROJECT_SERVICE_URL || 'http://localhost:3002';

@Injectable()
export class ProjectsService {
  constructor(private readonly proxy: HttpProxyService) {}

  create(dto: CreateProjectDto, token: string) {
    return this.proxy.post(`${PROJECT_URL}/api/projects`, dto, this.proxy.authHeaders(token));
  }

  findAll(query: ListProjectsQueryDto, token: string) {
    const params = new URLSearchParams(query as Record<string, string>).toString();
    return this.proxy.get(`${PROJECT_URL}/api/projects?${params}`, this.proxy.authHeaders(token));
  }

  findOne(id: string, token: string) {
    return this.proxy.get(`${PROJECT_URL}/api/projects/${id}`, this.proxy.authHeaders(token));
  }

  update(id: string, dto: UpdateProjectDto, token: string) {
    return this.proxy.put(`${PROJECT_URL}/api/projects/${id}`, dto, this.proxy.authHeaders(token));
  }

  cancel(id: string, token: string) {
    return this.proxy.delete(`${PROJECT_URL}/api/projects/${id}`, this.proxy.authHeaders(token));
  }

  createMilestone(projectId: string, dto: CreateMilestoneDto, token: string) {
    return this.proxy.post(`${PROJECT_URL}/api/projects/${projectId}/milestones`, dto, this.proxy.authHeaders(token));
  }

  getMilestones(projectId: string, token: string) {
    return this.proxy.get(`${PROJECT_URL}/api/projects/${projectId}/milestones`, this.proxy.authHeaders(token));
  }
}
