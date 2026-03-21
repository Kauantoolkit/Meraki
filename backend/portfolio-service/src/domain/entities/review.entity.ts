import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Min, Max } from 'class-validator';

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
}
