import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

/**
 * Guard para comunicação inter-serviço via API Key fixa.
 * Valida o header X-API-Key contra a variável INTERNAL_API_KEY.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const expected = process.env.INTERNAL_API_KEY || 'meraki-internal-key';

    if (!apiKey || apiKey !== expected) {
      throw new UnauthorizedException('API Key inválida');
    }
    return true;
  }
}
