import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BidRepository } from '../../infrastructure/repositories/bid.repository';
import { UpdateBidDto } from '../dto/update-bid.dto';
import { Bid } from '../../domain/entities/bid.entity';

@Injectable()
export class UpdateBidUseCase {
  constructor(private readonly bidRepo: BidRepository) {}

  async execute(bidId: string, dto: UpdateBidDto, specialistId: string): Promise<Bid> {
    const bid = await this.bidRepo.findById(bidId);
    if (!bid) throw new NotFoundException('Proposta não encontrada');
    if (bid.specialistId !== specialistId) throw new ForbiddenException('Não autorizado');

    bid.update(
      dto.proposal          ?? bid.proposal,
      dto.proposedBudget    ?? bid.proposedBudget,
      dto.estimatedDuration ?? bid.estimatedDuration,
      dto.milestoneProposals,
    );

    return this.bidRepo.save(bid);
  }
}
