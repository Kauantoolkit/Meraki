import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Schemas
import { UserSchema } from './infrastructure/database/schemas/user.schema';
import { SpecialistProfileSchema } from './infrastructure/database/schemas/specialist-profile.schema';
import { CompanyProfileSchema } from './infrastructure/database/schemas/company-profile.schema';

// Infrastructure
import { UserRepository } from './infrastructure/repositories/user.repository';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { EventPublisherService } from './infrastructure/rabbitmq/event-publisher.service';

// Domain Factories
import { UserFactory } from './domain/factories/user.factory';

// Use Cases
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { AuthenticateUseCase } from './application/use-cases/authenticate.use-case';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';

// Controllers
import { AuthController } from './interfaces/controllers/auth.controller';
import { UserController } from './interfaces/controllers/user.controller';

// Guards
import { RolesGuard } from './interfaces/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSchema, SpecialistProfileSchema, CompanyProfileSchema]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
       expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any,
      },
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
    RolesGuard,

    // Events
    EventPublisherService,

    // Domain Factories (registradas sem @Injectable — domain puro)
    { provide: UserFactory, useFactory: () => new UserFactory() },

    // Use Cases
    RegisterUserUseCase,
    AuthenticateUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
  ],
})
export class IdentityModule {}
