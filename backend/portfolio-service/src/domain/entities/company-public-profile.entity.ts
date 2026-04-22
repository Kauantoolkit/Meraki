import { DomainException } from '../exceptions/domain.exception';

/** Perfil público da empresa — RF13 */
export class CompanyPublicProfile {
  id: string;
  userId: string;
  companyName: string;
  description: string;
  website: string;
  sector: string;
  totalProjectsCreated: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;

  updateCompanyInfo(companyName: string, sector?: string): void {
    if (!companyName || companyName.trim().length === 0) {
      throw new DomainException('Nome da empresa não pode ser vazio');
    }
    this.companyName = companyName.trim();
    if (sector !== undefined) {
      this.sector = sector.trim();
    }
  }

  updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new DomainException('Descrição não pode ser vazia');
    }
    this.description = description.trim();
  }
}
