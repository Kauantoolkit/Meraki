import { Injectable, Logger } from '@nestjs/common';
import { SpecialistProfileRepository } from '../../infrastructure/repositories/specialist-profile.repository';
import { SpecialistProfileFactory } from '../../domain/factories/specialist-profile.factory';

@Injectable()
export class CreateSpecialistProfileUseCase {
  private readonly logger = new Logger(CreateSpecialistProfileUseCase.name);

  constructor(
    private readonly profileRepo: SpecialistProfileRepository,
    private readonly profileFactory: SpecialistProfileFactory,
  ) {}

  async execute(userId: string, name?: string, identitySpecialistId?: string): Promise<void> {
    const existing = await this.profileRepo.findByUserId(userId);
    if (existing) {
      if (identitySpecialistId && !existing.identitySpecialistId) {
        existing.identitySpecialistId = identitySpecialistId;
        await this.profileRepo.save(existing);
      }
      return;
    }

    const profile = this.profileFactory.createInitial(userId, name);
    if (identitySpecialistId) profile.identitySpecialistId = identitySpecialistId;
    await this.profileRepo.save(profile);
    this.logger.log(`Perfil público criado para especialista ${userId}`);
  }
}
