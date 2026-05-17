import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User } from '../../domain/entities/user.entity';
import { IRefreshTokenRepository } from '../../domain/repositories/user.repository.interface';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  userType: string;
  specialistId?: string;
  companyId?: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;
  private readonly refreshTtlMs: number;

  constructor(
    private readonly jwtService: JwtService,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokens: IRefreshTokenRepository,
  ) {
    this.accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
    this.refreshTtlMs = parseDurationMs(this.refreshExpiresIn);
  }

  async issueTokenPair(user: User): Promise<TokenPair> {
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
      specialistId: user.specialistId,
      companyId: user.companyId,
    };
    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: this.accessExpiresIn,
    });

    const jti = randomUUID();
    const refreshPayload: RefreshTokenPayload = { sub: user.id, jti, type: 'refresh' };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: this.refreshExpiresIn,
    });

    await this.refreshTokens.create({
      jti,
      userId: user.id,
      tokenHash: await bcrypt.hash(refreshToken, 10),
      expiresAt: new Date(Date.now() + this.refreshTtlMs),
    });

    return { accessToken, refreshToken };
  }

  /**
   * Valida um refresh-token e devolve o registro persistido se estiver válido.
   * Não rotaciona; quem chama decide o próximo passo (rotate ou logout).
   */
  async validateRefreshToken(rawToken: string): Promise<{
    userId: string;
    jti: string;
  }> {
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(rawToken);
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token não é do tipo refresh');
    }

    const stored = await this.refreshTokens.findByJti(payload.jti);
    if (!stored) {
      throw new UnauthorizedException('Refresh token desconhecido');
    }
    if (stored.revokedAt !== null) {
      // Reuso de refresh já rotacionado: medida defensiva — revoga toda a família
      await this.refreshTokens.revokeAllForUser(stored.userId);
      throw new UnauthorizedException('Refresh token já foi utilizado');
    }
    if (stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expirado');
    }

    const matches = await bcrypt.compare(rawToken, stored.tokenHash);
    if (!matches) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    return { userId: stored.userId, jti: stored.jti };
  }

  async revokeRefreshToken(jti: string, replacedBy?: string): Promise<void> {
    await this.refreshTokens.revoke(jti, replacedBy);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokens.revokeAllForUser(userId);
  }
}

/**
 * Converte uma string de duração estilo JWT (`15m`, `7d`, `30s`) em milissegundos.
 * Aceita também valores numéricos (segundos).
 */
function parseDurationMs(value: string): number {
  if (/^\d+$/.test(value)) return parseInt(value, 10) * 1000;
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) {
    throw new Error(`Duração inválida: ${value}`);
  }
  const n = parseInt(match[1], 10);
  const unit = match[2];
  const factor = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
  return n * factor;
}
