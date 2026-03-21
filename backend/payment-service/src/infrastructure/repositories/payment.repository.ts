import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../domain/repositories/i-payment.repository';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  save(payment: Payment): Promise<Payment> {
    return this.repo.save(payment);
  }

  findByProject(projectId: string): Promise<Payment[]> {
    return this.repo.find({ where: { projectId }, order: { createdAt: 'DESC' } });
  }

  findByMilestone(milestoneId: string): Promise<Payment | null> {
    return this.repo.findOne({ where: { milestoneId } });
  }

  findById(id: string): Promise<Payment | null> {
    return this.repo.findOne({ where: { id } });
  }

  findBySpecialist(specialistId: string): Promise<Payment[]> {
    return this.repo.find({ where: { specialistId }, order: { createdAt: 'DESC' } });
  }
}
