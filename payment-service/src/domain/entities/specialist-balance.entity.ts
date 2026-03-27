import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('specialist_balances')
export class SpecialistBalance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { unique: true })
  specialistId!: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalEarned!: number; // Total ganho

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  availableBalance!: number; // Saldo disponível para saque

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalWithdrawn!: number; // Total já sacado

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
