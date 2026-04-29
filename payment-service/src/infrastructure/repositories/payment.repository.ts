import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>,
  ) {}

  async findById(id: string): Promise<Payment | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByProjectId(projectId: string): Promise<Payment[]> {
    return this.repository.find({ where: { projectId } });
  }

  async findBySpecialistId(specialistId: string): Promise<Payment[]> {
    return this.repository.find({ where: { specialistId } });
  }

  async findByCompanyId(companyId: string): Promise<Payment[]> {
    return this.repository.find({ where: { companyId } });
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    return this.repository.find({ where: { status } });
  }

  async create(payment: Partial<Payment>): Promise<Payment> {
    const newPayment = this.repository.create(payment);
    return this.repository.save(newPayment);
  }

  async update(id: string, payment: Partial<Payment>): Promise<Payment | null> {
    await this.repository.update(id, payment);
    return this.repository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
