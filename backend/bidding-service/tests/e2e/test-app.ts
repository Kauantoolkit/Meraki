import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { v4 as uuidv4 } from 'uuid';

import { BidController } from '../../src/interfaces/controllers/bid.controller';
import { HttpExceptionFilter } from '../../src/interfaces/filters/http-exception.filter';
import { DomainExceptionFilter } from '../../src/interfaces/filters/domain-exception.filter';
import { JwtStrategy } from '../../src/infrastructure/auth/jwt.strategy';

import { SubmitBidUseCase } from '../../src/application/use-cases/submit-bid.use-case';
import { AcceptBidUseCase } from '../../src/application/use-cases/accept-bid.use-case';
import { RejectBidUseCase } from '../../src/application/use-cases/reject-bid.use-case';
import { WithdrawBidUseCase } from '../../src/application/use-cases/withdraw-bid.use-case';
import { GetBidsUseCase } from '../../src/application/use-cases/get-bids.use-case';
import { SendBidMessageUseCase } from '../../src/application/use-cases/send-bid-message.use-case';
import { GetBidMessagesUseCase } from '../../src/application/use-cases/get-bid-messages.use-case';

import { BidFactory } from '../../src/domain/factories/bid.factory';
import { BidSelectionDomainService } from '../../src/domain/services/bid-selection.domain-service';
import { BidRepository } from '../../src/infrastructure/repositories/bid.repository';
import { BidMessageRepository } from '../../src/infrastructure/repositories/bid-message.repository';

import { Bid } from '../../src/domain/entities/bid.entity';
import { BidMessage } from '../../src/domain/entities/bid-message.entity';
import { BidStatus } from '../../src/domain/enums/bid-status.enum';
import { BidAlreadyAcceptedError } from '../../src/domain/exceptions/bid-already-accepted.error';

// ─── In-memory store ──────────────────────────────────────────────────────────

export class InMemoryBidStore {
  bids: Bid[] = [];
  messages: BidMessage[] = [];
}

// ─── Fake repositories ────────────────────────────────────────────────────────

class FakeBidRepository {
  constructor(private readonly store: InMemoryBidStore) {}

  async findById(id: string): Promise<Bid | null> {
    return this.store.bids.find((b) => b.id === id) ?? null;
  }

  async findByProject(projectId: string): Promise<Bid[]> {
    return this.store.bids.filter((b) => b.projectId === projectId);
  }

  async findBySpecialist(specialistId: string): Promise<Bid[]> {
    return this.store.bids.filter((b) => b.specialistId === specialistId);
  }

  async findByProjectAndSpecialist(projectId: string, specialistId: string): Promise<Bid[]> {
    return this.store.bids.filter(
      (b) => b.projectId === projectId && b.specialistId === specialistId,
    );
  }

  async findAcceptedByProject(projectId: string): Promise<Bid | null> {
    return (
      this.store.bids.find(
        (b) => b.projectId === projectId && b.status === BidStatus.ACCEPTED,
      ) ?? null
    );
  }

  async save(bid: Bid): Promise<Bid> {
    const idx = this.store.bids.findIndex((b) => b.id === bid.id);
    if (idx >= 0) {
      Object.assign(this.store.bids[idx], bid);
      return this.store.bids[idx];
    }
    if (!bid.id) bid.id = uuidv4();
    if (!bid.createdAt) bid.createdAt = new Date();
    bid.updatedAt = new Date();
    this.store.bids.push(bid);
    return bid;
  }

  async rejectAllPendingExcept(projectId: string, acceptedBidId: string): Promise<void> {
    this.store.bids
      .filter(
        (b) => b.projectId === projectId && b.status === BidStatus.PENDING && b.id !== acceptedBidId,
      )
      .forEach((b) => (b.status = BidStatus.REJECTED));
  }

  async saveWinnerAtomically(winner: Bid, projectId: string): Promise<void> {
    // Verifica se já existe um OUTRO vencedor (não o próprio winner mutado em memória)
    const existing = this.store.bids.find(
      (b) => b.projectId === projectId && b.status === BidStatus.ACCEPTED && b.id !== winner.id,
    );
    if (existing) throw new BidAlreadyAcceptedError();

    await this.save(winner);
    await this.rejectAllPendingExcept(projectId, winner.id);
  }
}

