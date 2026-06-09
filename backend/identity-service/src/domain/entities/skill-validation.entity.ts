export class SkillValidation {
  id: string;
  specialistId: string;
  skillId: string;
  skillName: string; // denormalized
  passed: boolean;
  score: number; // 0-100
  attemptedAt: Date;
}
