import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Skill } from '../../domain/entities/skill.entity';
import { SkillQuestion } from '../../domain/entities/skill-question.entity';
import { SkillValidation } from '../../domain/entities/skill-validation.entity';
import {
  ISkillRepository,
  CreateSkillData,
  CreateQuestionData,
  CreateValidationData,
} from '../../domain/repositories/skill.repository.interface';

@Injectable()
export class SkillRepository implements ISkillRepository {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,

    @InjectRepository(SkillQuestion)
    private readonly questionRepo: Repository<SkillQuestion>,

    @InjectRepository(SkillValidation)
    private readonly validationRepo: Repository<SkillValidation>,
  ) {}

  findAll(): Promise<Skill[]> {
    return this.skillRepo.find({ order: { displayName: 'ASC' } });
  }

  findById(id: string): Promise<Skill | null> {
    return this.skillRepo.findOne({ where: { id } });
  }

  findByName(name: string): Promise<Skill | null> {
    return this.skillRepo.findOne({ where: { name: name.toLowerCase() } });
  }

  async createSkill(data: CreateSkillData, questions: CreateQuestionData[]): Promise<Skill> {
    const skill = this.skillRepo.create({
      name: data.displayName.trim().toLowerCase(),
      displayName: data.displayName.trim(),
      createdByCompanyId: data.createdByCompanyId,
    });
    const saved = await this.skillRepo.save(skill);

    if (questions.length > 0) {
      const qEntities = questions.map(q =>
        this.questionRepo.create({
          skillId: saved.id,
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          createdByCompanyId: q.createdByCompanyId,
        }),
      );
      await this.questionRepo.save(qEntities);
    }

    return saved;
  }

  async addQuestions(skillId: string, questions: CreateQuestionData[]): Promise<void> {
    const qEntities = questions.map(q =>
      this.questionRepo.create({
        skillId,
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        createdByCompanyId: q.createdByCompanyId,
      }),
    );
    await this.questionRepo.save(qEntities);
  }

  getQuestionsBySkillId(skillId: string): Promise<SkillQuestion[]> {
    return this.questionRepo.find({ where: { skillId } });
  }

  getQuestionsBySkillAndCompany(skillId: string, companyId: string): Promise<SkillQuestion[]> {
    return this.questionRepo.find({ where: { skillId, createdByCompanyId: companyId } });
  }

  async getRandomQuestionsForSkill(skillId: string, limit: number): Promise<SkillQuestion[]> {
    const all = await this.questionRepo.find({ where: { skillId } });
    // Fisher-Yates shuffle then slice
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, limit);
  }

  async getQuestionsByIds(ids: string[]): Promise<SkillQuestion[]> {
    if (!ids || ids.length === 0) return [];
    const questions = await this.questionRepo.find({ where: { id: In(ids) } });
    // Return in the same order as ids for deterministic scoring
    return ids.map(id => questions.find(q => q.id === id)).filter(Boolean) as SkillQuestion[];
  }

  async saveValidation(data: CreateValidationData): Promise<SkillValidation> {
    const validation = this.validationRepo.create({
      specialistId: data.specialistId,
      skillId: data.skillId,
      skillName: data.skillName,
      passed: data.passed,
      score: data.score,
    });
    return this.validationRepo.save(validation);
  }

  findValidation(specialistId: string, skillId: string): Promise<SkillValidation | null> {
    return this.validationRepo.findOne({
      where: { specialistId, skillId },
      order: { attemptedAt: 'DESC' },
    });
  }

  findValidationsBySpecialist(specialistId: string): Promise<SkillValidation[]> {
    return this.validationRepo.find({
      where: { specialistId },
      order: { attemptedAt: 'DESC' },
    });
  }
}
