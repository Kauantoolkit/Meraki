import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserType } from '../../domain/enums/user-type.enum';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    let profile = null;

    if (user.userType === UserType.SPECIALIST) {
      profile = await this.userRepository.findSpecialistProfileByUserId(userId);
    } else {
      profile = await this.userRepository.findCompanyProfileByUserId(userId);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      specialistId: user.specialistId,
      companyId: user.companyId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      profile,
    };
  }
}
