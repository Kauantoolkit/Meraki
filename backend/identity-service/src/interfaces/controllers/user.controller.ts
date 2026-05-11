import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case';
import {
  UpdateSpecialistProfileDto,
  UpdateCompanyProfileDto,
} from '../../application/dto/update-profile.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserType } from '../../domain/enums/user-type.enum';

interface AuthenticatedUser {
  id: string;
  email: string;
  userType: UserType;
  specialistId?: string;
  companyId?: string;
}

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Perfil do usuário autenticado',
    description: 'Escopo: qualquer usuário autenticado (lê o próprio registro).',
  })
  @ApiResponse({ status: 200, description: 'Retorna usuário + perfil (specialist ou company)' })
  @ApiResponse({ status: 401, description: 'JWT ausente ou inválido' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.getUserProfileUseCase.execute(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description:
      'Escopo: ADMIN (qualquer ID) ou ownership (o próprio :id). ' +
      'Usado por outros serviços via JWT do usuário ou em painel administrativo.',
  })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 401, description: 'JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Não é ADMIN nem dono do recurso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() requester: AuthenticatedUser,
  ) {
    const isAdmin = requester.userType === UserType.ADMIN;
    const isOwner = requester.id === id;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'Acesso restrito: somente o próprio usuário ou um ADMIN pode consultar este recurso',
      );
    }
    return this.getUserProfileUseCase.execute(id);
  }

  @Put('me/profile')
  @ApiOperation({
    summary: 'Atualizar perfil do usuário autenticado',
    description: 'Escopo: qualquer usuário autenticado (atualiza o próprio perfil).',
  })
  @ApiResponse({ status: 200, description: 'Perfil atualizado' })
  @ApiResponse({ status: 401, description: 'JWT ausente ou inválido' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSpecialistProfileDto | UpdateCompanyProfileDto,
  ) {
    return this.updateUserProfileUseCase.execute(userId, dto);
  }
}
