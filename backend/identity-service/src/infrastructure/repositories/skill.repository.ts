import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../../domain/entities/skill.entity';
import { SkillQuestion } from '../../domain/entities/skill-question.entity';
import { SkillValidation } from '../../domain/entities/skill-validation.entity';
import { ISkillRepository } from '../../domain/repositories/skill.repository.interface';

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

  findAllSkills(): Promise<Skill[]> {
    return this.skillRepo.find({ order: { displayName: 'ASC' } });
  }

  findSkillById(id: string): Promise<Skill | null> {
    return this.skillRepo.findOne({ where: { id } });
  }

  findSkillByName(name: string): Promise<Skill | null> {
    return this.skillRepo.findOne({ where: { name } });
  }

  async createSkill(data: Partial<Skill>): Promise<Skill> {
    const skill = this.skillRepo.create(data);
    return this.skillRepo.save(skill);
  }

  findQuestionsBySkillId(skillId: string): Promise<SkillQuestion[]> {
    return this.questionRepo.find({ where: { skillId } });
  }

  async createQuestions(data: Partial<SkillQuestion>[]): Promise<SkillQuestion[]> {
    const entities = this.questionRepo.create(data);
    return this.questionRepo.save(entities);
  }

  findValidationsBySpecialistId(specialistId: string): Promise<SkillValidation[]> {
    return this.validationRepo.find({
      where: { specialistId },
      order: { attemptedAt: 'DESC' },
    });
  }

  async createValidation(data: Partial<SkillValidation>): Promise<SkillValidation> {
    const entity = this.validationRepo.create(data);
    return this.validationRepo.save(entity);
  }
}
