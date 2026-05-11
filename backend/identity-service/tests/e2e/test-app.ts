import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from '../../src/interfaces/controllers/auth.controller';
import { UserController } from '../../src/interfaces/controllers/user.controller';

import { RegisterUserUseCase } from '../../src/application/use-cases/register-user.use-case';
import { AuthenticateUseCase } from '../../src/application/use-cases/authenticate.use-case';
import { GetUserProfileUseCase } from '../../src/application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../src/application/use-cases/update-user-profile.use-case';
import { RefreshTokenUseCase } from '../../src/application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../src/application/use-cases/logout.use-case';
import { DeleteUserUseCase } from '../../src/application/use-cases/delete-user.use-case';

import { UserFactory } from '../../src/domain/factories/user.factory';
import { TokenService } from '../../src/application/services/token.service';
import { JwtStrategy } from '../../src/infrastructure/auth/jwt.strategy';
import { RolesGuard } from '../../src/interfaces/guards/roles.guard';
import { HttpExceptionFilter } from '../../src/interfaces/filters/http-exception.filter';
import { DomainExceptionFilter } from '../../src/interfaces/filters/domain-exception.filter';

import { User } from '../../src/domain/entities/user.entity';
import { RefreshToken } from '../../src/domain/entities/refresh-token.entity';
import { UserType } from '../../src/domain/enums/user-type.enum';

export interface TestAppBundle {
  app: INestApplication;
  store: InMemoryStore;
  jwtService: JwtService;
}

interface SpecialistRow { id: string; userId: string; bio?: string; skills?: string[]; experience?: number; hourlyRate?: number; website?: string }
interface CompanyRow { id: string; userId: string; companyName?: string; cnpj?: string; industry?: string; companySize?: string; website?: string }

export class InMemoryStore {
  users: User[] = [];
  specialists: SpecialistRow[] = [];
  companies: CompanyRow[] = [];
  refreshTokens: RefreshToken[] = [];
}

class FakeUserRepository {
  constructor(private readonly store: InMemoryStore) {}

