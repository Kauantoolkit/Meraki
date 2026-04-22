import { Injectable } from '@nestjs/common';
import { CompanyProfileRepository } from '../../infrastructure/repositories/company-profile.repository';
import { CreateCompanyProfileUseCase } from './create-company-profile.use-case';

@Injectable()
export class GetCompanyProfileUseCase {
  constructor(
    private readonly companyProfileRepo: CompanyProfileRepository,
    private readonly createCompanyProfile: CreateCompanyProfileUseCase,
  ) {}

  async execute(companyId: string) {
    let profile = await this.companyProfileRepo.findByUserId(companyId);
    if (!profile) {
      await this.createCompanyProfile.execute(companyId);
      profile = await this.companyProfileRepo.findByUserId(companyId);
    }
    return profile;
  }
}
