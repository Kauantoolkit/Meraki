import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';
import { UpdatePortfolioProfileDto } from './dto/update-profile.dto';
import { AddSkillDto } from './dto/add-skill.dto';
import { AddCertificationDto } from './dto/add-certification.dto';

const PORTFOLIO_URL = process.env.PORTFOLIO_SERVICE_URL as string;

@Injectable()
export class PortfolioService {
  constructor(private readonly proxy: HttpProxyService) {}

  getMyPortfolio(token: string) {
    return this.proxy.get(`${PORTFOLIO_URL}/api/portfolio/me`, this.proxy.authHeaders(token));
  }

  updateProfile(dto: UpdatePortfolioProfileDto, token: string) {
    return this.proxy.patch(`${PORTFOLIO_URL}/api/portfolio/me`, dto, this.proxy.authHeaders(token));
  }

  addSkill(dto: AddSkillDto, token: string) {
    return this.proxy.post(`${PORTFOLIO_URL}/api/portfolio/me/skills`, dto, this.proxy.authHeaders(token));
  }

  addCertification(dto: AddCertificationDto, token: string) {
    return this.proxy.post(`${PORTFOLIO_URL}/api/portfolio/me/certifications`, dto, this.proxy.authHeaders(token));
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
}
