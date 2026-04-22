import { CompanyPublicProfile } from '../entities/company-public-profile.entity';

export interface ICompanyProfileRepository {
  findByUserId(userId: string): Promise<CompanyPublicProfile | null>;
  save(profile: CompanyPublicProfile): Promise<CompanyPublicProfile>;
}
