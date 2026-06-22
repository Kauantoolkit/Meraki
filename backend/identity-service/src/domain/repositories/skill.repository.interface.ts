import { Skill } from '../entities/skill.entity';
import { SkillQuestion } from '../entities/skill-question.entity';
import { SkillValidation } from '../entities/skill-validation.entity';
import { QuestionReport } from '../entities/question-report.entity';

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
  searchByName(search: string): Promise<Skill[]>;
  createSkill(data: CreateSkillData, questions: CreateQuestionData[]): Promise<Skill>;
  addQuestions(skillId: string, questions: CreateQuestionData[]): Promise<void>;
  getQuestionsBySkillId(skillId: string): Promise<SkillQuestion[]>;
  getQuestionsBySkillAndCompany(skillId: string, companyId: string): Promise<SkillQuestion[]>;
  getRandomQuestionsForSkill(skillId: string, limit: number, excludeReported?: boolean): Promise<SkillQuestion[]>;
  getQuestionsByIds(ids: string[]): Promise<SkillQuestion[]>;
  updateQuestion(id: string, data: { text?: string; options?: string[]; correctIndex?: number }): Promise<SkillQuestion>;
  softDeleteQuestion(id: string): Promise<void>;
  saveValidation(data: CreateValidationData): Promise<SkillValidation>;
  findValidation(specialistId: string, skillId: string): Promise<SkillValidation | null>;
  findValidationsBySpecialist(specialistId: string): Promise<SkillValidation[]>;
  reportQuestion(questionId: string, userId: string): Promise<QuestionReport>;
  findReport(questionId: string, userId: string): Promise<QuestionReport | null>;
  getReportCount(questionId: string): Promise<number>;
  getReportedQuestionIds(threshold: number): Promise<string[]>;
}
