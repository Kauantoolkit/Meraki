import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';

@Injectable()
export class GetPaymentsUseCase {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  findByProject(projectId: string) {
    return this.paymentRepo.findByProject(projectId);
  }

  findByMilestone(milestoneId: string) {
    return this.paymentRepo.findByMilestone(milestoneId);
  }

  findById(id: string) {
    return this.paymentRepo.findById(id);
  }

  findBySpecialist(specialistId: string) {
    return this.paymentRepo.findBySpecialist(specialistId);
  }
}
