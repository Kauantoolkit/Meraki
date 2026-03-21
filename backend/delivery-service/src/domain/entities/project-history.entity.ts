import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/** Aggregate Root — RN07: histórico automático de atividades do projeto */
@Entity('project_histories')
export class ProjectHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @Column({ nullable: true })
  specialistId: string;

  @Column()
  action: string;

  @Column('text', { nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
