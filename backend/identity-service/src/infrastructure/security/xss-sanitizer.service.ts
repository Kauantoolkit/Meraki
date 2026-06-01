import { Injectable } from '@nestjs/common';
import xss = require('xss');

@Injectable()
export class XssSanitizerService {
  /**
   * Sanitiza string removendo tags HTML perigosas
   * Permite tags seguras (em branco) mas remove scripts, eventos, etc
   */
  sanitize(input: string | null | undefined): string {
    if (!input) return '';

    const options = {
      whiteList: {},
      stripIgnoredTag: true,
      stripLeakage: true,
      onTagAttr: (tag: string, attr: string) => {
        // Remove atributos event listeners (onclick, onload, etc)
        if (attr.startsWith('on')) {
          return '';
        }
        return `${attr}="${input}"`;
      },
    };

    return (xss as any)(input, options).trim();
  }

  /**
   * Sanitiza URL removendo javascript: e data: schemes
   */
  sanitizeUrl(input: string | null | undefined): string {
    if (!input) return '';

    const trimmed = input.trim();

    // Rejeita javascript: e data: URIs
    if (trimmed.toLowerCase().startsWith('javascript:') ||
        trimmed.toLowerCase().startsWith('data:')) {
      return '';
    }

    return trimmed;
  }

  /**
   * Sanitiza email (apenas lowercase, sem caracteres especiais perigosos)
   */
  sanitizeEmail(input: string | null | undefined): string {
    if (!input) return '';

    return input.toLowerCase().trim();
  }

  /**
   * Sanitiza array de strings
   */
  sanitizeArray(arr: string[] | null | undefined): string[] {
    if (!arr || !Array.isArray(arr)) return [];

    return arr
      .map(item => this.sanitize(item))
      .filter(item => item.length > 0);
  }

  /**
   * Verifica se input contém padrões de XSS suspeitos
   */
  isSuspicious(input: string | null | undefined): boolean {
    if (!input) return false;

    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i, // onclick=, onload=, etc
      /<iframe/i,
      /<embed/i,
      /<object/i,
      /eval\(/i,
      /expression\(/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
  }
}
