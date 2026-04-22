import { Injectable, Logger } from '@nestjs/common';
import { SpecialistProfileRepository } from '../../infrastructure/repositories/specialist-profile.repository';

@Injectable()
export class UpdateCompletedProjectsUseCase {
  private readonly logger = new Logger(UpdateCompletedProjectsUseCase.name);

  constructor(private readonly profileRepo: SpecialistProfileRepository) {}

  async execute(specialistId: string): Promise<void> {
    const profile = await this.profileRepo.findByUserId(specialistId);
    if (!profile) {
      this.logger.warn(`Perfil não encontrado para specialistId=${specialistId}`);
      return;
    }

    profile.completedProjects = (profile.completedProjects ?? 0) + 1;
    await this.profileRepo.save(profile);
  }
}
