import { UnauthorizedException } from '@nestjs/common';
import { AuthenticateUseCase } from '../../../src/application/use-cases/authenticate.use-case';
import { Password } from '../../../src/domain/value-objects/password.value-object';
import { UserType } from '../../../src/domain/enums/user-type.enum';

describe('AuthenticateUseCase', () => {
  const tokenService = {
    issueTokenPair: jest.fn(async () => ({
      accessToken: 'access.jwt.token',
      refreshToken: 'refresh.jwt.token',
    })),
  };
  const repo = { findByEmail: jest.fn() };
  const useCase = new AuthenticateUseCase(repo as never, tokenService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function userWithPassword(plain: string) {
    return {
      id: 'u1',
      email: 'user@meraki.com',
      passwordHash: await new Password(plain).hash(),
      name: 'User',
      userType: UserType.SPECIALIST,
      isActive: true,
      createdAt: new Date(),
    };
  }

  it('autentica com credenciais válidas e retorna par de tokens + user', async () => {
    repo.findByEmail.mockResolvedValueOnce(await userWithPassword('Senha123'));
    const result = await useCase.execute({ email: 'user@meraki.com', password: 'Senha123' });
    expect(result.accessToken).toBe('access.jwt.token');
    expect(result.refreshToken).toBe('refresh.jwt.token');
    expect(result.user.email).toBe('user@meraki.com');
  });

  it('normaliza email (lowercase + trim) antes de buscar', async () => {
    repo.findByEmail.mockResolvedValueOnce(await userWithPassword('Senha123'));
    await useCase.execute({ email: '  USER@Meraki.COM  ', password: 'Senha123' });
    expect(repo.findByEmail).toHaveBeenCalledWith('user@meraki.com');
  });

  it('401 quando email não existe', async () => {
    repo.findByEmail.mockResolvedValueOnce(null);
    await expect(
      useCase.execute({ email: 'ghost@meraki.com', password: 'Qualquer123' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
  });

  it('401 quando senha está errada', async () => {
    repo.findByEmail.mockResolvedValueOnce(await userWithPassword('Senha123'));
    await expect(
      useCase.execute({ email: 'user@meraki.com', password: 'Errada456' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
  });

  it('401 quando usuário está inativo (soft-deleted ou desativado)', async () => {
    const u = await userWithPassword('Senha123');
    u.isActive = false;
    repo.findByEmail.mockResolvedValueOnce(u);
    await expect(
      useCase.execute({ email: 'user@meraki.com', password: 'Senha123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('mensagem genérica nunca revela se o email existe (anti-enum)', async () => {
    repo.findByEmail.mockResolvedValueOnce(null);
    const err1 = await useCase
      .execute({ email: 'ghost@meraki.com', password: 'X1xxxxxx' })
      .catch((e) => e.message);

    repo.findByEmail.mockResolvedValueOnce(await userWithPassword('Senha123'));
    const err2 = await useCase
      .execute({ email: 'user@meraki.com', password: 'Errada456' })
      .catch((e) => e.message);

    expect(err1).toBe(err2);
  });
});
