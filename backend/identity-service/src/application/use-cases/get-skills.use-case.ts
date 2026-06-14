import { Injectable, Inject } from '@nestjs/common';
import { ISkillRepository } from '../../domain/repositories/skill.repository.interface';
import { Skill } from '../../domain/entities/skill.entity';

@Injectable()
export class GetSkillsUseCase {
  constructor(
    @Inject('ISkillRepository')
    private readonly skillRepo: ISkillRepository,
  ) {}

  execute(): Promise<Skill[]> {
    return this.skillRepo.findAll();
  }
}
