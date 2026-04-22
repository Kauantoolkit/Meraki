import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyPublicProfile } from '../../domain/entities/company-public-profile.entity';
import { ICompanyProfileRepository } from '../../domain/repositories/i-company-profile.repository';

@Injectable()
export class CompanyProfileRepository implements ICompanyProfileRepository {
  constructor(
    @InjectRepository(CompanyPublicProfile)
    private readonly repo: Repository<CompanyPublicProfile>,
  ) {}

  findByUserId(userId: string): Promise<CompanyPublicProfile | null> {
    return this.repo.findOne({ where: { userId } });
  }

  save(profile: CompanyPublicProfile): Promise<CompanyPublicProfile> {
    return this.repo.save(profile);
  }
}
