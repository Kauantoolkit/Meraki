import { ForbiddenException } from '@nestjs/common';
import { UserController } from '../../../src/interfaces/controllers/user.controller';
import { UserType } from '../../../src/domain/enums/user-type.enum';

describe('UserController.getById (ownership-or-admin)', () => {
  let controller: UserController;
  const getUserProfileUseCase = { execute: jest.fn(async (id: string) => ({ id })) };
  const updateUserProfileUseCase = { execute: jest.fn() };

  beforeEach(() => {
    controller = new UserController(
      getUserProfileUseCase as never,
      updateUserProfileUseCase as never,
    );
    getUserProfileUseCase.execute.mockClear();
  });

  it('permite ADMIN acessar qualquer id', async () => {
    const targetId = '11111111-1111-1111-1111-111111111111';
    const requester = {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'admin@meraki.com',
      userType: UserType.ADMIN,
    };
    await controller.getById(targetId, requester);
    expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(targetId);
  });

  it('permite o próprio usuário acessar o próprio id', async () => {
    const sameId = '33333333-3333-3333-3333-333333333333';
    const requester = {
      id: sameId,
      email: 'me@meraki.com',
      userType: UserType.SPECIALIST,
    };
    await controller.getById(sameId, requester);
    expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(sameId);
  });

  it('bloqueia (403) quando SPECIALIST tenta acessar id de outro usuário', async () => {
    const requester = {
      id: '44444444-4444-4444-4444-444444444444',
      email: 'me@meraki.com',
      userType: UserType.SPECIALIST,
    };
    const targetId = '55555555-5555-5555-5555-555555555555';
    await expect(controller.getById(targetId, requester)).rejects.toThrow(ForbiddenException);
    expect(getUserProfileUseCase.execute).not.toHaveBeenCalled();
  });

  it('bloqueia (403) quando COMPANY tenta acessar id de outro usuário', async () => {
    const requester = {
      id: '66666666-6666-6666-6666-666666666666',
      email: 'corp@meraki.com',
      userType: UserType.COMPANY,
    };
    const targetId = '77777777-7777-7777-7777-777777777777';
    await expect(controller.getById(targetId, requester)).rejects.toThrow(ForbiddenException);
    expect(getUserProfileUseCase.execute).not.toHaveBeenCalled();
  });
});
