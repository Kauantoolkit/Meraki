import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  experience: number; // anos de experiência

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  hourlyRate: number; // valor por hora

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number; // 0.00 a 5.00

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
