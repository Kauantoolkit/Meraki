import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Min, Max } from 'class-validator';
import { DomainException } from '../exceptions/domain.exception';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  specialistId: string;

  @Column()
  projectId: string;

  @Column()
  reviewerId: string;

  @Column('int')
  rating: number; // 1–5

  @Column('text', { nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  validate(): void {
    if (!Number.isInteger(this.rating) || this.rating < 1 || this.rating > 5) {
      throw new DomainException('Rating deve ser um inteiro entre 1 e 5');
    }
    if (!this.specialistId || !this.projectId || !this.reviewerId) {
      throw new DomainException('Review precisa de specialistId, projectId e reviewerId');
    }
  }

  isPositive(): boolean {
    return this.rating >= 4;
  }
}
