import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyProfileRepository } from '../../infrastructure/repositories/company-profile.repository';

@Injectable()
export class GetCompanyProfileUseCase {
  constructor(private readonly companyProfileRepo: CompanyProfileRepository) {}

  async execute(companyId: string) {
    const profile = await this.companyProfileRepo.findByUserId(companyId);
    if (!profile) throw new NotFoundException('Perfil de empresa não encontrado');
    return profile;
  }
}
