import { Injectable } from '@nestjs/common';
import { TokenService } from '../services/token.service';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly tokenService: TokenService) {}

  /**
   * Tenta invalidar o refresh-token recebido. Em qualquer falha de validação,
   * retorna silenciosamente (idempotente do ponto de vista do client).
   */
  async execute(rawRefreshToken: string): Promise<void> {
    try {
      const { jti } = await this.tokenService.validateRefreshToken(rawRefreshToken);
      await this.tokenService.revokeRefreshToken(jti);
    } catch {
      // refresh já revogado / expirado / inválido — logout idempotente
    }
  }
}
