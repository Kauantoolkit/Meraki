import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DomainException } from '../exceptions/domain.exception';

@Entity('specialist_profiles')
export class SpecialistProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column('simple-array', { nullable: true, default: '' })
  skills: string[];

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 0 })
  experience: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── Domain behavior ───────────────────────────────────────────────────────

  updateBio(bio: string): void {
    if (bio && bio.length > 2000) {
      throw new DomainException('Bio não pode exceder 2000 caracteres');
    }
    this.bio = bio?.trim() || null;
  }

  addSkill(skill: string): void {
    const trimmed = skill.trim().toLowerCase();
    if (!trimmed) {
      throw new DomainException('Skill não pode ser vazia');
    }
    if (!this.skills) this.skills = [];
    if (this.skills.includes(trimmed)) {
      throw new DomainException(`Skill "${trimmed}" já existe no perfil`);
    }
    this.skills.push(trimmed);
  }

  removeSkill(skill: string): void {
    const trimmed = skill.trim().toLowerCase();
    if (!this.skills || !this.skills.includes(trimmed)) {
      throw new DomainException(`Skill "${trimmed}" não encontrada no perfil`);
    }
    this.skills = this.skills.filter((s) => s !== trimmed);
  }

  updateExperience(years: number): void {
    if (years < 0 || years > 70) {
      throw new DomainException('Experiência deve ser entre 0 e 70 anos');
    }
    this.experience = years;
  }

  updateHourlyRate(rate: number): void {
    if (rate < 0) {
      throw new DomainException('Valor por hora não pode ser negativo');
    }
    this.hourlyRate = rate;
  }

  updateRating(rating: number): void {
    if (rating < 0 || rating > 5) {
      throw new DomainException('Rating deve ser entre 0 e 5');
    }
    this.rating = rating;
  }
}
