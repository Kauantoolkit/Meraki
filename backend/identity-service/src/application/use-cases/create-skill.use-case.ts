import {
  Injectable,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ISkillRepository } from '../../domain/repositories/skill.repository.interface';
import { CreateSkillDto } from '../dto/skill.dto';

@Injectable()
export class CreateSkillUseCase {
  constructor(
    @Inject('ISkillRepository')
    private readonly skillRepo: ISkillRepository,
  ) {}

  async execute(dto: CreateSkillDto, companyId: string) {
    if (!dto.displayName || dto.displayName.trim().length === 0) {
      throw new BadRequestException('displayName é obrigatório');
    }
    if (!dto.questions || dto.questions.length < 3) {
      throw new BadRequestException('São necessárias pelo menos 3 questões para criar uma skill');
    }

    for (const q of dto.questions) {
      if (!q.text || q.text.trim().length === 0) {
        throw new BadRequestException('Cada questão deve ter um texto');
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new BadRequestException('Cada questão deve ter exatamente 4 opções');
      }
      if (q.correctIndex < 0 || q.correctIndex > 3) {
        throw new BadRequestException('correctIndex deve ser entre 0 e 3');
      }
    }

    const name = dto.displayName.trim().toLowerCase();

    const existing = await this.skillRepo.findSkillByName(name);
    if (existing) {
      throw new ConflictException(`Skill "${dto.displayName}" já existe`);
    }

    const skill = await this.skillRepo.createSkill({
      name,
      displayName: dto.displayName.trim(),
      createdByCompanyId: companyId,
    });

    const questions = await this.skillRepo.createQuestions(
      dto.questions.map(q => ({
        skillId: skill.id,
        text: q.text.trim(),
        options: q.options,
        correctIndex: q.correctIndex,
        createdByCompanyId: companyId,
      })),
    );

    return { skill, questions };
  }
}
