import { BadRequestException } from '@nestjs/common';

export class DomainException extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

export class InvalidEmailException extends DomainException {
  constructor(email: string) {
    super(`Formato de e-mail inválido: "${email}"`);
  }
}
