import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserType } from '../../domain/enums/user-type.enum';
import {
  UpdateSpecialistProfileDto,
  UpdateCompanyProfileDto,
} from '../dto/update-profile.dto';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    userId: string,
    dto: UpdateSpecialistProfileDto | UpdateCompanyProfileDto,
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.userType === UserType.SPECIALIST) {
      if (!user.specialistId) {
        throw new NotFoundException('Perfil de especialista não encontrado');
      }
      return this.userRepository.updateSpecialistProfile(
        user.specialistId,
        dto as UpdateSpecialistProfileDto,
      );
    } else {
      if (!user.companyId) {
        throw new NotFoundException('Perfil de empresa não encontrado');
      }
      return this.userRepository.updateCompanyProfile(
        user.companyId,
        dto as UpdateCompanyProfileDto,
      );
    }
  }
}
