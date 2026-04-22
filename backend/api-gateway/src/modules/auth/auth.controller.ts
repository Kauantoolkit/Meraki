import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário (empresa ou especialista)' })
  @ApiResponse({ status: 201, description: 'Usuário criado' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login — retorna JWT' })
  @ApiResponse({ status: 200, description: 'Login realizado' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