class FakeBidMessageRepository {
  constructor(private readonly store: InMemoryBidStore) {}

  async save(data: Partial<BidMessage>): Promise<BidMessage> {
    const msg = Object.assign(new BidMessage(), {
      id: uuidv4(),
      isRead: false,
      createdAt: new Date(),
      ...data,
    });
    this.store.messages.push(msg);
    return msg;
  }

  async findByBid(bidId: string): Promise<BidMessage[]> {
    return this.store.messages.filter((m) => m.bidId === bidId);
  }
}

const FakeEventPublisher = {
  publishBidSubmitted: jest.fn().mockResolvedValue(undefined),
  publishBidAccepted: jest.fn().mockResolvedValue(undefined),
};

// ─── App factory ─────────────────────────────────────────────────────────────

export interface TestAppBundle {
  app: INestApplication;
  store: InMemoryBidStore;
  jwtService: JwtService;
}

export async function createTestApp(): Promise<TestAppBundle> {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-key';

  const store = new InMemoryBidStore();
  const fakeBidRepo = new FakeBidRepository(store);
  const fakeMessageRepo = new FakeBidMessageRepository(store);

  jest.clearAllMocks();

  const moduleRef = await Test.createTestingModule({
    imports: [
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.register({ secret: process.env.JWT_SECRET, global: true }),
    ],
    controllers: [BidController],
    providers: [
      JwtStrategy,
      { provide: BidRepository, useValue: fakeBidRepo },
      { provide: BidMessageRepository, useValue: fakeMessageRepo },
      { provide: 'EventPublisherService', useValue: FakeEventPublisher },
      { provide: BidFactory, useFactory: () => new BidFactory() },
      { provide: BidSelectionDomainService, useFactory: () => new BidSelectionDomainService() },
      {
        provide: SubmitBidUseCase,
        useFactory: (repo: BidRepository, factory: BidFactory) =>
          new SubmitBidUseCase(repo, factory, FakeEventPublisher as never),
        inject: [BidRepository, BidFactory],
      },
      {
        provide: AcceptBidUseCase,
        useFactory: (repo: BidRepository, svc: BidSelectionDomainService) =>
          new AcceptBidUseCase(repo, svc, FakeEventPublisher as never),
        inject: [BidRepository, BidSelectionDomainService],
      },
      {
        provide: RejectBidUseCase,
        useFactory: (repo: BidRepository) => new RejectBidUseCase(repo),
        inject: [BidRepository],
      },
      {
        provide: WithdrawBidUseCase,
        useFactory: (repo: BidRepository) => new WithdrawBidUseCase(repo),
        inject: [BidRepository],
      },
      {
        provide: GetBidsUseCase,
        useFactory: (repo: BidRepository) => new GetBidsUseCase(repo),
        inject: [BidRepository],
      },
      {
        provide: SendBidMessageUseCase,
        useFactory: (repo: BidRepository, msgRepo: BidMessageRepository) =>
          new SendBidMessageUseCase(repo, msgRepo),
        inject: [BidRepository, BidMessageRepository],
      },
      {
        provide: GetBidMessagesUseCase,
        useFactory: (repo: BidRepository, msgRepo: BidMessageRepository) =>
          new GetBidMessagesUseCase(repo, msgRepo),
        inject: [BidRepository, BidMessageRepository],
      },
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter(), new DomainExceptionFilter());
  await app.init();

  const jwtService = moduleRef.get(JwtService);

  return { app, store, jwtService };
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export interface TokenClaims {
  sub: string;
  email: string;
  userType: 'COMPANY' | 'SPECIALIST';
  specialistId?: string;
  companyId?: string;
}

export function signToken(jwt: JwtService, claims: TokenClaims): string {
  return jwt.sign(claims, { expiresIn: '15m' });
}

export function companyToken(jwt: JwtService, companyId = 'comp-1'): string {
  return signToken(jwt, {
    sub: `user-${companyId}`,
    email: `company-${companyId}@meraki.com`,
    userType: 'COMPANY',
    companyId,
  });
}

export function specialistToken(jwt: JwtService, specialistId = 'spec-1'): string {
  return signToken(jwt, {
    sub: `user-${specialistId}`,
    email: `specialist-${specialistId}@meraki.com`,
    userType: 'SPECIALIST',
    specialistId,
  });
}
