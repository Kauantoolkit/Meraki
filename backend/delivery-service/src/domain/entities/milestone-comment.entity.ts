import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('milestone_comments')
export class MilestoneComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  milestoneId: string;

  @Column()
  userId: string;

  @Column('text')
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
