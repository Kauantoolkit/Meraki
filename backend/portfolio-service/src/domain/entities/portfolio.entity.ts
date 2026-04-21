import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { DomainException } from '../exceptions/domain.exception';

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  specialistId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  projectUrl: string;

  @Column('simple-array', { nullable: true })
  technologies: string[];

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ default: false })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  canPublish(): boolean {
    return !!this.title && !!this.description && !!this.specialistId;
  }

  publish(): void {
    if (this.isPublished) {
      throw new DomainException('Portfolio já está publicado');
    }
    if (!this.canPublish()) {
      throw new DomainException('Portfolio precisa de título, descrição e specialistId para ser publicado');
    }
    this.isPublished = true;
  }

  unpublish(): void {
    if (!this.isPublished) {
      throw new DomainException('Portfolio já está despublicado');
    }
    this.isPublished = false;
  }

  updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new DomainException('Descrição não pode ser vazia');
    }
    this.description = description.trim();
  }
}
