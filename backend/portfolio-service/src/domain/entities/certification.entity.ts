import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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
}
