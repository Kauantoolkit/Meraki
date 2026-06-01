import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { AuditLog, AuditAction } from '../../domain/entities/audit-log.entity';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';

@Injectable()
export class TypeormAuditLogRepository implements IAuditLogRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  async create(log: Partial<AuditLog>): Promise<AuditLog> {
    const auditLog = this.repository.create(log);
    return this.repository.save(auditLog);
  }

  async findByUserId(
    userId: string,
    days = 30,
    limit = 100,
  ): Promise<AuditLog[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.repository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.createdAt >= :since', { since })
      .orderBy('log.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async findByAction(
    action: AuditAction,
    days = 30,
    limit = 100,
  ): Promise<AuditLog[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.repository
      .createQueryBuilder('log')
      .where('log.action = :action', { action })
      .andWhere('log.createdAt >= :since', { since })
      .orderBy('log.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async findFailed(days = 30, limit = 100): Promise<AuditLog[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.repository
      .createQueryBuilder('log')
      .where('log.action IN (:...actions)', {
        actions: [AuditAction.LOGIN_FAILED, AuditAction.ACCESS_DENIED],
      })
      .andWhere('log.createdAt >= :since', { since })
      .orderBy('log.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async findAll(days = 30, limit = 100): Promise<AuditLog[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.repository
      .createQueryBuilder('log')
      .where('log.createdAt >= :since', { since })
      .orderBy('log.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }
}
