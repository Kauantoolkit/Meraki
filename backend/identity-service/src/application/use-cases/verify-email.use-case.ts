import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(token: string): Promise<void> {
    if (!token) {
      throw new BadRequestException('Token de verificação não fornecido');
    }

    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Token inválido ou já utilizado');
    }

    user.isActive = true;
    user.emailVerificationToken = null;
    await this.userRepository.update(user.id, {
      isActive: true,
      emailVerificationToken: null,
    });
  }
}
