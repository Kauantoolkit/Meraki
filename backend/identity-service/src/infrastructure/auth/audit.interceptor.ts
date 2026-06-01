import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditLogService } from '../../application/services/audit-log.service';
import { AuditAction } from '../../domain/entities/audit-log.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    // Extrai IP do cliente
    const ipAddress =
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.connection.remoteAddress ||
      'unknown';

    const userAgent = request.headers['user-agent'] || 'unknown';

    return next.handle().pipe(
      tap(async (response) => {
        // Log de sucesso
        const statusCode = context.switchToHttp().getResponse().statusCode;

        // Não loga requisições GET para evitar spam
        if (method === 'GET') {
          return;
        }

        // Log de ações autenticadas
        if (user?.id) {
          await this.logAuthenticatedAction(
            method,
            url,
            user,
            ipAddress,
            userAgent,
            statusCode,
          );
        }
      }),
      catchError(async (error) => {
        // Log de erro
        const statusCode = error.status || 500;

        if (user?.id) {
          if (statusCode === 403) {
            await this.auditLogService.logAccessDenied(
              user.id,
              url.split('/')[2],
              error.message,
              ipAddress,
            );
          }
        } else if (statusCode === 401 || statusCode === 403) {
          await this.auditLogService.logAccessDenied(
            null,
            url.split('/')[2],
            error.message,
            ipAddress,
          );
        }

        throw error;
      }),
    );
  }

  private async logAuthenticatedAction(
    method: string,
    url: string,
    user: any,
    ipAddress: string,
    userAgent: string,
    statusCode: number,
  ): Promise<void> {
    const resource = this.extractResource(url);

    if (method === 'POST' && url.includes('/auth/register')) {
      await this.auditLogService.logUserRegistered(
        user.id,
        user.email,
        user.userType,
        ipAddress,
      );
    } else if (method === 'POST' && url.includes('/auth/logout')) {
      await this.auditLogService.logLogout(user.id, ipAddress);
    } else if (method === 'PUT' && url.includes('/profile')) {
      // Log genérico de update (detalhe dos campos é feito no use-case)
      await this.auditLogService.log({
        userId: user.id,
        action: AuditAction.PROFILE_UPDATED,
        resource: 'profile',
        description: `Requisição de atualização para ${resource}`,
        ipAddress,
        userAgent,
        statusCode: statusCode.toString(),
      });
    } else if (method === 'DELETE' && url.includes('/users/me')) {
      await this.auditLogService.logUserDeleted(user.id, user.email, ipAddress);
    }
  }

  private extractResource(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'unknown';
  }
}
