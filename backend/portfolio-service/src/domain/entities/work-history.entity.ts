import { DomainException } from '../exceptions/domain.exception';

/** Histórico profissional do especialista — RF11, RF14 */
export class WorkHistory {
  id: string;
  specialistId: string;
  projectId: string;
  projectTitle: string;
  companyId: string;
  amountEarned: number;
  completedAt: Date;
  createdAt: Date;

  isOngoing(): boolean {
    return !this.completedAt;
  }

  complete(completedAt?: Date): void {
    if (this.completedAt) {
      throw new DomainException('Work history já está concluído');
    }
    const date = completedAt ?? new Date();
    if (date > new Date()) {
      throw new DomainException('Data de conclusão não pode ser no futuro');
    }
    this.completedAt = date;
  }
}
