import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { AuthenticateUseCase } from '../../application/use-cases/authenticate.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly authenticateUseCase: AuthenticateUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: parseInt(process.env.THROTTLE_AUTH_LIMIT || '5', 10), ttl: 60_000 } })
  @ApiOperation({
    summary: 'Registrar novo usuário (company ou specialist)',
    description: 'Escopo: público. Rate-limit: 5 req/min por IP.',
  })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou companyName ausente' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  @ApiResponse({ status: 429, description: 'Limite de tentativas excedido' })
  async register(@Body() dto: CreateUserDto) {
    return this.registerUserUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: parseInt(process.env.THROTTLE_AUTH_LIMIT || '5', 10), ttl: 60_000 } })
  @ApiOperation({
    summary: 'Autenticar usuário e receber par accessToken + refreshToken',
    description: 'Escopo: público. Rate-limit: 5 req/min por IP.',
  })
  @ApiResponse({ status: 200, description: 'Login realizado. Retorna access + refresh + user' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 429, description: 'Limite de tentativas excedido' })
  async login(@Body() dto: LoginDto) {
    return this.authenticateUseCase.execute(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Rotacionar tokens — emite novo par e invalida o refresh anterior',
    description: 'Escopo: público (autenticação é pelo próprio refresh-token).',
  })
  @ApiResponse({ status: 200, description: 'Novo par accessToken + refreshToken' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido, expirado ou já usado' })
  @ApiResponse({ status: 429, description: 'Limite de tentativas excedido' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Invalidar refresh-token server-side (idempotente)',
    description: 'Escopo: público. Sempre retorna 204; payload inválido é ignorado.',
  })
  @ApiResponse({ status: 204, description: 'Refresh-token revogado (ou já estava)' })
  async logout(@Body() dto: RefreshTokenDto) {
    await this.logoutUseCase.execute(dto.refreshToken);
  }
}
