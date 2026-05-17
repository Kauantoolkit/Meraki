import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserType } from '../../domain/enums/user-type.enum';
import { UpdateProfileDto } from '../dto/update-profile.dto';

const SPECIALIST_KEYS = ['bio', 'skills', 'experience', 'hourlyRate', 'website'] as const;
const COMPANY_KEYS = [
  'companyName',
  'cnpj',
  'industry',
  'companySize',
  'website',
] as const;

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto) {
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
        pick(dto, SPECIALIST_KEYS),
      );
    }
    if (!user.companyId) {
      throw new NotFoundException('Perfil de empresa não encontrado');
    }
    return this.userRepository.updateCompanyProfile(
      user.companyId,
      pick(dto, COMPANY_KEYS),
    );
  }
}

function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Partial<T> {
  const out: Partial<T> = {};
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}
