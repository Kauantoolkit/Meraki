import { Injectable, ForbiddenException, UnprocessableEntityException } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';

const BIDDING_URL    = process.env.BIDDING_SERVICE_URL    as string;
const PROJECT_URL    = process.env.PROJECT_SERVICE_URL    as string;
const IDENTITY_URL   = process.env.IDENTITY_SERVICE_URL   as string;
const PORTFOLIO_URL  = process.env.PORTFOLIO_SERVICE_URL  as string;

@Injectable()
export class BidsService {
  constructor(private readonly proxy: HttpProxyService) {}

  async submit(projectId: string, dto: Record<string, any>, token: string) {
    // ACL: verifica se o projeto está OPEN antes de encaminhar ao bidding-service
    const project = await this.proxy.get<any>(
      `${PROJECT_URL}/api/projects/${projectId}`,
      this.proxy.authHeaders(token),
    );
    if (project.status !== 'OPEN') {
      throw new UnprocessableEntityException(
        `Não é possível submeter propostas para projetos com status "${project.status}"`,
      );
    }
    return this.proxy.post(`${BIDDING_URL}/api/bids`, { ...dto, projectId }, this.proxy.authHeaders(token));
  }

  async findByProject(projectId: string, token: string, requestorCompanyId: string) {
    const project = await this.proxy.get<any>(
      `${PROJECT_URL}/api/projects/${projectId}`,
      this.proxy.authHeaders(token),
    );
    if (project.companyId !== requestorCompanyId) {
      throw new ForbiddenException('Acesso negado: você não é o dono deste projeto');
    }
    const bids: any[] = await this.proxy.get(`${BIDDING_URL}/api/bids?projectId=${projectId}`, this.proxy.authHeaders(token));

    // Enrich bids: resolve specialistId → userId via identity internal API, then get name from portfolio
    const uniqueIds = [...new Set(bids.map((b: any) => b.specialistId).filter(Boolean))] as string[];
    const nameMap = new Map<string, string>();
    const userIdMap = new Map<string, string>();
    const apiKey = process.env.INTERNAL_API_KEY || 'meraki-internal-key';
    await Promise.all(
      uniqueIds.map(async (specId) => {
        try {
          const user = await this.proxy.get<any>(
            `${IDENTITY_URL}/api/internal/users/by-specialist/${specId}`,
            { headers: { 'X-API-Key': apiKey } },
          );
          if (user?.id) {
            userIdMap.set(specId, user.id);
            if (user.name) nameMap.set(specId, user.name);
          }
        } catch {}
      })
    );

    return bids.map((b: any) => ({
      ...b,
      specialistName: nameMap.get(b.specialistId) ?? null,
      specialistUserId: userIdMap.get(b.specialistId) ?? null,
    }));
  }

  findMyBids(token: string) {
    return this.proxy.get(`${BIDDING_URL}/api/bids/my-bids`, this.proxy.authHeaders(token));
  }

  findOne(id: string, token: string) {
    return this.proxy.get(`${BIDDING_URL}/api/bids/${id}`, this.proxy.authHeaders(token));
  }

  async accept(bidId: string, token: string, requestorCompanyId: string) {
    await this.assertProjectOwnership(bidId, token, requestorCompanyId);
    return this.proxy.put(`${BIDDING_URL}/api/bids/${bidId}/accept`, {}, this.proxy.authHeaders(token));
  }

  async reject(bidId: string, token: string, requestorCompanyId: string) {
    await this.assertProjectOwnership(bidId, token, requestorCompanyId);
    return this.proxy.put(`${BIDDING_URL}/api/bids/${bidId}/reject`, {}, this.proxy.authHeaders(token));
  }

  update(bidId: string, dto: Record<string, any>, token: string) {
    return this.proxy.put(`${BIDDING_URL}/api/bids/${bidId}`, dto, this.proxy.authHeaders(token));
  }

  withdraw(bidId: string, token: string) {
    return this.proxy.put(`${BIDDING_URL}/api/bids/${bidId}/withdraw`, {}, this.proxy.authHeaders(token));
  }

  sendMessage(bidId: string, message: string, token: string) {
    return this.proxy.post(`${BIDDING_URL}/api/bids/${bidId}/messages`, { message }, this.proxy.authHeaders(token));
  }

  getMessages(bidId: string, token: string) {
    return this.proxy.get(`${BIDDING_URL}/api/bids/${bidId}/messages`, this.proxy.authHeaders(token));
  }

  /**
   * ACL: verifica que a empresa autenticada é dona do projeto ao qual a bid pertence.
   * Padrão Anti-Corruption Layer — o gateway resolve a dependência cross-BC sem acoplar
   * o bidding-service ao project-service.
   */
  private async assertProjectOwnership(bidId: string, token: string, requestorCompanyId: string) {
    const bid = await this.proxy.get<any>(
      `${BIDDING_URL}/api/bids/${bidId}`,
      this.proxy.authHeaders(token),
    );
    const project = await this.proxy.get<any>(
      `${PROJECT_URL}/api/projects/${bid.projectId}`,
      this.proxy.authHeaders(token),
    );
    if (project.companyId !== requestorCompanyId) {
      throw new ForbiddenException('Acesso negado: você não é o dono deste projeto');
    }
  }
}
