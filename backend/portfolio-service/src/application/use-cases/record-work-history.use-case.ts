import { Injectable, Logger } from '@nestjs/common';
import { WorkHistoryRepository } from '../../infrastructure/repositories/work-history.repository';
import { SpecialistProfileRepository } from '../../infrastructure/repositories/specialist-profile.repository';

export interface RecordWorkHistoryDto {
  specialistId: string;
  projectId: string;
  amountEarned: number;
}

@Injectable()
export class RecordWorkHistoryUseCase {
  private readonly logger = new Logger(RecordWorkHistoryUseCase.name);

  constructor(
    private readonly historyRepo: WorkHistoryRepository,
    private readonly profileRepo: SpecialistProfileRepository,
  ) {}

  async execute(dto: RecordWorkHistoryDto): Promise<void> {
    await this.historyRepo.save({
      specialistId: dto.specialistId,
      projectId: dto.projectId,
      amountEarned: dto.amountEarned,
      completedAt: new Date(),
    });

    const profile = await this.profileRepo.findByUserId(dto.specialistId);
    if (profile) {
      profile.completedProjects += 1;
      profile.totalProjects += 1;
      await this.profileRepo.save(profile);
    }

    this.logger.log(`Histórico registrado para especialista ${dto.specialistId}`);
  }
}
