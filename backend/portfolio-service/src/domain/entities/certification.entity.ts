import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { DomainException } from '../exceptions/domain.exception';

@Entity('certifications')
export class Certification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  specialistId: string;

  @Column()
  name: string;

  @Column()
  issuer: string;

  @Column({ nullable: true })
  issueDate: Date;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  credentialId: string;

  @Column({ nullable: true })
  credentialUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  isExpired(): boolean {
    if (!this.expiryDate) {
      return false;
    }
    return new Date() > this.expiryDate;
  }

  isValid(): boolean {
    return !!this.name && !!this.issuer && !this.isExpired();
  }

  updateExpiration(newExpiryDate: Date): void {
    if (newExpiryDate <= new Date()) {
      throw new DomainException('Data de expiração deve ser no futuro');
    }
    if (this.issueDate && newExpiryDate <= this.issueDate) {
      throw new DomainException('Data de expiração deve ser posterior à data de emissão');
    }
    this.expiryDate = newExpiryDate;
  }
}
