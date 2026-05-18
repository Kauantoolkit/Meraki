import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';

// Schemas
import { UserSchema } from './infrastructure/database/schemas/user.schema';
import { SpecialistProfileSchema } from './infrastructure/database/schemas/specialist-profile.schema';
import { CompanyProfileSchema } from './infrastructure/database/schemas/company-profile.schema';
import { RefreshTokenSchema } from './infrastructure/database/schemas/refresh-token.schema';

// Infrastructure
import { UserRepository, RefreshTokenRepository } from './infrastructure/repositories/user.repository';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { EventPublisherService } from './infrastructure/rabbitmq/event-publisher.service';

// Domain Factories
import { UserFactory } from './domain/factories/user.factory';

// Application Services
import { TokenService } from './application/services/token.service';

// Use Cases
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { AuthenticateUseCase } from './application/use-cases/authenticate.use-case';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';

// Controllers
import { AuthController } from './interfaces/controllers/auth.controller';
import { UserController } from './interfaces/controllers/user.controller';

// Guards
import { RolesGuard } from '@shared/infra/auth/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserSchema,
      SpecialistProfileSchema,
      CompanyProfileSchema,
      RefreshTokenSchema,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      // Cada chamada de jwtService.sign() passa expiresIn explicitamente via TokenService.
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      },
    ]),
  ],
  controllers: [AuthController, UserController],
  providers: [
    // Repository implementations + tokens de injeção
    UserRepository,
    RefreshTokenRepository,
    { provide: 'IUserRepository', useClass: UserRepository },
    { provide: 'IRefreshTokenRepository', useClass: RefreshTokenRepository },

    // Auth
    JwtStrategy,
    RolesGuard,

    // Application services
    TokenService,

    // Events
    EventPublisherService,

    // Domain Factories (registradas sem @Injectable — domain puro)
    { provide: UserFactory, useFactory: () => new UserFactory() },

    // Use Cases
    RegisterUserUseCase,
    AuthenticateUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    DeleteUserUseCase,
  ],
})
export class IdentityModule {}
