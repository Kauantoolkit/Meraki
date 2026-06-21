import { api } from './client'

export interface Skill {
  id: string
  name: string
  displayName: string
  createdByCompanyId: string
  createdAt?: string
}

export interface SkillQuestion {
  id: string
  skillId: string
  text: string
  options: string[] // correctIndex NOT included
}

export interface SkillValidation {
  id: string
  skillId: string
  skillName: string
  passed: boolean
  score: number
  attemptedAt: string
}

export interface QuizResult {
  passed: boolean
  score: number
  correctAnswers: number
  totalQuestions: number
}

export interface CreateQuestionDto {
  text: string
  options: string[] // exactly 4
  correctIndex: number // 0-3
}

export const skillsApi = {
  getAll: () => api.get<Skill[]>('/skills'),

  search: (q: string) => api.get<Skill[]>(`/skills/search?q=${encodeURIComponent(q)}`),

  create: (data: { displayName: string; questions: CreateQuestionDto[] }) =>
    api.post<Skill>('/skills', data),

  addQuestions: (skillId: string, questions: CreateQuestionDto[]) =>
    api.post(`/skills/${skillId}/questions`, { questions }),

  getQuestions: (skillId: string) =>
    api.get<(SkillQuestion & { correctIndex: number })[]>(`/skills/${skillId}/questions`),

  getRandomQuestions: (skillId: string) =>
    api.get<SkillQuestion[]>(`/skills/${skillId}/questions/random`),

  getCompanyQuestions: (skillId: string, companyId: string) =>
    api.get<SkillQuestion[]>(`/skills/${skillId}/questions/by-company/${companyId}`),

  attemptProfile: (skillId: string, answers: number[], questionIds: string[]) =>
    api.post<QuizResult>(`/skills/${skillId}/attempt-profile`, { answers, questionIds }),

  attemptProject: (skillId: string, answers: number[], companyId: string, questionIds: string[]) =>
    api.post<QuizResult>(`/skills/${skillId}/attempt-project`, { answers, companyId, questionIds }),

  updateQuestion: (questionId: string, data: { text?: string; options?: string[]; correctIndex?: number }) =>
    api.patch(`/skills/questions/${questionId}`, data),

  deleteQuestion: (questionId: string) =>
    api.delete(`/skills/questions/${questionId}`),

  getMyValidations: () => api.get<SkillValidation[]>('/skills/my-validations'),
}
