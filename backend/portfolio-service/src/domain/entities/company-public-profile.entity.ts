import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/** Perfil público da empresa — RF13 */
@Entity('company_profiles')
export class CompanyPublicProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({ nullable: true })
  companyName: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  sector: string;

  @Column({ default: 0 })
  totalProjectsCreated: number;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
