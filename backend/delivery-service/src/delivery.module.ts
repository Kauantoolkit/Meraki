import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { Delivery } from './domain/entities/delivery.entity';
import { KanbanColumn } from './domain/entities/kanban-column.entity';
import { KanbanCard } from './domain/entities/kanban-card.entity';
import { ProjectHistory } from './domain/entities/project-history.entity';
import { MilestoneComment } from './domain/entities/milestone-comment.entity';

import { JwtStrategy } from './infrastructure/auth/jwt.strategy';

// Repositories (infrastructure — adapters)
import { DeliveryRepository } from './infrastructure/repositories/delivery.repository';
import { KanbanRepository } from './infrastructure/repositories/kanban.repository';
import { HistoryRepository } from './infrastructure/repositories/history.repository';

// Factories (domain)
import { DeliveryFactory } from './domain/factories/delivery.factory';
import { KanbanColumnFactory } from './domain/factories/kanban-column.factory';

// Domain Services
import { MilestoneProgressionDomainService } from './domain/services/milestone-progression.domain-service';

// Use Cases (application)
import { SubmitDeliveryUseCase } from './application/use-cases/submit-delivery.use-case';
import { ReviewDeliveryUseCase } from './application/use-cases/review-delivery.use-case';
import { GetKanbanBoardUseCase } from './application/use-cases/get-kanban-board.use-case';
import { GetProjectHistoryUseCase } from './application/use-cases/get-project-history.use-case';

// Consumers (infrastructure)
import { BidAcceptedConsumer } from './infrastructure/rabbitmq/consumers/bid-accepted.consumer';
import { MilestoneCreatedConsumer } from './infrastructure/rabbitmq/consumers/milestone-created.consumer';

// Controllers (interfaces)
import { DeliveryController, KanbanController, HistoryController } from './interfaces/controllers/delivery.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery, KanbanColumn, KanbanCard, ProjectHistory, MilestoneComment]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secret: process.env.JWT_SECRET || 'meraki-jwt-secret' }),
  ],
  controllers: [DeliveryController, KanbanController, HistoryController],
  providers: [
    JwtStrategy,
    // Repositories
    DeliveryRepository,
    KanbanRepository,
    HistoryRepository,
    // Factories
    DeliveryFactory,
    KanbanColumnFactory,
    // Domain Services
    MilestoneProgressionDomainService,
    // Use Cases
    SubmitDeliveryUseCase,
    ReviewDeliveryUseCase,
    GetKanbanBoardUseCase,
    GetProjectHistoryUseCase,
    // Consumers
    BidAcceptedConsumer,
    MilestoneCreatedConsumer,
  ],
})
export class DeliveryModule {}
