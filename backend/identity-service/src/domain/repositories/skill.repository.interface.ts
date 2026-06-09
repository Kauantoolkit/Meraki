import { Skill } from '../entities/skill.entity';
import { SkillQuestion } from '../entities/skill-question.entity';
import { SkillValidation } from '../entities/skill-validation.entity';

export interface ISkillRepository {
  // Skills
  findAllSkills(): Promise<Skill[]>;
  findSkillById(id: string): Promise<Skill | null>;
  findSkillByName(name: string): Promise<Skill | null>;
  createSkill(data: Partial<Skill>): Promise<Skill>;

  // Questions
  findQuestionsBySkillId(skillId: string): Promise<SkillQuestion[]>;
  createQuestions(data: Partial<SkillQuestion>[]): Promise<SkillQuestion[]>;

  // Validations
  findValidationsBySpecialistId(specialistId: string): Promise<SkillValidation[]>;
  createValidation(data: Partial<SkillValidation>): Promise<SkillValidation>;
}
