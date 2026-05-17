/**
 * Refresh Token persistido. O valor armazenado é o *hash* do token bruto
 * (nunca o plaintext). O `jti` é o identificador opaco que vai no payload do
 * refresh-token JWT e serve para localizar a linha durante o /auth/refresh.
 */
export class RefreshToken {
  id: string;
  jti: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByJti: string | null;
  createdAt: Date;
}
