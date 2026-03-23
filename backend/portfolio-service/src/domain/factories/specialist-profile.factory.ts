import { Injectable } from '@nestjs/common';
import { SpecialistPublicProfile } from '../entities/specialist-public-profile.entity';
import { DomainException } from '../exceptions/domain.exception';

@Injectable()
export class SpecialistProfileFactory {
  createInitial(userId: string, name?: string): SpecialistPublicProfile {
    if (!userId) throw new DomainException('userId é obrigatório para criar perfil de especialista');

    const profile = new SpecialistPublicProfile();
    profile.userId = userId;
    profile.name = name ?? null;
    profile.rating = 0;
    profile.totalProjects = 0;
    profile.completedProjects = 0;
    profile.skills = [];

    return profile;
  }
}
