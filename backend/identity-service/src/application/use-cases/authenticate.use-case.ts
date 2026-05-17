import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/user-response.dto';
import { Password } from '../../domain/value-objects/password.value-object';
import { TokenService } from '../services/token.service';

@Injectable()
export class AuthenticateUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(
      dto.email.toLowerCase().trim(),
    );

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await Password.matches(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { accessToken, refreshToken } = await this.tokenService.issueTokenPair(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        specialistId: user.specialistId,
        companyId: user.companyId,
        createdAt: user.createdAt,
      },
    };
  }
}
