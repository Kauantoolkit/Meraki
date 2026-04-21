import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DomainException } from '../exceptions/domain.exception';

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

  updateCompanyInfo(companyName: string, sector?: string): void {
    if (!companyName || companyName.trim().length === 0) {
      throw new DomainException('Nome da empresa não pode ser vazio');
    }
    this.companyName = companyName.trim();
    if (sector !== undefined) {
      this.sector = sector.trim();
    }
  }

  updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new DomainException('Descrição não pode ser vazia');
    }
    this.description = description.trim();
  }
}
