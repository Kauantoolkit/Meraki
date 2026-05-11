import { User } from '../entities/user.entity';
import { SpecialistProfile } from '../entities/specialist-profile.entity';
import { CompanyProfile } from '../entities/company-profile.entity';
import { RefreshToken } from '../entities/refresh-token.entity';

export interface IUserRepository {
  // User
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Partial<User>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  softDelete(id: string): Promise<void>;

  // Specialist Profile
  createSpecialistProfile(data: Partial<SpecialistProfile>): Promise<SpecialistProfile>;
  findSpecialistProfileByUserId(userId: string): Promise<SpecialistProfile | null>;
  updateSpecialistProfile(id: string, data: Partial<SpecialistProfile>): Promise<SpecialistProfile>;

  // Company Profile
  createCompanyProfile(data: Partial<CompanyProfile>): Promise<CompanyProfile>;
  findCompanyProfileByUserId(userId: string): Promise<CompanyProfile | null>;
  updateCompanyProfile(id: string, data: Partial<CompanyProfile>): Promise<CompanyProfile>;
}

export interface IRefreshTokenRepository {
  create(data: Partial<RefreshToken>): Promise<RefreshToken>;
  findByJti(jti: string): Promise<RefreshToken | null>;
  revoke(jti: string, replacedByJti?: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}
