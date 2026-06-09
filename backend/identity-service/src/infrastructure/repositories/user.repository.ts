import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { SpecialistProfile } from '../../domain/entities/specialist-profile.entity';
import { CompanyProfile } from '../../domain/entities/company-profile.entity';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import {
  IUserRepository,
  IRefreshTokenRepository,
} from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(SpecialistProfile)
    private readonly specialistRepo: Repository<SpecialistProfile>,

    @InjectRepository(CompanyProfile)
    private readonly companyRepo: Repository<CompanyProfile>,
  ) {}

  // ─── User ────────────────────────────────────────────────────────────────
  // TypeORM @DeleteDateColumn ignora soft-deleted automaticamente em find*.

  findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.userRepo.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.userRepo.softDelete(id);
  }

  // ─── SpecialistProfile ────────────────────────────────────────────────────

  async createSpecialistProfile(data: Partial<SpecialistProfile>): Promise<SpecialistProfile> {
    const profile = this.specialistRepo.create(data);
    return this.specialistRepo.save(profile);
  }

  findSpecialistProfileByUserId(userId: string): Promise<SpecialistProfile | null> {
    return this.specialistRepo.findOne({ where: { userId } });
  }

  async updateSpecialistProfile(
    id: string,
    data: Partial<SpecialistProfile>,
  ): Promise<SpecialistProfile> {
    await this.specialistRepo.update(id, data);
    return this.specialistRepo.findOne({ where: { id } });
  }

  // ─── CompanyProfile ────────────────────────────────────────────────────────

  async createCompanyProfile(data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    const profile = this.companyRepo.create(data);
    return this.companyRepo.save(profile);
  }

  findCompanyProfileByUserId(userId: string): Promise<CompanyProfile | null> {
    return this.companyRepo.findOne({ where: { userId } });
  }

  async updateCompanyProfile(
    id: string,
    data: Partial<CompanyProfile>,
  ): Promise<CompanyProfile> {
    await this.companyRepo.update(id, data);
    return this.companyRepo.findOne({ where: { id } });
  }

  async getAllSkills(): Promise<string[]> {
    const profiles = await this.specialistRepo.find({ select: ['skills'] });
    const fromProfiles = profiles.flatMap(p => p.skills ?? []);
    const seed = [
      'javascript', 'typescript', 'python', 'java', 'kotlin', 'swift', 'go', 'rust', 'c#', 'c++',
      'react', 'vue', 'angular', 'nextjs', 'nestjs', 'nodejs', 'express', 'fastapi', 'django', 'spring boot',
      'flutter', 'react native', 'android', 'ios',
      'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
      'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'terraform',
      'graphql', 'rest api', 'grpc', 'rabbitmq', 'kafka',
      'git', 'ci/cd', 'linux', 'figma', 'tailwindcss',
    ];
    const all = [...new Set([...seed, ...fromProfiles.map(s => s.toLowerCase().trim())])];
    return all.filter(Boolean).sort();
  }
}

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
  ) {}

  async create(data: Partial<RefreshToken>): Promise<RefreshToken> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  findByJti(jti: string): Promise<RefreshToken | null> {
    return this.repo.findOne({ where: { jti } });
  }

  async revoke(jti: string, replacedByJti?: string): Promise<void> {
    await this.repo.update(
      { jti, revokedAt: IsNull() },
      { revokedAt: new Date(), replacedByJti: replacedByJti ?? null },
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repo.update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() });
  }
}
