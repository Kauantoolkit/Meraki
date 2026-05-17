import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokenUseCase } from '../../../src/application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../../src/application/use-cases/logout.use-case';
import { UserType } from '../../../src/domain/enums/user-type.enum';

function fakeRefreshJwt(jti: string): string {
  // header.payload.signature — payload base64url contendo o jti
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: 'u1', jti, type: 'refresh' })).toString(
    'base64url',
  );
  return `${header}.${payload}.fake-sig`;
}

describe('RefreshTokenUseCase', () => {
  it('rotaciona: valida refresh antigo, emite novo par, revoga o antigo apontando p/ o novo jti', async () => {
    const tokenService = {
      validateRefreshToken: jest.fn().mockResolvedValue({ userId: 'u1', jti: 'old-jti' }),
      issueTokenPair: jest.fn().mockResolvedValue({
        accessToken: 'new.access',
        refreshToken: fakeRefreshJwt('new-jti'),
      }),
      revokeRefreshToken: jest.fn().mockResolvedValue(undefined),
    };
    const userRepo = {
      findById: jest.fn().mockResolvedValue({
        id: 'u1', email: 'e@m.com', name: 'N', userType: UserType.SPECIALIST,
        isActive: true, createdAt: new Date(),
      }),
    };
    const useCase = new RefreshTokenUseCase(userRepo as never, tokenService as never);

    const result = await useCase.execute('any.refresh.token');

    expect(tokenService.validateRefreshToken).toHaveBeenCalledWith('any.refresh.token');
    expect(tokenService.issueTokenPair).toHaveBeenCalled();
    expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith('old-jti', 'new-jti');
    expect(result.accessToken).toBe('new.access');
  });

  it('rejeita refresh quando usuário não existe mais', async () => {
    const tokenService = {
      validateRefreshToken: jest.fn().mockResolvedValue({ userId: 'u-ghost', jti: 'old' }),
      issueTokenPair: jest.fn(),
      revokeRefreshToken: jest.fn(),
    };
    const userRepo = { findById: jest.fn().mockResolvedValue(null) };
    const useCase = new RefreshTokenUseCase(userRepo as never, tokenService as never);
    await expect(useCase.execute('any.token')).rejects.toThrow(UnauthorizedException);
    expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
  });

  it('rejeita refresh quando usuário está inativo', async () => {
    const tokenService = {
      validateRefreshToken: jest.fn().mockResolvedValue({ userId: 'u1', jti: 'old' }),
      issueTokenPair: jest.fn(),
      revokeRefreshToken: jest.fn(),
    };
    const userRepo = {
      findById: jest.fn().mockResolvedValue({ id: 'u1', isActive: false }),
    };
    const useCase = new RefreshTokenUseCase(userRepo as never, tokenService as never);
    await expect(useCase.execute('any.token')).rejects.toThrow(UnauthorizedException);
  });
});

describe('LogoutUseCase', () => {
  it('revoga refresh-token válido', async () => {
    const tokenService = {
      validateRefreshToken: jest.fn().mockResolvedValue({ userId: 'u1', jti: 'jti-1' }),
      revokeRefreshToken: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new LogoutUseCase(tokenService as never);
    await useCase.execute('valid.token');
    expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith('jti-1');
  });

  it('é idempotente: token inválido não lança, apenas ignora', async () => {
    const tokenService = {
      validateRefreshToken: jest.fn().mockRejectedValue(new UnauthorizedException('invalid')),
      revokeRefreshToken: jest.fn(),
    };
    const useCase = new LogoutUseCase(tokenService as never);
    await expect(useCase.execute('garbage')).resolves.toBeUndefined();
    expect(tokenService.revokeRefreshToken).not.toHaveBeenCalled();
  });
});
