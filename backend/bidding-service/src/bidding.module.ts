import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { BidSchema } from './infrastructure/database/schemas/bid.schema';
import { BidMessageSchema } from './infrastructure/database/schemas/bid-message.schema';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';

// Repositories (infrastructure — adapters)
import { BidRepository } from './infrastructure/repositories/bid.repository';
import { BidMessageRepository } from './infrastructure/repositories/bid-message.repository';

// Factories (domain)
import { BidFactory } from './domain/factories/bid.factory';

// Domain Services
import { BidSelectionDomainService } from './domain/services/bid-selection.domain-service';

// Use Cases (application)
import { SubmitBidUseCase } from './application/use-cases/submit-bid.use-case';
import { AcceptBidUseCase } from './application/use-cases/accept-bid.use-case';
import { RejectBidUseCase } from './application/use-cases/reject-bid.use-case';
import { WithdrawBidUseCase } from './application/use-cases/withdraw-bid.use-case';
import { GetBidsUseCase } from './application/use-cases/get-bids.use-case';
import { SendBidMessageUseCase } from './application/use-cases/send-bid-message.use-case';
import { GetBidMessagesUseCase } from './application/use-cases/get-bid-messages.use-case';

// Controllers (interfaces)
import { BidController } from './interfaces/controllers/bid.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([BidSchema, BidMessageSchema]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [BidController],
  providers: [
    JwtStrategy,
    // Repositories
    BidRepository,
    BidMessageRepository,
    // Domain Factories (instanciadas sem @Injectable — domain puro)
    { provide: BidFactory, useFactory: () => new BidFactory() },
    // Domain Services (instanciados sem @Injectable — domain puro)
    { provide: BidSelectionDomainService, useFactory: () => new BidSelectionDomainService() },
    // Use Cases
    SubmitBidUseCase,
    AcceptBidUseCase,
    RejectBidUseCase,
    WithdrawBidUseCase,
    GetBidsUseCase,
    SendBidMessageUseCase,
    GetBidMessagesUseCase,
  ],
})
export class BiddingModule {}
