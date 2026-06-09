import { api } from './client'

export interface Skill {
  id: string
  displayName: string
  name: string
  createdByCompanyId: string
  createdAt?: string
}

export interface SkillQuestion {
  id: string
  skillId: string
  text: string
  options: string[]
}

export interface SkillValidation {
  id: string
  skillId: string
  skillName: string
  passed: boolean
  score: number
  attemptedAt: string
}

export interface QuestionInput {
  text: string
  options: string[]
  correctIndex: number
}

export const skillsApi = {
  listAll: () => api.get<Skill[]>('/skills'),

  createSkill: (data: { displayName: string; questions: QuestionInput[] }) =>
    api.post<{ skill: Skill; questions: SkillQuestion[] }>('/skills', data),

  getQuestions: (skillId: string) =>
    api.get<SkillQuestion[]>(`/skills/${skillId}/questions`),

  addQuestions: (skillId: string, data: { questions: QuestionInput[] }) =>
    api.post<SkillQuestion[]>(`/skills/${skillId}/questions`, data),

  attemptQuiz: (skillId: string, data: { answers: number[] }) =>
    api.post<{ passed: boolean; score: number; correctAnswers: number; totalQuestions: number }>(
      `/skills/${skillId}/attempt`,
      data,
    ),

  getMyValidations: () => api.get<SkillValidation[]>('/skills/my-validations'),
}
