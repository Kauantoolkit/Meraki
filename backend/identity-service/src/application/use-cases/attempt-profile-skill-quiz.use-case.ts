import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ISkillRepository } from '../../domain/repositories/skill.repository.interface';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

export interface QuizResult {
  passed: boolean;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

@Injectable()
export class AttemptProfileSkillQuizUseCase {
  constructor(
    @Inject('ISkillRepository')
    private readonly skillRepo: ISkillRepository,

    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(skillId: string, answers: number[], specialistUserId: string, questionIds: string[]): Promise<QuizResult> {
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

    // Save validation record
    await this.skillRepo.saveValidation({
      specialistId: specialistUserId,
      skillId,
      skillName: skill.name,
      passed,
      score,
    });

    // If passed, update the specialist profile with yellow badge
    if (passed) {
      const user = await this.userRepo.findById(specialistUserId);
      if (user?.specialistId) {
        const profile = await this.userRepo.findSpecialistProfileByUserId(specialistUserId);
        if (profile) {
          const badges = profile.skillBadges ?? {};
          // Only set to yellow if not already green
          if (badges[skill.name] !== 'green') {
            badges[skill.name] = 'yellow';
          }
          const skills = profile.skills ?? [];
          if (!skills.includes(skill.name)) {
            skills.push(skill.name);
          }
          await this.userRepo.updateSpecialistProfile(profile.id, {
            skillBadges: badges,
            skills,
          });
        }
      }
    }

    return { passed, score, correctAnswers: correct, totalQuestions: questions.length };
  }
}
