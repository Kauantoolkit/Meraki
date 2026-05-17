import { ConflictException } from '@nestjs/common';
import { RegisterUserUseCase } from '../../../src/application/use-cases/register-user.use-case';
import { UserFactory } from '../../../src/domain/factories/user.factory';
import { UserType } from '../../../src/domain/enums/user-type.enum';
import { Password } from '../../../src/domain/value-objects/password.value-object';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';
import { User } from '../../../src/domain/entities/user.entity';

function buildRepoMock() {
  return {
    findByEmail: jest.fn().mockResolvedValue(null),
    findById: jest.fn(),
    create: jest.fn(async (u: Partial<User>) => {
      const entity = Object.assign(new User(), {
        id: 'new-id',
        ...u,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      return entity;
    }),
    update: jest.fn(),
    softDelete: jest.fn(),
    createSpecialistProfile: jest.fn(async () => ({ id: 'spec-1' })),
    findSpecialistProfileByUserId: jest.fn(),
    updateSpecialistProfile: jest.fn(),
    createCompanyProfile: jest.fn(async () => ({ id: 'comp-1' })),
    findCompanyProfileByUserId: jest.fn(),
    updateCompanyProfile: jest.fn(),
  };
}

describe('RegisterUserUseCase', () => {
  let repo: ReturnType<typeof buildRepoMock>;
  let factory: UserFactory;
  let eventPublisher: { publishUserRegistered: jest.Mock };
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    repo = buildRepoMock();
    factory = new UserFactory();
    eventPublisher = { publishUserRegistered: jest.fn().mockResolvedValue(undefined) };
    useCase = new RegisterUserUseCase(repo as never, eventPublisher as never, factory);
  });

  it('cria SPECIALIST: persiste user + specialist profile + publica evento', async () => {
    const result = await useCase.execute({
      email: 'spec@meraki.com',
      password: 'Senha123',
      name: 'Especialista',
      userType: UserType.SPECIALIST,
    });

    expect(repo.findByEmail).toHaveBeenCalledWith('spec@meraki.com');
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.createSpecialistProfile).toHaveBeenCalledTimes(1);
    expect(repo.createCompanyProfile).not.toHaveBeenCalled();
    expect(eventPublisher.publishUserRegistered).toHaveBeenCalledTimes(1);
    expect(result.userType).toBe(UserType.SPECIALIST);
    expect(result.specialistId).toBe('spec-1');
  });

  it('cria COMPANY com companyName: persiste user + company profile', async () => {
    const result = await useCase.execute({
      email: 'corp@meraki.com',
      password: 'Senha123',
      name: 'Empresa Tech',
      userType: UserType.COMPANY,
      companyName: 'Tech Corp Ltda',
    });

    expect(repo.createCompanyProfile).toHaveBeenCalledTimes(1);
    expect(repo.createSpecialistProfile).not.toHaveBeenCalled();
    expect(result.companyId).toBe('comp-1');
  });

  it('rejeita COMPANY sem companyName (DomainException)', async () => {
    await expect(
      useCase.execute({
        email: 'corp@meraki.com',
        password: 'Senha123',
        name: 'X',
        userType: UserType.COMPANY,
      } as never),
    ).rejects.toThrow();
  });

  it('rejeita email duplicado (ConflictException)', async () => {
    repo.findByEmail.mockResolvedValueOnce({ id: 'existing' });
    await expect(
      useCase.execute({
        email: 'dup@meraki.com',
        password: 'Senha123',
        name: 'Duplicado',
        userType: UserType.SPECIALIST,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('persiste hash bcrypt em passwordHash (nunca o plaintext)', async () => {
    await useCase.execute({
      email: 'hash@meraki.com',
      password: 'Senha123',
      name: 'Hash Tester',
      userType: UserType.SPECIALIST,
    });
    const created = (repo.create as jest.Mock).mock.calls[0][0];
    expect(created.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(created.passwordHash).not.toBe('Senha123');
    await expect(Password.matches('Senha123', created.passwordHash)).resolves.toBe(true);
  });

  it('rejeita senha fraca antes de chegar ao repositório', async () => {
    await expect(
      useCase.execute({
        email: 'fraca@meraki.com',
        password: 'fraca',
        name: 'Fraco',
        userType: UserType.SPECIALIST,
      }),
    ).rejects.toThrow();
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('rejeita name muito curto (DomainException)', async () => {
    await expect(
      useCase.execute({
        email: 'short@meraki.com',
        password: 'Senha123',
        name: 'X',
        userType: UserType.SPECIALIST,
      }),
    ).rejects.toThrow(DomainException);
  });
});
