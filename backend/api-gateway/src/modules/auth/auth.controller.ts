import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário (empresa ou especialista)' })
  @ApiResponse({ status: 201, description: 'Usuário criado' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  @ApiResponse({ status: 429, description: 'Limite de tentativas excedido' })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login — retorna par accessToken + refreshToken' })
  @ApiResponse({ status: 200, description: 'Login realizado' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 429, description: 'Limite de tentativas excedido' })
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotacionar tokens — emite novo par e invalida o refresh anterior' })
  @ApiResponse({ status: 200, description: 'Novo par accessToken + refreshToken' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido, expirado ou já usado' })
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Invalidar refresh-token server-side (idempotente)' })
  @ApiResponse({ status: 204, description: 'Refresh-token revogado' })
  logout(@Body() body: RefreshTokenDto) {
    return this.authService.logout(body);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar email usando token recebido após cadastro' })
  @ApiResponse({ status: 200, description: 'Email verificado' })
  @ApiResponse({ status: 400, description: 'Token inválido' })
  verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar redefinição de senha — envia email com link' })
  @ApiResponse({ status: 200, description: 'Link enviado se email existir' })
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redefinir senha com token recebido por email' })
  @ApiResponse({ status: 200, description: 'Senha redefinida' })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado' })
  resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body);
  }
}
