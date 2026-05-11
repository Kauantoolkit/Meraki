import { Controller, Get, Put, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case';
import {
  UpdateSpecialistProfileDto,
  UpdateCompanyProfileDto,
} from '../../application/dto/update-profile.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Retorna usuário + perfil (specialist ou company)' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.getUserProfileUseCase.execute(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID (uso interno entre serviços)' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.getUserProfileUseCase.execute(id);
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Atualizar perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSpecialistProfileDto | UpdateCompanyProfileDto,
  ) {
    return this.updateUserProfileUseCase.execute(userId, dto);
  }
}