  async findById(id: string): Promise<User | null> {
    return this.store.users.find((u) => u.id === id && !u.deletedAt) ?? null;
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.store.users.find((u) => u.email === email && !u.deletedAt) ?? null;
  }
  async create(data: Partial<User>): Promise<User> {
    const u = Object.assign(new User(), {
      id: `user-${this.store.users.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isActive: true,
      ...data,
    });
    this.store.users.push(u);
    return u;
  }
  async update(id: string, data: Partial<User>): Promise<User> {
    const u = await this.findById(id);
    if (!u) return null as never;
    Object.assign(u, data, { updatedAt: new Date() });
    return u;
  }
  async softDelete(id: string): Promise<void> {
    const u = this.store.users.find((x) => x.id === id);
    if (u) u.deletedAt = new Date();
  }
  async createSpecialistProfile(data: Partial<SpecialistRow>): Promise<SpecialistRow> {
    const row = { id: `spec-${this.store.specialists.length + 1}`, ...data } as SpecialistRow;
    this.store.specialists.push(row);
    return row;
  }
  async findSpecialistProfileByUserId(userId: string): Promise<SpecialistRow | null> {
    return this.store.specialists.find((s) => s.userId === userId) ?? null;
  }
  async updateSpecialistProfile(id: string, data: Partial<SpecialistRow>): Promise<SpecialistRow> {
    const row = this.store.specialists.find((s) => s.id === id);
    if (row) Object.assign(row, data);
    return row;
  }
  async createCompanyProfile(data: Partial<CompanyRow>): Promise<CompanyRow> {
    const row = { id: `comp-${this.store.companies.length + 1}`, ...data } as CompanyRow;
    this.store.companies.push(row);
    return row;
  }
  async findCompanyProfileByUserId(userId: string): Promise<CompanyRow | null> {
    return this.store.companies.find((c) => c.userId === userId) ?? null;
  }
  async updateCompanyProfile(id: string, data: Partial<CompanyRow>): Promise<CompanyRow> {
    const row = this.store.companies.find((c) => c.id === id);
    if (row) Object.assign(row, data);
    return row;
  }
}

class FakeRefreshTokenRepository {
  constructor(private readonly store: InMemoryStore) {}
  async create(data: Partial<RefreshToken>): Promise<RefreshToken> {
    const row: RefreshToken = {
      id: `rt-${this.store.refreshTokens.length + 1}`,
      jti: data.jti!,
      userId: data.userId!,
      tokenHash: data.tokenHash!,
      expiresAt: data.expiresAt!,
      revokedAt: null,
      replacedByJti: null,
      createdAt: new Date(),
    };
    this.store.refreshTokens.push(row);
    return row;
  }
  async findByJti(jti: string): Promise<RefreshToken | null> {
    return this.store.refreshTokens.find((r) => r.jti === jti) ?? null;
  }
  async revoke(jti: string, replacedByJti?: string): Promise<void> {
    const row = this.store.refreshTokens.find((r) => r.jti === jti && r.revokedAt === null);
    if (row) {
      row.revokedAt = new Date();
      row.replacedByJti = replacedByJti ?? null;
    }
  }
  async revokeAllForUser(userId: string): Promise<void> {
    for (const r of this.store.refreshTokens) {
      if (r.userId === userId && r.revokedAt === null) r.revokedAt = new Date();
    }
  }
}

const FakeEventPublisher = {
  publishUserRegistered: jest.fn().mockResolvedValue(undefined),
};

export async function createTestApp(
  options: { withThrottler?: boolean } = {},
): Promise<TestAppBundle> {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-key';
  process.env.JWT_ACCESS_EXPIRES_IN = '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';

  const store = new InMemoryStore();
  const userRepo = new FakeUserRepository(store);
  const refreshRepo = new FakeRefreshTokenRepository(store);

  const moduleBuilder = Test.createTestingModule({
    imports: [
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.register({ secret: process.env.JWT_SECRET, global: true }),
      ThrottlerModule.forRoot([
        options.withThrottler
          ? { ttl: 60_000, limit: 5 }
          : { ttl: 60_000, limit: 100_000 },
      ]),
    ],
    controllers: [AuthController, UserController],
    providers: [
      FakeEventPublisher && { provide: 'EventPublisherService', useValue: FakeEventPublisher },
      { provide: 'IUserRepository', useValue: userRepo },
      { provide: 'IRefreshTokenRepository', useValue: refreshRepo },
      // Os controllers injetam EventPublisherService por classe via DI do RegisterUseCase
      // — então prover diretamente o token e o use-case com factory
      {
        provide: UserFactory,
        useFactory: () => new UserFactory(),
      },
      JwtStrategy,
      RolesGuard,
      TokenService,
      // Use cases — injetando manualmente via factory porque os mocks vivem fora
      {
        provide: RegisterUserUseCase,
        useFactory: (factory: UserFactory) =>
          new RegisterUserUseCase(userRepo as never, FakeEventPublisher as never, factory),
        inject: [UserFactory],
      },
      {
        provide: AuthenticateUseCase,
        useFactory: (token: TokenService) =>
          new AuthenticateUseCase(userRepo as never, token),
        inject: [TokenService],
      },
      {
        provide: GetUserProfileUseCase,
        useFactory: () => new GetUserProfileUseCase(userRepo as never),
      },
      {
        provide: UpdateUserProfileUseCase,
        useFactory: () => new UpdateUserProfileUseCase(userRepo as never),
      },
      {
        provide: RefreshTokenUseCase,
        useFactory: (token: TokenService) =>
          new RefreshTokenUseCase(userRepo as never, token),
        inject: [TokenService],
      },
      {
        provide: LogoutUseCase,
        useFactory: (token: TokenService) => new LogoutUseCase(token),
        inject: [TokenService],
      },
      {
        provide: DeleteUserUseCase,
        useFactory: (token: TokenService) => new DeleteUserUseCase(userRepo as never, token),
        inject: [TokenService],
      },
    ].filter(Boolean) as never,
  });

  const moduleRef = await moduleBuilder.compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(), new DomainExceptionFilter());
  await app.init();

  const jwtService = moduleRef.get(JwtService);

  return { app, store, jwtService };
}

export function signAccessToken(jwt: JwtService, claims: {
  sub: string;
  email: string;
  userType: UserType;
  specialistId?: string;
  companyId?: string;
}): string {
  return jwt.sign(claims, { expiresIn: '15m' });
}
