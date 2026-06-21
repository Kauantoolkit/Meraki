import { Injectable, Inject } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { EmailService } from '../../infrastructure/email/email.service';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email?.trim().toLowerCase());

    // Sempre retorna sucesso para não revelar se o email existe
    if (!user) return;

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.userRepository.update(user.id, {
      passwordResetToken: token,
      passwordResetExpiresAt: expiresAt,
    });

    await this.emailService.sendPasswordResetEmail(user.email, user.name, token);
  }
}
