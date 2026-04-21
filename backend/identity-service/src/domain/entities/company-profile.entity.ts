import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DomainException } from '../exceptions/domain.exception';

@Entity('company_profiles')
export class CompanyProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  companySize: string;

  @Column({ nullable: true })
  website: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── Domain behavior ───────────────────────────────────────────────────────

  updateCompanyName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new DomainException('Nome da empresa deve ter pelo menos 2 caracteres');
    }
    this.companyName = name.trim();
  }

  updateIndustry(industry: string): void {
    this.industry = industry?.trim() || null;
  }

  updateCompanySize(size: string): void {
    const validSizes = ['1-10', '11-50', '51-200', '201-500', '500+'];
    if (size && !validSizes.includes(size)) {
      throw new DomainException(
        `Tamanho da empresa inválido. Valores aceitos: ${validSizes.join(', ')}`,
      );
    }
    this.companySize = size || null;
  }

  updateWebsite(website: string): void {
    if (website && !/^https?:\/\/.+/.test(website)) {
      throw new DomainException('Website deve começar com http:// ou https://');
    }
    this.website = website?.trim() || null;
  }
}
