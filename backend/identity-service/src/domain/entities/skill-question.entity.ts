export class SkillQuestion {
  id: string;
  skillId: string;
  text: string;
  options: string[]; // stored as JSON
  correctIndex: number; // 0-3
  createdByCompanyId: string;
}
