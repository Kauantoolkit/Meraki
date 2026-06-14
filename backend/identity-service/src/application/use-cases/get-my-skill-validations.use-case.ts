import { Injectable, Inject } from '@nestjs/common';
import { ISkillRepository } from '../../domain/repositories/skill.repository.interface';
import { SkillValidation } from '../../domain/entities/skill-validation.entity';

@Injectable()
export class GetMySkillValidationsUseCase {
  constructor(
    @Inject('ISkillRepository')
    private readonly skillRepo: ISkillRepository,
  ) {}

  execute(specialistId: string): Promise<SkillValidation[]> {
    return this.skillRepo.findValidationsBySpecialist(specialistId);
  }
}
