import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';

const IDENTITY_URL = process.env.IDENTITY_SERVICE_URL as string;

@Injectable()
export class SkillsService {
  constructor(private readonly proxy: HttpProxyService) {}

  listSkills() {
    return this.proxy.get(`${IDENTITY_URL}/api/skills`);
  }

  createSkill(dto: Record<string, unknown>, token: string) {
    return this.proxy.post(`${IDENTITY_URL}/api/skills`, dto, this.proxy.authHeaders(token));
  }

  addQuestions(skillId: string, body: Record<string, unknown>, token: string) {
    return this.proxy.post(`${IDENTITY_URL}/api/skills/${skillId}/questions`, body, this.proxy.authHeaders(token));
  }

  getQuestions(skillId: string, token: string) {
    return this.proxy.get(
      `${IDENTITY_URL}/api/skills/${skillId}/questions`,
      this.proxy.authHeaders(token),
    );
  }

  getRandomQuestions(skillId: string, token: string) {
    return this.proxy.get(
      `${IDENTITY_URL}/api/skills/${skillId}/questions/random`,
      this.proxy.authHeaders(token),
    );
  }

  getCompanyQuestions(skillId: string, companyId: string, token: string) {
    return this.proxy.get(
      `${IDENTITY_URL}/api/skills/${skillId}/questions/by-company/${companyId}`,
      this.proxy.authHeaders(token),
    );
  }

  attemptProfileQuiz(skillId: string, body: Record<string, unknown>, token: string) {
    return this.proxy.post(
      `${IDENTITY_URL}/api/skills/${skillId}/attempt-profile`,
      body,
      this.proxy.authHeaders(token),
    );
  }

  attemptProjectQuiz(skillId: string, body: Record<string, unknown>, token: string) {
    return this.proxy.post(
      `${IDENTITY_URL}/api/skills/${skillId}/attempt-project`,
      body,
      this.proxy.authHeaders(token),
    );
  }

  updateQuestion(questionId: string, body: Record<string, unknown>, token: string) {
    return this.proxy.patch(
      `${IDENTITY_URL}/api/skills/questions/${questionId}`,
      body,
      this.proxy.authHeaders(token),
    );
  }

  deleteQuestion(questionId: string, token: string) {
    return this.proxy.delete(
      `${IDENTITY_URL}/api/skills/questions/${questionId}`,
      this.proxy.authHeaders(token),
    );
  }

  getMyValidations(token: string) {
    return this.proxy.get(
      `${IDENTITY_URL}/api/skills/my-validations`,
      this.proxy.authHeaders(token),
    );
  }
}
