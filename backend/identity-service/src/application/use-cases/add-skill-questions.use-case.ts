import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ISkillRepository } from '../../domain/repositories/skill.repository.interface';
import { AddQuestionsDto } from '../dto/skill.dto';

@Injectable()
export class AddSkillQuestionsUseCase {
  constructor(
    @Inject('ISkillRepository')
    private readonly skillRepo: ISkillRepository,
  ) {}

  async execute(skillId: string, dto: AddQuestionsDto, companyId: string) {
    const skill = await this.skillRepo.findSkillById(skillId);
    if (!skill) {
      throw new NotFoundException('Skill não encontrada');
    }

    if (!dto.questions || dto.questions.length === 0) {
      throw new BadRequestException('Envie pelo menos uma questão');
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

    const questions = await this.skillRepo.createQuestions(
      dto.questions.map(q => ({
        skillId,
        text: q.text.trim(),
        options: q.options,
        correctIndex: q.correctIndex,
        createdByCompanyId: companyId,
      })),
    );

    return questions;
  }
}
