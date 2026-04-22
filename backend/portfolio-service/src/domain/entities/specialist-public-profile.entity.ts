import { DomainException } from '../exceptions/domain.exception';

/** Perfil público do especialista — RF12 */
export class SpecialistPublicProfile {
  id: string;
  userId: string;
  name: string;
  bio: string;
  skills: string[];
  experience: number;
  hourlyRate: number;
  rating: number;
  totalProjects: number;
  completedProjects: number;
  createdAt: Date;
  updatedAt: Date;

  updateBio(bio: string): void {
    if (!bio || bio.trim().length === 0) {
      throw new DomainException('Bio não pode ser vazia');
    }
    this.bio = bio.trim();
  }

  addSkill(skill: string): void {
    if (!skill || skill.trim().length === 0) {
      throw new DomainException('Skill não pode ser vazia');
    }
    const trimmed = skill.trim();
    if (!this.skills) {
      this.skills = [];
    }
    if (this.skills.includes(trimmed)) {
      throw new DomainException(`Skill '${trimmed}' já existe no perfil`);
    }
    this.skills.push(trimmed);
  }

  removeSkill(skill: string): void {
    if (!this.skills || !this.skills.includes(skill)) {
      throw new DomainException(`Skill '${skill}' não encontrada no perfil`);
    }
    this.skills = this.skills.filter(s => s !== skill);
  }

  updateRating(newRating: number): void {
    if (newRating < 0 || newRating > 5) {
      throw new DomainException('Rating deve estar entre 0 e 5');
    }
    this.rating = newRating;
  }
}
