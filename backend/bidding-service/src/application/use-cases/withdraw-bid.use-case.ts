import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BidRepository } from '../../infrastructure/repositories/bid.repository';

@Injectable()
export class WithdrawBidUseCase {
  constructor(private readonly bidRepo: BidRepository) {}

  async execute(bidId: string, specialistId: string): Promise<void> {
    const bid = await this.bidRepo.findById(bidId);
    if (!bid) throw new NotFoundException('Proposta não encontrada');
    if (bid.specialistId !== specialistId) throw new ForbiddenException('Não autorizado');
    bid.withdraw();
    await this.bidRepo.save(bid);
  }
}
