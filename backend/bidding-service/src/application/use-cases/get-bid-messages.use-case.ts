import { Injectable, NotFoundException } from '@nestjs/common';
import { BidRepository } from '../../infrastructure/repositories/bid.repository';
import { BidMessageRepository } from '../../infrastructure/repositories/bid-message.repository';

@Injectable()
export class GetBidMessagesUseCase {
  constructor(
    private readonly bidRepo: BidRepository,
    private readonly messageRepo: BidMessageRepository,
  ) {}

  async execute(bidId: string) {
    const bid = await this.bidRepo.findById(bidId);
    if (!bid) throw new NotFoundException('Proposta não encontrada');

    return this.messageRepo.findByBid(bidId);
  }
}
