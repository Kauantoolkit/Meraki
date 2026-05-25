import { AuditLog, AuditAction } from '../entities/audit-log.entity';

export interface IAuditLogRepository {
  create(log: Partial<AuditLog>): Promise<AuditLog>;

  findByUserId(
    userId: string,
    days?: number,
    limit?: number,
  ): Promise<AuditLog[]>;

  findByAction(
    action: AuditAction,
    days?: number,
    limit?: number,
  ): Promise<AuditLog[]>;

  findFailed(days?: number, limit?: number): Promise<AuditLog[]>;

  findAll(days?: number, limit?: number): Promise<AuditLog[]>;
}
