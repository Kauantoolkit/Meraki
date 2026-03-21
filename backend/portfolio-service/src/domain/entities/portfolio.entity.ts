import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

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
}
