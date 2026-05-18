import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[] | undefined>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { permissions?: string[] } | undefined;

    if (!user?.permissions || user.permissions.length === 0) {
      throw new ForbiddenException('Usuário sem permissões atribuídas');
    }

    const hasAllPermissions = requiredPermissions.every(
      (perm) => user.permissions!.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Permissões insuficientes. Requer: [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
