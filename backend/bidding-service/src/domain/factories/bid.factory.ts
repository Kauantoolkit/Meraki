import { Bid } from '../entities/bid.entity';
import { BidStatus } from '../enums/bid-status.enum';
import { ProposedValue } from '../value-objects/proposed-value.value-object';
import { DomainException } from '../exceptions/domain.exception';

export interface CreateBidData {
  projectId: string;
  specialistId: string;
  proposal: string;
  proposedBudget: number;
  estimatedDuration: number;
}

export class BidFactory {
  create(data: CreateBidData): Bid {
    if (!data.projectId) throw new DomainException('projectId é obrigatório');
    if (!data.specialistId) throw new DomainException('specialistId é obrigatório');
    if (!data.proposal || data.proposal.trim().length < 10) {
      throw new DomainException('Proposta deve ter pelo menos 10 caracteres');
    }
    if (!data.estimatedDuration || data.estimatedDuration <= 0) {
      throw new DomainException('Duração estimada deve ser maior que zero');
    }

    // Value Object valida o valor proposto
    const proposedValue = new ProposedValue(data.proposedBudget);

    const bid = new Bid();
    bid.projectId = data.projectId;
    bid.specialistId = data.specialistId;
    bid.proposal = data.proposal.trim();
    bid.proposedBudget = proposedValue.getValue();
    bid.estimatedDuration = data.estimatedDuration;
    bid.status = BidStatus.PENDING;

    return bid;
  }
}
