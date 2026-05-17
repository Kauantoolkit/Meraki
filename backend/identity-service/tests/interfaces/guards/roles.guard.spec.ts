import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../../src/interfaces/guards/roles.guard';
import { UserType } from '../../../src/domain/enums/user-type.enum';
import { ROLES_METADATA_KEY } from '../../../src/interfaces/decorators/roles.decorator';

function buildContext(user: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('permite acesso quando o handler não tem @Roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = buildContext({ id: 'u1', userType: UserType.SPECIALIST });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('permite acesso quando @Roles inclui o userType do requester', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserType.ADMIN, UserType.COMPANY]);
    const ctx = buildContext({ id: 'u1', userType: UserType.COMPANY });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('bloqueia (403) quando @Roles não inclui o userType do requester', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserType.ADMIN]);
    const ctx = buildContext({ id: 'u1', userType: UserType.SPECIALIST });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('bloqueia (403) quando o request não tem user.userType', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserType.ADMIN]);
    const ctx = buildContext({ id: 'u1' });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('respeita o ROLES_METADATA_KEY como chave', () => {
    const spy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserType.ADMIN]);
    const ctx = buildContext({ id: 'u1', userType: UserType.ADMIN });
    guard.canActivate(ctx);
    expect(spy).toHaveBeenCalledWith(ROLES_METADATA_KEY, expect.anything());
  });
});
