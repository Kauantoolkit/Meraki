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

export class InvalidPasswordException extends DomainException {
  constructor(reason: string) {
    super(`Senha inválida: ${reason}`);
  }
}

export class InvalidCNPJException extends DomainException {
  constructor(cnpj: string) {
    super(`CNPJ inválido: "${cnpj}"`);
  }
}

export class InvalidCPFException extends DomainException {
  constructor(cpf: string) {
    super(`CPF inválido: "${cpf}"`);
  }
}

export class InvalidPhoneException extends DomainException {
  constructor(phone: string) {
    super(`Telefone inválido: "${phone}"`);
  }
}

export class UserAlreadyDeactivatedException extends DomainException {
  constructor() {
    super('Usuário já está desativado');
  }
}

export class UserAlreadyActivatedException extends DomainException {
  constructor() {
    super('Usuário já está ativo');
  }
}

export class InvalidUserNameException extends DomainException {
  constructor(reason: string) {
    super(`Nome inválido: ${reason}`);
  }
}
