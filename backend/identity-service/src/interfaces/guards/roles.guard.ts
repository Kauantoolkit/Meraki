import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_METADATA_KEY } from '../decorators/roles.decorator';
import { UserType } from '../../domain/enums/user-type.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserType[] | undefined>(
      ROLES_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Sem @Roles → endpoint não tem restrição de role
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { userType?: UserType } | undefined;

    if (!user?.userType) {
      throw new ForbiddenException('Usuário sem role atribuída');
    }

    if (!requiredRoles.includes(user.userType)) {
      throw new ForbiddenException(
        `Acesso restrito: requer uma das roles [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
