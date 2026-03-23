import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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
}
