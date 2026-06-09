export class SkillQuestion {
  id: string;
  skillId: string;
  text: string;
  options: string[]; // always 4 options
  correctIndex: number; // 0-3
  createdByCompanyId: string;
  createdAt: Date;
}
