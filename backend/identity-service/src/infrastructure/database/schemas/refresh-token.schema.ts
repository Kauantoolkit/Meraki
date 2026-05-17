import { EntitySchema } from 'typeorm';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';

export const RefreshTokenSchema = new EntitySchema<RefreshToken>({
  name: 'RefreshToken',
  target: RefreshToken,
  tableName: 'refresh_tokens',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    jti: { type: 'uuid', unique: true },
    userId: { type: 'uuid' },
    tokenHash: { type: 'varchar', length: 255 },
    expiresAt: { type: 'timestamp' },
    revokedAt: { type: 'timestamp', nullable: true },
    replacedByJti: { type: 'uuid', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
  },
  indices: [
    { name: 'idx_refresh_tokens_user', columns: ['userId'] },
    { name: 'idx_refresh_tokens_jti', columns: ['jti'] },
  ],
});
