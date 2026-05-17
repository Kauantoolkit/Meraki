import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../../../src/application/services/token.service';
import { User } from '../../../src/domain/entities/user.entity';
import { UserType } from '../../../src/domain/enums/user-type.enum';
import { IRefreshTokenRepository } from '../../../src/domain/repositories/user.repository.interface';
import { RefreshToken } from '../../../src/domain/entities/refresh-token.entity';

function buildUser(overrides: Partial<User> = {}): User {
  const user = new User();
  user.id = '00000000-0000-0000-0000-000000000001';
  user.email = 'user@meraki.com';
  user.name = 'Test User';
  user.userType = UserType.SPECIALIST;
  user.isActive = true;
  Object.assign(user, overrides);
  return user;
}

class FakeRefreshTokenRepo implements IRefreshTokenRepository {
  private rows: RefreshToken[] = [];
  async create(data: Partial<RefreshToken>): Promise<RefreshToken> {
    const row: RefreshToken = {
      id: `row-${this.rows.length + 1}`,
      jti: data.jti!,
      userId: data.userId!,
      tokenHash: data.tokenHash!,
      expiresAt: data.expiresAt!,
      revokedAt: null,
      replacedByJti: null,
      createdAt: new Date(),
    };
    this.rows.push(row);
    return row;
  }
  async findByJti(jti: string): Promise<RefreshToken | null> {
    return this.rows.find((r) => r.jti === jti) ?? null;
  }
  async revoke(jti: string, replacedByJti?: string): Promise<void> {
    const row = this.rows.find((r) => r.jti === jti && r.revokedAt === null);
    if (row) {
      row.revokedAt = new Date();
      row.replacedByJti = replacedByJti ?? null;
    }
  }
  async revokeAllForUser(userId: string): Promise<void> {
    for (const row of this.rows) {
      if (row.userId === userId && row.revokedAt === null) {
        row.revokedAt = new Date();
      }
    }
  }
  // helper para testes
  getRows(): RefreshToken[] {
    return [...this.rows];
  }
}

describe('TokenService', () => {
  let jwt: JwtService;
  let repo: FakeRefreshTokenRepo;
  let service: TokenService;

  beforeAll(() => {
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  });

  beforeEach(() => {
    jwt = new JwtService({ secret: 'test-secret' });
    repo = new FakeRefreshTokenRepo();
    service = new TokenService(jwt, repo);
  });

  it('emite par de tokens válido e persiste o refresh hasheado', async () => {
    const user = buildUser();
    const pair = await service.issueTokenPair(user);

    expect(pair.accessToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(pair.refreshToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);

    const rows = repo.getRows();
    expect(rows).toHaveLength(1);
    expect(rows[0].userId).toBe(user.id);
    expect(rows[0].tokenHash).not.toBe(pair.refreshToken);
    expect(rows[0].revokedAt).toBeNull();
  });

  it('valida um refresh-token recém-emitido', async () => {
    const user = buildUser();
    const pair = await service.issueTokenPair(user);
    const result = await service.validateRefreshToken(pair.refreshToken);
    expect(result.userId).toBe(user.id);
    expect(result.jti).toBeDefined();
  });

  it('rejeita refresh-token revogado', async () => {
    const user = buildUser();
    const pair = await service.issueTokenPair(user);
    const { jti } = await service.validateRefreshToken(pair.refreshToken);
    await service.revokeRefreshToken(jti);
    await expect(service.validateRefreshToken(pair.refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('revoga toda a família ao detectar reuso de refresh já consumido', async () => {
    const user = buildUser();
    const pair1 = await service.issueTokenPair(user);
    const pair2 = await service.issueTokenPair(user);
    const { jti: jti1 } = await service.validateRefreshToken(pair1.refreshToken);
    await service.revokeRefreshToken(jti1, 'new-jti');

    // Tentativa de reuso do pair1 (já revogado) deve falhar
    await expect(service.validateRefreshToken(pair1.refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );
    // E o pair2 também deve ter sido revogado por segurança
    await expect(service.validateRefreshToken(pair2.refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejeita token cuja assinatura é inválida', async () => {
    await expect(service.validateRefreshToken('not.a.jwt')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejeita access-token (type !== refresh) na rota de refresh', async () => {
    const accessLike = jwt.sign({ sub: 'u1', email: 'x@y', userType: UserType.SPECIALIST });
    await expect(service.validateRefreshToken(accessLike)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('revokeAllForUser invalida todos os refresh-tokens ativos do usuário', async () => {
    const user = buildUser();
    await service.issueTokenPair(user);
    await service.issueTokenPair(user);
    await service.revokeAllForUser(user.id);
    const rows = repo.getRows();
    expect(rows.every((r) => r.revokedAt !== null)).toBe(true);
  });
});
