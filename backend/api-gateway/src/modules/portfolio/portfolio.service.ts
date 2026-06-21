import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';

const PORTFOLIO_URL = process.env.PORTFOLIO_SERVICE_URL as string;

@Injectable()
export class PortfolioService {
  constructor(private readonly proxy: HttpProxyService) {}

  getMyPortfolio(token: string) {
    return this.proxy.get(`${PORTFOLIO_URL}/api/portfolio/me`, this.proxy.authHeaders(token));
  }

  updateProfile(dto: Record<string, any>, token: string) {
    return this.proxy.patch(`${PORTFOLIO_URL}/api/portfolio/me`, dto, this.proxy.authHeaders(token));
  }

  updateCompanyProfile(dto: Record<string, any>, token: string) {
    return this.proxy.patch(`${PORTFOLIO_URL}/api/portfolio/me/company`, dto, this.proxy.authHeaders(token));
  }

  addSkill(dto: Record<string, any>, token: string) {
    return this.proxy.post(`${PORTFOLIO_URL}/api/portfolio/me/skills`, dto, this.proxy.authHeaders(token));
  }

  addCertification(dto: Record<string, any>, token: string) {
    return this.proxy.post(`${PORTFOLIO_URL}/api/portfolio/me/certifications`, dto, this.proxy.authHeaders(token));
  }

  listCertifications(specialistId: string, token: string) {
    return this.proxy.get(`${PORTFOLIO_URL}/api/certifications/specialist/${specialistId}`, this.proxy.authHeaders(token));
  }

  deleteCertification(id: string, token: string) {
    return this.proxy.delete(`${PORTFOLIO_URL}/api/certifications/${id}`, this.proxy.authHeaders(token));
  }

  listSpecialists(token: string) {
    return this.proxy.get(`${PORTFOLIO_URL}/api/profiles/specialists`, this.proxy.authHeaders(token));
  }

  getSpecialistProfile(specialistId: string, token: string) {
    return this.proxy.get(`${PORTFOLIO_URL}/api/profiles/specialist/${specialistId}`, this.proxy.authHeaders(token));
  }

  getCompanyProfile(companyId: string, token: string) {
    return this.proxy.get(`${PORTFOLIO_URL}/api/profiles/company/${companyId}`, this.proxy.authHeaders(token));
  }

  getSpecialistHistory(specialistId: string, token: string) {
    return this.proxy.get(`${PORTFOLIO_URL}/api/profiles/specialist/${specialistId}/history`, this.proxy.authHeaders(token));
  }

  createReview(dto: Record<string, unknown>, token: string) {
    return this.proxy.post(`${PORTFOLIO_URL}/api/reviews`, dto, this.proxy.authHeaders(token));
  }

  listReviews(specialistId: string, token: string) {
    return this.proxy.get(`${PORTFOLIO_URL}/api/reviews/specialist/${specialistId}`, this.proxy.authHeaders(token));
  }

}
