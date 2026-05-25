import { Injectable } from '@nestjs/common';
import { AuditLog, AuditAction } from '../../domain/entities/audit-log.entity';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';

interface AuditLogInput {
  userId?: string;
  action: AuditAction;
  resource: string;
  description?: string;
  changes?: Record<string, { before: any; after: any }>;
  ipAddress?: string;
  userAgent?: string;
  statusCode?: string;
}

@Injectable()
export class AuditLogService {
  constructor(
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  /**
   * Registra uma ação de auditoria
   */
  async log(input: AuditLogInput): Promise<AuditLog> {
    const auditLog = new AuditLog({
      userId: input.userId || null,
      action: input.action,
      resource: input.resource,
      description: input.description,
      changes: input.changes || null,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      statusCode: input.statusCode,
    });

    return this.auditLogRepository.create(auditLog);
  }

  /**
   * Registra login bem-sucedido
   */
  async logLoginSuccess(
    userId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      userId,
      action: AuditAction.LOGIN_SUCCESS,
      resource: 'authentication',
      description: `Login bem-sucedido para ${email}`,
      ipAddress,
      userAgent,
      statusCode: '200',
    });
  }

  /**
   * Registra tentativa de login falhada
   */
  async logLoginFailed(
    email: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      userId: null,
      action: AuditAction.LOGIN_FAILED,
      resource: 'authentication',
      description: `Tentativa de login falhada para ${email}`,
      ipAddress,
      userAgent,
      statusCode: '401',
    });
  }

  /**
   * Registra logout
   */
  async logLogout(userId: string, ipAddress?: string): Promise<AuditLog> {
    return this.log({
      userId,
      action: AuditAction.LOGOUT,
      resource: 'authentication',
      description: 'Logout realizado',
      ipAddress,
      statusCode: '204',
    });
  }

  /**
   * Registra registro de novo usuário
   */
  async logUserRegistered(
    userId: string,
    email: string,
    userType: string,
    ipAddress?: string,
  ): Promise<AuditLog> {
    return this.log({
      userId,
      action: AuditAction.USER_REGISTERED,
      resource: 'user',
      description: `Novo usuário registrado: ${email} (${userType})`,
      ipAddress,
      statusCode: '201',
    });
  }

  /**
   * Registra alteração de perfil
   */
  async logProfileUpdated(
    userId: string,
    changes: Record<string, { before: any; after: any }>,
    ipAddress?: string,
  ): Promise<AuditLog> {
    const changedFields = Object.keys(changes).join(', ');
    return this.log({
      userId,
      action: AuditAction.PROFILE_UPDATED,
      resource: 'profile',
      description: `Perfil atualizado. Campos: ${changedFields}`,
      changes,
      ipAddress,
      statusCode: '200',
    });
  }

  /**
   * Registra alteração de senha
   */
  async logPasswordChanged(
    userId: string,
    ipAddress?: string,
  ): Promise<AuditLog> {
    return this.log({
      userId,
      action: AuditAction.PASSWORD_CHANGED,
      resource: 'user',
      description: 'Senha alterada',
      ipAddress,
      statusCode: '200',
    });
  }

  /**
   * Registra soft-delete de usuário
   */
  async logUserDeleted(
    userId: string,
    email: string,
    ipAddress?: string,
  ): Promise<AuditLog> {
    return this.log({
      userId,
      action: AuditAction.USER_DELETED,
      resource: 'user',
      description: `Usuário deletado (soft-delete): ${email}`,
      ipAddress,
      statusCode: '204',
    });
  }

  /**
   * Registra desativação de usuário
   */
  async logUserDeactivated(userId: string, ipAddress?: string): Promise<AuditLog> {
    return this.log({
      userId,
      action: AuditAction.USER_DEACTIVATED,
      resource: 'user',
      description: 'Usuário desativado',
      ipAddress,
      statusCode: '200',
    });
  }

  /**
   * Registra ativação de usuário
   */
  async logUserActivated(userId: string, ipAddress?: string): Promise<AuditLog> {
    return this.log({
      userId,
      action: AuditAction.USER_ACTIVATED,
      resource: 'user',
      description: 'Usuário ativado',
      ipAddress,
      statusCode: '200',
    });
  }

  /**
   * Registra acesso negado
   */
  async logAccessDenied(
    userId: string | null,
    resource: string,
    reason: string,
    ipAddress?: string,
  ): Promise<AuditLog> {
    return this.log({
      userId: userId || null,
      action: AuditAction.ACCESS_DENIED,
      resource,
      description: `Acesso negado: ${reason}`,
      ipAddress,
      statusCode: '403',
    });
  }

  /**
   * Busca histórico de auditoria por usuário
   */
  async getUserAuditTrail(
    userId: string,
    days = 30,
    limit = 100,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.findByUserId(userId, days, limit);
  }

  /**
   * Busca tentativas de acesso falhadas
   */
  async getFailedAccessAttempts(
    days = 7,
    limit = 100,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.findFailed(days, limit);
  }
}
