import { Bid } from '../entities/bid.entity';
import { BidStatus } from '../enums/bid-status.enum';
import { ProposedValue } from '../value-objects/proposed-value.value-object';
import { ProposalText } from '../value-objects/proposal-text.value-object';
import { EstimatedDuration } from '../value-objects/estimated-duration.value-object';
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
    // Value Objects validam invariantes do domínio
    const proposalText = new ProposalText(data.proposal);
    const proposedValue = new ProposedValue(data.proposedBudget);
    const estimatedDuration = new EstimatedDuration(data.estimatedDuration);

    const bid = new Bid();
    bid.projectId = data.projectId;
    bid.specialistId = data.specialistId;
    bid.proposal = proposalText.getValue();
    bid.proposedBudget = proposedValue.getValue();
    bid.estimatedDuration = estimatedDuration.getValue();
    bid.status = BidStatus.PENDING;

    return bid;
  }
}
