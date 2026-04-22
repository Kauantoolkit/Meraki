import { User } from '../entities/user.entity';
import { SpecialistProfile } from '../entities/specialist-profile.entity';
import { CompanyProfile } from '../entities/company-profile.entity';

export interface IUserRepository {
  // User
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Partial<User>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;

  // Specialist Profile
  createSpecialistProfile(data: Partial<SpecialistProfile>): Promise<SpecialistProfile>;
  findSpecialistProfileByUserId(userId: string): Promise<SpecialistProfile | null>;
  updateSpecialistProfile(id: string, data: Partial<SpecialistProfile>): Promise<SpecialistProfile>;

  // Company Profile
  createCompanyProfile(data: Partial<CompanyProfile>): Promise<CompanyProfile>;
  findCompanyProfileByUserId(userId: string): Promise<CompanyProfile | null>;
  updateCompanyProfile(id: string, data: Partial<CompanyProfile>): Promise<CompanyProfile>;
}
