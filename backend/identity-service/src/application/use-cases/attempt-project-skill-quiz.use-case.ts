import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ISkillRepository } from '../../domain/repositories/skill.repository.interface';
import { QuizResult } from './attempt-profile-skill-quiz.use-case';

@Injectable()
export class AttemptProjectSkillQuizUseCase {
  constructor(
    @Inject('ISkillRepository')
    private readonly skillRepo: ISkillRepository,
  ) {}

  async execute(skillId: string, answers: number[], companyId: string, questionIds: string[]): Promise<QuizResult> {
    const skill = await this.skillRepo.findById(skillId);
    if (!skill) {
      throw new NotFoundException('Skill não encontrada');
    }

    if (!questionIds || questionIds.length === 0) {
      throw new BadRequestException('questionIds é obrigatório para validar as respostas');
    }

    const questions = await this.skillRepo.getQuestionsByIds(questionIds);
    if (questions.length === 0) {
      throw new BadRequestException('Questões não encontradas');
    }

    // Verify all questions belong to this skill and company
    for (const q of questions) {
      if (q.skillId !== skillId || q.createdByCompanyId !== companyId) {
        throw new BadRequestException('Questões inválidas para esta skill/empresa');
      }
    }

    if (!answers || answers.length !== questions.length) {
      throw new BadRequestException(
        `Forneça exatamente ${questions.length} respostas`,
      );
    }

    let correct = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correctIndex) correct++;
    }

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 70;

    // No SkillValidation created here — this is just an inline gate for bid
    return { passed, score, correctAnswers: correct, totalQuestions: questions.length };
  }
}
