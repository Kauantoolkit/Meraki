import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  USER_REGISTERED = 'USER_REGISTERED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
}

/**
 * Entidade de auditoria para rastrear ações importantes do sistema
 * Permite conformidade com RNF08 (não-repúdio e rastreabilidade)
 */
@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['createdAt'])
@Index(['userId', 'action', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ type: 'varchar', length: 100 })
  resource: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  changes: Record<string, { before: any; after: any }> | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  statusCode: string | null;

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial?: Partial<AuditLog>) {
    Object.assign(this, partial);
  }
}
