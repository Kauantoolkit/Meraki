import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpecialistPublicProfile } from '../../domain/entities/specialist-public-profile.entity';
import { ISpecialistProfileRepository } from '../../domain/repositories/i-specialist-profile.repository';

@Injectable()
export class SpecialistProfileRepository implements ISpecialistProfileRepository {
  constructor(
    @InjectRepository(SpecialistPublicProfile)
    private readonly repo: Repository<SpecialistPublicProfile>,
  ) {}

  findByUserId(userId: string): Promise<SpecialistPublicProfile | null> {
    return this.repo.findOne({ where: { userId } });
  }

  save(profile: SpecialistPublicProfile): Promise<SpecialistPublicProfile> {
    return this.repo.save(profile);
  }

  async updateRating(userId: string, rating: number): Promise<void> {
    await this.repo.update({ userId }, { rating: parseFloat(rating.toFixed(2)) });
  }
}
