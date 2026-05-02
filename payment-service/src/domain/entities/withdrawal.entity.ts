import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { WithdrawalStatus } from '../enums/withdrawal-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

@Entity('withdrawals')
export class Withdrawal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  specialistId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod!: PaymentMethod; // PIX | BANK_TRANSFER | CREDIT_ACCOUNT

  @Column({ nullable: true })
  pixKey?: string; // Chave PIX do especialista

  @Column({ nullable: true })
  bankAccount?: string; // Conta bancária (JSON string com agência, conta, etc)

  @Column({ type: 'enum', enum: WithdrawalStatus, default: WithdrawalStatus.PENDING })
  status!: WithdrawalStatus;

  @Column({ nullable: true })
  approvedAt?: Date;

  @Column({ nullable: true })
  processedAt?: Date;

  @Column({ nullable: true })
  rejectionReason?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
