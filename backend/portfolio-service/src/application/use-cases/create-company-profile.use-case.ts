import { Injectable, Logger } from '@nestjs/common';
import { CompanyProfileRepository } from '../../infrastructure/repositories/company-profile.repository';
import { CompanyPublicProfile } from '../../domain/entities/company-public-profile.entity';

@Injectable()
export class CreateCompanyProfileUseCase {
  private readonly logger = new Logger(CreateCompanyProfileUseCase.name);

  constructor(private readonly companyProfileRepo: CompanyProfileRepository) {}

  async execute(userId: string, companyName?: string): Promise<void> {
    const existing = await this.companyProfileRepo.findByUserId(userId);
    if (existing) return;

    const profile = new CompanyPublicProfile();
    profile.userId = userId;
    profile.companyName = companyName || '';
    profile.totalProjectsCreated = 0;
    profile.rating = 0;

    await this.companyProfileRepo.save(profile);
    this.logger.log(`Perfil público de empresa criado para ${userId}`);
  }
}
