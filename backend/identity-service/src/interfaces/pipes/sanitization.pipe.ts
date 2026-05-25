import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { XssSanitizerService } from '../../infrastructure/security/xss-sanitizer.service';

/**
 * Pipe global que sanitiza strings em todos os DTOs
 * Remove tags HTML perigosas e padrões de XSS
 *
 * Aplicado APÓS ValidationPipe para garantir que dados válidos sejam sanitizados
 */
@Injectable()
export class SanitizationPipe implements PipeTransform {
  constructor(private readonly sanitizer: XssSanitizerService) {}

  transform(value: any): any {
    // Detecta e rejeita tentativas de XSS
    if (typeof value === 'string' && this.sanitizer.isSuspicious(value)) {
      throw new BadRequestException(
        'Input contém padrões suspeitos de XSS (tags, scripts, event handlers)',
      );
    }

    return this.transformValue(value);
  }

  private transformValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      return this.sanitizer.sanitize(value);
    }

    if (Array.isArray(value)) {
      return value.map(item => this.transformValue(item));
    }

    if (typeof value === 'object') {
      const transformed = { ...value };
      Object.keys(transformed).forEach(key => {
        transformed[key] = this.transformValue(transformed[key]);
      });
      return transformed;
    }

    return value;
  }
}
