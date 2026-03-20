import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Entities
import { User } from './domain/entities/user.entity';
import { SpecialistProfile } from './domain/entities/specialist-profile.entity';
import { CompanyProfile } from './domain/entities/company-profile.entity';

// Infrastructure
import { UserRepository } from './infrastructure/repositories/user.repository';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { EventPublisherService } from './infrastructure/rabbitmq/event-publisher.service';

// Use Cases
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { AuthenticateUseCase } from './application/use-cases/authenticate.use-case';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';

// Controllers
import { AuthController } from './interfaces/controllers/auth.controller';
import { UserController } from './interfaces/controllers/user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, SpecialistProfile, CompanyProfile]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'meraki-jwt-secret-key',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any },
    }),
    RabbitMQModule,
  ],
  controllers: [AuthController, UserController],
  providers: [
    // Repository implementation + token de injeção
    UserRepository,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },

    // Auth
    JwtStrategy,

    // Events
    EventPublisherService,

    // Use Cases
    RegisterUserUseCase,
    AuthenticateUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
  ],
})
export class IdentityModule {}
