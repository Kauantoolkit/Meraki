import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DomainException } from '../exceptions/domain.exception';

/** Perfil público do especialista — RF12 */
@Entity('specialist_profiles')
export class SpecialistPublicProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({ nullable: true })
  name: string;

  @Column('text', { nullable: true })
  bio: string;

  @Column('simple-array', { nullable: true })
  skills: string[];

  @Column({ nullable: true })
  experience: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  totalProjects: number;

  @Column({ default: 0 })
  completedProjects: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
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
