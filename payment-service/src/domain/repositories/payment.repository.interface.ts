import { Payment } from '../entities/payment.entity';
import { PaymentStatus } from '../enums/payment-status.enum';

export interface IPaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByProjectId(projectId: string): Promise<Payment[]>;
  findBySpecialistId(specialistId: string): Promise<Payment[]>;
  findByCompanyId(companyId: string): Promise<Payment[]>;
  findByStatus(status: PaymentStatus): Promise<Payment[]>;
  create(payment: Partial<Payment>): Promise<Payment>;
  update(id: string, payment: Partial<Payment>): Promise<Payment | null>;
  delete(id: string): Promise<void>;
}
