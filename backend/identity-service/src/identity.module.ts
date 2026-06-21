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
import { AuditLog } from './domain/entities/audit-log.entity';
import { SkillSchema } from './infrastructure/database/schemas/skill.schema';
import { SkillQuestionSchema } from './infrastructure/database/schemas/skill-question.schema';
import { SkillValidationSchema } from './infrastructure/database/schemas/skill-validation.schema';

// Infrastructure
import { UserRepository, RefreshTokenRepository } from './infrastructure/repositories/user.repository';
import { TypeormAuditLogRepository } from './infrastructure/repositories/typeorm-audit-log.repository';
import { SkillRepository } from './infrastructure/repositories/skill.repository';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { EventPublisherService } from './infrastructure/rabbitmq/event-publisher.service';
import { XssSanitizerService } from './infrastructure/security/xss-sanitizer.service';
import { EmailService } from './infrastructure/email/email.service';

// Domain Factories
import { UserFactory } from './domain/factories/user.factory';

// Application Services
import { TokenService } from './application/services/token.service';
import { AuditLogService } from './application/services/audit-log.service';

// Use Cases
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { AuthenticateUseCase } from './application/use-cases/authenticate.use-case';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { CreateSkillUseCase } from './application/use-cases/create-skill.use-case';
import { AddQuestionsToSkillUseCase } from './application/use-cases/add-questions-to-skill.use-case';
import { GetSkillsUseCase } from './application/use-cases/get-skills.use-case';
import { GetMySkillValidationsUseCase } from './application/use-cases/get-my-skill-validations.use-case';
import { AttemptProfileSkillQuizUseCase } from './application/use-cases/attempt-profile-skill-quiz.use-case';
import { AttemptProjectSkillQuizUseCase } from './application/use-cases/attempt-project-skill-quiz.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';

// Controllers
import { AuthController } from './interfaces/controllers/auth.controller';
import { UserController } from './interfaces/controllers/user.controller';
import { InternalUserController } from './interfaces/controllers/internal-user.controller';
import { SkillsController } from './interfaces/controllers/skills.controller';

// Guards
import { RolesGuard } from './interfaces/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserSchema,
      SpecialistProfileSchema,
      CompanyProfileSchema,
      RefreshTokenSchema,
      AuditLog,
      SkillSchema,
      SkillQuestionSchema,
      SkillValidationSchema,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      // Cada chamada de jwtService.sign() passa expiresIn explicitamente via TokenService.
    }),
    ThrottlerModule.forRoot([
      // Limite padrão p/ qualquer endpoint sob ThrottlerGuard: 100 req/min/IP
      { ttl: 60_000, limit: 100 },
    ]),
    RabbitMQModule,
  ],
  controllers: [AuthController, UserController, InternalUserController, SkillsController],
  providers: [
    // Repository implementations + tokens de injeção
    UserRepository,
    RefreshTokenRepository,
    TypeormAuditLogRepository,
    { provide: 'IUserRepository', useClass: UserRepository },
    { provide: 'IRefreshTokenRepository', useClass: RefreshTokenRepository },
    { provide: 'IAuditLogRepository', useClass: TypeormAuditLogRepository },

    // Security Services
    XssSanitizerService,

    // Auth
    JwtStrategy,
    RolesGuard,

    // Application services
    TokenService,
    AuditLogService,

    // Events
    EventPublisherService,

    // Email
    EmailService,

    // Domain Factories (registradas sem @Injectable — domain puro)
    { provide: UserFactory, useFactory: () => new UserFactory() },

    // Skill Repository
    SkillRepository,
    { provide: 'ISkillRepository', useClass: SkillRepository },

    // Use Cases
    RegisterUserUseCase,
    AuthenticateUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    DeleteUserUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    VerifyEmailUseCase,

    // Skill Use Cases
    CreateSkillUseCase,
    AddQuestionsToSkillUseCase,
    GetSkillsUseCase,
    GetMySkillValidationsUseCase,
    AttemptProfileSkillQuizUseCase,
    AttemptProjectSkillQuizUseCase,
  ],
})
export class IdentityModule {}
