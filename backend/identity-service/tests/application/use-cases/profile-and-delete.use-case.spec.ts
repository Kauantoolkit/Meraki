import { NotFoundException } from '@nestjs/common';
import { GetUserProfileUseCase } from '../../../src/application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../../src/application/use-cases/update-user-profile.use-case';
import { DeleteUserUseCase } from '../../../src/application/use-cases/delete-user.use-case';
import { UserType } from '../../../src/domain/enums/user-type.enum';

function repoMock() {
  return {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn().mockResolvedValue(undefined),
    createSpecialistProfile: jest.fn(),
    findSpecialistProfileByUserId: jest.fn(),
    updateSpecialistProfile: jest.fn(async (_, d) => ({ id: 'spec-1', ...d })),
    createCompanyProfile: jest.fn(),
    findCompanyProfileByUserId: jest.fn(),
    updateCompanyProfile: jest.fn(async (_, d) => ({ id: 'comp-1', ...d })),
  };
}

describe('GetUserProfileUseCase', () => {
  it('retorna user + specialist profile quando SPECIALIST', async () => {
    const repo = repoMock();
    repo.findById.mockResolvedValueOnce({
      id: 'u1', email: 'e@m.com', name: 'N', userType: UserType.SPECIALIST,
      specialistId: 'spec-1', companyId: null, isActive: true, createdAt: new Date(),
    });
    repo.findSpecialistProfileByUserId.mockResolvedValueOnce({ id: 'spec-1', skills: [] });
    const useCase = new GetUserProfileUseCase(repo as never);
    const result = await useCase.execute('u1');
    expect(result.profile).toEqual({ id: 'spec-1', skills: [] });
    expect(repo.findCompanyProfileByUserId).not.toHaveBeenCalled();
  });

  it('retorna user + company profile quando COMPANY', async () => {
    const repo = repoMock();
    repo.findById.mockResolvedValueOnce({
      id: 'u2', email: 'c@m.com', name: 'C', userType: UserType.COMPANY,
      specialistId: null, companyId: 'comp-1', isActive: true, createdAt: new Date(),
    });
    repo.findCompanyProfileByUserId.mockResolvedValueOnce({ id: 'comp-1', companyName: 'X' });
    const useCase = new GetUserProfileUseCase(repo as never);
    const result = await useCase.execute('u2');
    expect(result.profile).toEqual({ id: 'comp-1', companyName: 'X' });
  });

  it('lança NotFoundException quando user não existe', async () => {
    const repo = repoMock();
    repo.findById.mockResolvedValueOnce(null);
    const useCase = new GetUserProfileUseCase(repo as never);
    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundException);
  });
});

describe('UpdateUserProfileUseCase', () => {
  it('atualiza SpecialistProfile quando user é SPECIALIST', async () => {
    const repo = repoMock();
    repo.findById.mockResolvedValueOnce({
      id: 'u1', userType: UserType.SPECIALIST, specialistId: 'spec-1', companyId: null,
    });
    const useCase = new UpdateUserProfileUseCase(repo as never);
    const result = await useCase.execute('u1', { bio: 'nova bio' });
    expect(repo.updateSpecialistProfile).toHaveBeenCalledWith('spec-1', { bio: 'nova bio' });
    expect((result as { bio?: string }).bio).toBe('nova bio');
  });

  it('atualiza CompanyProfile quando user é COMPANY', async () => {
    const repo = repoMock();
    repo.findById.mockResolvedValueOnce({
      id: 'u2', userType: UserType.COMPANY, specialistId: null, companyId: 'comp-1',
    });
    const useCase = new UpdateUserProfileUseCase(repo as never);
    await useCase.execute('u2', { industry: 'Tecnologia' });
    expect(repo.updateCompanyProfile).toHaveBeenCalledWith('comp-1', { industry: 'Tecnologia' });
  });

  it('lança NotFoundException quando user não existe', async () => {
    const repo = repoMock();
    repo.findById.mockResolvedValueOnce(null);
    const useCase = new UpdateUserProfileUseCase(repo as never);
    await expect(useCase.execute('missing', {})).rejects.toThrow(NotFoundException);
  });

  it('lança NotFoundException quando SPECIALIST não tem specialistId vinculado', async () => {
    const repo = repoMock();
    repo.findById.mockResolvedValueOnce({
      id: 'u3', userType: UserType.SPECIALIST, specialistId: null,
    });
    const useCase = new UpdateUserProfileUseCase(repo as never);
    await expect(useCase.execute('u3', {})).rejects.toThrow(NotFoundException);
  });
});

describe('DeleteUserUseCase', () => {
  it('soft-delete: revoga refresh-tokens + marca deletedAt', async () => {
    const repo = repoMock();
    repo.findById.mockResolvedValueOnce({ id: 'u1' });
    const tokenService = { revokeAllForUser: jest.fn().mockResolvedValue(undefined) };
    const useCase = new DeleteUserUseCase(repo as never, tokenService as never);

    await useCase.execute('u1');

    expect(tokenService.revokeAllForUser).toHaveBeenCalledWith('u1');
    expect(repo.softDelete).toHaveBeenCalledWith('u1');
  });

  it('lança NotFoundException quando user não existe (não chama softDelete)', async () => {
    const repo = repoMock();
    repo.findById.mockResolvedValueOnce(null);
    const tokenService = { revokeAllForUser: jest.fn() };
    const useCase = new DeleteUserUseCase(repo as never, tokenService as never);
    await expect(useCase.execute('ghost')).rejects.toThrow(NotFoundException);
    expect(repo.softDelete).not.toHaveBeenCalled();
  });
});
