import { Injectable } from '@nestjs/common';
import { Milestone } from '../entities/milestone.entity';
import { MilestoneStatus } from '../enums/milestone-status.enum';
import { DomainException } from '../exceptions/domain.exception';

export interface CreateMilestoneData {
  title: string;
  description: string;
  amount: number;
  dueDate?: string;
}

@Injectable()
export class MilestoneFactory {
  create(data: CreateMilestoneData, projectId: string, order: number): Milestone {
    if (!data.title || data.title.trim().length === 0) {
      throw new DomainException('Título do milestone é obrigatório');
    }
    if (!data.amount || data.amount <= 0) {
      throw new DomainException('Valor do milestone deve ser maior que zero');
    }

    const milestone = new Milestone();
    milestone.title = data.title.trim();
    milestone.description = data.description;
    milestone.amount = data.amount;
    milestone.projectId = projectId;
    milestone.order = order;
    milestone.status = MilestoneStatus.PENDING;
    if (data.dueDate) milestone.dueDate = new Date(data.dueDate);

    return milestone;
  }

  /** Cria múltiplos milestones em lote — atribui ordem sequencial */
  createBatch(items: CreateMilestoneData[], projectId: string): Milestone[] {
    if (!items || items.length === 0) {
      throw new DomainException('Projeto deve ter pelo menos um milestone');
    }
    return items.map((item, index) => this.create(item, projectId, index + 1));
  }
}
