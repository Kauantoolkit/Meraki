import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BidRepository } from '../../infrastructure/repositories/bid.repository';
import { BidMessageRepository } from '../../infrastructure/repositories/bid-message.repository';
import { SendBidMessageDto } from '../dto/send-bid-message.dto';
import { BidStatus } from '../../domain/enums/bid-status.enum';
import { BidMessage } from '../../domain/entities/bid-message.entity';

@Injectable()
export class SendBidMessageUseCase {
  constructor(
    private readonly bidRepo: BidRepository,
    private readonly messageRepo: BidMessageRepository,
  ) {}

  async execute(bidId: string, dto: SendBidMessageDto, senderId: string): Promise<void> {
    const bid = await this.bidRepo.findById(bidId);
    if (!bid) throw new NotFoundException('Proposta não encontrada');

    if (bid.status === BidStatus.WITHDRAWN || bid.status === BidStatus.REJECTED) {
      throw new ForbiddenException('Não é possível enviar mensagens em propostas encerradas');
    }

    const message = BidMessage.create(bidId, senderId, dto.message);
    await this.messageRepo.save(message);
  }
}
