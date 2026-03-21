import { Payment } from '../entities/payment.entity';

export interface IPaymentRepository {
  save(payment: Payment): Promise<Payment>;
  findByProject(projectId: string): Promise<Payment[]>;
  findByMilestone(milestoneId: string): Promise<Payment | null>;
  findById(id: string): Promise<Payment | null>;
}
