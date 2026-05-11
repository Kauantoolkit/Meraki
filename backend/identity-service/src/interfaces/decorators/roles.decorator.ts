import { SetMetadata } from '@nestjs/common';
import { UserType } from '../../domain/enums/user-type.enum';

export const ROLES_METADATA_KEY = 'roles';

/**
 * Restringe um handler/controller a um conjunto de UserTypes.
 * Usar em conjunto com RolesGuard. Exemplo:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles(UserType.ADMIN)
 */
export const Roles = (...roles: UserType[]) => SetMetadata(ROLES_METADATA_KEY, roles);
