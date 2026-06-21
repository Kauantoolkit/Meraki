import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { Password } from '../../domain/value-objects/password.value-object';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    if (!token || !newPassword) {
      throw new BadRequestException('Token e nova senha são obrigatórios');
    }

    // Buscar usuário pelo token
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    // Verificar expiração
    if (!user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new BadRequestException('Token expirado. Solicite um novo link.');
    }

    // Validar e hashear nova senha via Value Object
    const password = new Password(newPassword);
    const hash = await password.hash();

    user.changePassword(hash);
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;

    await this.userRepository.update(user.id, {
      passwordHash: user.passwordHash,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    });
  }
}
