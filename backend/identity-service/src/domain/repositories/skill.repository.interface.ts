import { Skill } from '../entities/skill.entity';
import { SkillQuestion } from '../entities/skill-question.entity';
import { SkillValidation } from '../entities/skill-validation.entity';

export interface CreateSkillData {
  displayName: string;
  createdByCompanyId: string;
}

export interface CreateQuestionData {
  text: string;
  options: string[];
  correctIndex: number;
  createdByCompanyId: string;
}

export interface CreateValidationData {
  specialistId: string;
  skillId: string;
  skillName: string;
  passed: boolean;
  score: number;
}

export interface ISkillRepository {
  findAll(): Promise<Skill[]>;
  findById(id: string): Promise<Skill | null>;
  findByName(name: string): Promise<Skill | null>;
  createSkill(data: CreateSkillData, questions: CreateQuestionData[]): Promise<Skill>;
  addQuestions(skillId: string, questions: CreateQuestionData[]): Promise<void>;
  getQuestionsBySkillId(skillId: string): Promise<SkillQuestion[]>;
  getQuestionsBySkillAndCompany(skillId: string, companyId: string): Promise<SkillQuestion[]>;
  getRandomQuestionsForSkill(skillId: string, limit: number): Promise<SkillQuestion[]>;
  getQuestionsByIds(ids: string[]): Promise<SkillQuestion[]>;
  saveValidation(data: CreateValidationData): Promise<SkillValidation>;
  findValidation(specialistId: string, skillId: string): Promise<SkillValidation | null>;
  findValidationsBySpecialist(specialistId: string): Promise<SkillValidation[]>;
}
