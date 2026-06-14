import { Injectable, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { ISkillRepository } from '../../domain/repositories/skill.repository.interface';
import { Skill } from '../../domain/entities/skill.entity';

export interface CreateQuestionDto {
  text: string;
  options: string[]; // exactly 4
  correctIndex: number; // 0-3
}

export interface CreateSkillDto {
  displayName: string;
  questions: CreateQuestionDto[];
}

@Injectable()
export class CreateSkillUseCase {
  constructor(
    @Inject('ISkillRepository')
    private readonly skillRepo: ISkillRepository,
  ) {}

  async execute(dto: CreateSkillDto, companyId: string): Promise<Skill> {
    if (!dto.displayName || dto.displayName.trim().length < 2) {
      throw new BadRequestException('Nome da skill deve ter pelo menos 2 caracteres');
    }
    if (!dto.questions || dto.questions.length < 10) {
      throw new BadRequestException('Mínimo de 10 questões para criar uma skill');
    }
    for (const q of dto.questions) {
      if (!q.text || q.text.trim().length === 0) {
        throw new BadRequestException('Cada questão deve ter um enunciado');
      }
      if (!q.options || q.options.length !== 4) {
        throw new BadRequestException('Cada questão deve ter exatamente 4 opções');
      }
      if (q.correctIndex < 0 || q.correctIndex > 3) {
        throw new BadRequestException('correctIndex deve ser entre 0 e 3');
      }
    }

    const existing = await this.skillRepo.findByName(dto.displayName.trim());
    if (existing) {
      throw new ConflictException(`Skill "${dto.displayName.trim()}" já existe no catálogo`);
    }

    return this.skillRepo.createSkill(
      { displayName: dto.displayName, createdByCompanyId: companyId },
      dto.questions.map(q => ({
        text: q.text.trim(),
        options: q.options,
        correctIndex: q.correctIndex,
        createdByCompanyId: companyId,
      })),
    );
  }
}
