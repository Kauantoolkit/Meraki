import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum DeliveryStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Referência externa para Project Context */
  @Column()
  milestoneId: string;

  @Column()
  projectId: string;

  @Column()
  specialistId: string;

  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.PENDING })
  status: DeliveryStatus;

  @Column('simple-array', { nullable: true })
  deliveredFiles: string[];

  @Column('text', { nullable: true })
  deliveryNotes: string;

  @Column('text', { nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
