import { Injectable, NotFoundException } from '@nestjs/common';
import { SpecialistProfileRepository } from '../../infrastructure/repositories/specialist-profile.repository';
import { WorkHistoryRepository } from '../../infrastructure/repositories/work-history.repository';

@Injectable()
export class GetPublicProfileUseCase {
  constructor(
    private readonly profileRepo: SpecialistProfileRepository,
    private readonly historyRepo: WorkHistoryRepository,
  ) {}

  async getSpecialistProfile(specialistId: string) {
    const profile = await this.profileRepo.findByUserId(specialistId);
    if (!profile) throw new NotFoundException('Perfil não encontrado');
    return profile;
  }

  getWorkHistory(specialistId: string) {
    return this.historyRepo.findBySpecialist(specialistId);
  }
}
