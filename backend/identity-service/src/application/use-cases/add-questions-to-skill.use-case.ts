import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { ISkillRepository } from '../../domain/repositories/skill.repository.interface';
import { CreateQuestionDto } from './create-skill.use-case';

@Injectable()
export class AddQuestionsToSkillUseCase {
  constructor(
    @Inject('ISkillRepository')
    private readonly skillRepo: ISkillRepository,
  ) {}

  async execute(skillId: string, questions: CreateQuestionDto[], companyId: string): Promise<void> {
    const skill = await this.skillRepo.findById(skillId);
    if (!skill) {
      throw new NotFoundException('Skill não encontrada');
    }
    if (!questions || questions.length === 0) {
      throw new BadRequestException('Forneça pelo menos uma questão');
    }
    for (const q of questions) {
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

    await this.skillRepo.addQuestions(
      skillId,
      questions.map(q => ({
        text: q.text.trim(),
        options: q.options,
        correctIndex: q.correctIndex,
        createdByCompanyId: companyId,
      })),
    );
  }
}
