import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';

const IDENTITY_URL = process.env.IDENTITY_SERVICE_URL as string;

@Injectable()
export class SkillsService {
  constructor(private readonly proxy: HttpProxyService) {}

  listAll() {
    return this.proxy.get(`${IDENTITY_URL}/api/skills`);
  }

  createSkill(body: Record<string, unknown>, token: string) {
    return this.proxy.post(`${IDENTITY_URL}/api/skills`, body, this.proxy.authHeaders(token));
  }

  getQuestions(skillId: string, token: string) {
    return this.proxy.get(`${IDENTITY_URL}/api/skills/${skillId}/questions`, this.proxy.authHeaders(token));
  }

  addQuestions(skillId: string, body: Record<string, unknown>, token: string) {
    return this.proxy.post(`${IDENTITY_URL}/api/skills/${skillId}/questions`, body, this.proxy.authHeaders(token));
  }

  attemptQuiz(skillId: string, body: Record<string, unknown>, token: string) {
    return this.proxy.post(`${IDENTITY_URL}/api/skills/${skillId}/attempt`, body, this.proxy.authHeaders(token));
  }

  getMyValidations(token: string) {
    return this.proxy.get(`${IDENTITY_URL}/api/skills/my-validations`, this.proxy.authHeaders(token));
  }
}
