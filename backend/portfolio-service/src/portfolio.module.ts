import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { Portfolio } from './domain/entities/portfolio.entity';
import { Certification } from './domain/entities/certification.entity';
import { Review } from './domain/entities/review.entity';
import { SpecialistPublicProfile } from './domain/entities/specialist-public-profile.entity';
import { WorkHistory } from './domain/entities/work-history.entity';
import { CompanyPublicProfile } from './domain/entities/company-public-profile.entity';

import { JwtStrategy } from './infrastructure/auth/jwt.strategy';

// Repositories (infrastructure — adapters)
import { SpecialistProfileRepository } from './infrastructure/repositories/specialist-profile.repository';
import { WorkHistoryRepository } from './infrastructure/repositories/work-history.repository';
import { CertificationRepository } from './infrastructure/repositories/certification.repository';
import { ReviewRepository } from './infrastructure/repositories/review.repository';
import { PortfolioItemRepository } from './infrastructure/repositories/portfolio-item.repository';
import { CompanyProfileRepository } from './infrastructure/repositories/company-profile.repository';

// Factories (domain)
import { SpecialistProfileFactory } from './domain/factories/specialist-profile.factory';

// Use Cases (application)
import { CreateSpecialistProfileUseCase } from './application/use-cases/create-specialist-profile.use-case';
import { AddCertificationUseCase } from './application/use-cases/add-certification.use-case';
import { AddReviewUseCase } from './application/use-cases/add-review.use-case';
import { GetPublicProfileUseCase } from './application/use-cases/get-public-profile.use-case';
import { RecordWorkHistoryUseCase } from './application/use-cases/record-work-history.use-case';
import { GetCompanyProfileUseCase } from './application/use-cases/get-company-profile.use-case';
import { CreateCompanyProfileUseCase } from './application/use-cases/create-company-profile.use-case';
import { GetPortfolioUseCase } from './application/use-cases/get-portfolio.use-case';

// Consumers (infrastructure)
import { UserRegisteredConsumer } from './infrastructure/rabbitmq/consumers/user-registered.consumer';
import { PaymentReleasedConsumer } from './infrastructure/rabbitmq/consumers/payment-released.consumer';

// Controllers (interfaces)
import {
  PortfolioController,
  CertificationController,
  ReviewController,
  PublicProfileController,
  MyPortfolioController,
} from './interfaces/controllers/portfolio.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Portfolio, Certification, Review,
      SpecialistPublicProfile, WorkHistory, CompanyPublicProfile,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secret: process.env.JWT_SECRET || 'meraki-jwt-secret' }),
  ],
  controllers: [
    PortfolioController,
    CertificationController,
    ReviewController,
    PublicProfileController,
    MyPortfolioController,
  ],
  providers: [
    JwtStrategy,
    // Repositories
    SpecialistProfileRepository,
    WorkHistoryRepository,
    CertificationRepository,
    ReviewRepository,
    PortfolioItemRepository,
    CompanyProfileRepository,
    // Factories
    SpecialistProfileFactory,
    // Use Cases
    CreateSpecialistProfileUseCase,
    AddCertificationUseCase,
    AddReviewUseCase,
    GetPublicProfileUseCase,
    RecordWorkHistoryUseCase,
    GetCompanyProfileUseCase,
    CreateCompanyProfileUseCase,
    GetPortfolioUseCase,
    // Consumers
    UserRegisteredConsumer,
    PaymentReleasedConsumer,
  ],
})
export class PortfolioModule {}
