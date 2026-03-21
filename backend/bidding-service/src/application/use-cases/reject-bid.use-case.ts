import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BidRepository } from '../../infrastructure/repositories/bid.repository';

@Injectable()
export class RejectBidUseCase {
  constructor(private readonly bidRepo: BidRepository) {}

  async execute(bidId: string): Promise<void> {
    const bid = await this.bidRepo.findById(bidId);
    if (!bid) throw new NotFoundException('Proposta não encontrada');
    bid.reject();
    await this.bidRepo.save(bid);
  }
}
