import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { AuthResponseDto } from '../dto/user-response.dto';
import { TokenService } from '../services/token.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(rawRefreshToken: string): Promise<AuthResponseDto> {
    const { userId, jti } = await this.tokenService.validateRefreshToken(rawRefreshToken);

    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuário inválido');
    }

    // Rotação: emite novo par e revoga o refresh antigo apontando para o novo jti
    const pair = await this.tokenService.issueTokenPair(user);
    // O novo jti está embutido no refreshToken; extrai do payload sem precisar reverificar
    const newJti = JSON.parse(
      Buffer.from(pair.refreshToken.split('.')[1], 'base64url').toString('utf8'),
    ).jti as string;
    await this.tokenService.revokeRefreshToken(jti, newJti);

    return {
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
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
