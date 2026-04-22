import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { AuthenticateUseCase } from '../../application/use-cases/authenticate.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { LoginDto } from '../../application/dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly authenticateUseCase: AuthenticateUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário (company ou specialist)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou companyName ausente' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  async register(@Body() dto: CreateUserDto) {
    return this.registerUserUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário e receber JWT' })
  @ApiResponse({ status: 200, description: 'Login realizado. Retorna accessToken + dados do usuário' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() dto: LoginDto) {
    return this.authenticateUseCase.execute(dto);
  }
}
