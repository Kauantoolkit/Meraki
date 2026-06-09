import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ISkillRepository } from '../../domain/repositories/skill.repository.interface';
import { AttemptQuizDto } from '../dto/skill.dto';

const PASS_THRESHOLD = 70;

@Injectable()
export class AttemptSkillQuizUseCase {
  constructor(
    @Inject('ISkillRepository')
    private readonly skillRepo: ISkillRepository,
  ) {}

  async execute(skillId: string, dto: AttemptQuizDto, specialistId: string) {
    const skill = await this.skillRepo.findSkillById(skillId);
    if (!skill) {
      throw new NotFoundException('Skill não encontrada');
    }

    const questions = await this.skillRepo.findQuestionsBySkillId(skillId);
    if (questions.length === 0) {
      throw new BadRequestException('Esta skill ainda não tem questões cadastradas');
    }

    if (!dto.answers || dto.answers.length !== questions.length) {
      throw new BadRequestException(
        `Envie exatamente ${questions.length} resposta(s) — uma por questão`,
      );
    }

    let correctAnswers = 0;
    for (let i = 0; i < questions.length; i++) {
      if (dto.answers[i] === questions[i].correctIndex) {
        correctAnswers++;
      }
    }

    const totalQuestions = questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= PASS_THRESHOLD;

    await this.skillRepo.createValidation({
      specialistId,
      skillId,
      skillName: skill.displayName,
      passed,
      score,
    });

    return { passed, score, correctAnswers, totalQuestions };
  }
}
