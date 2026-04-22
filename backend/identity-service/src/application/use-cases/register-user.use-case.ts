import {
  Injectable,
  ConflictException,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserType } from '../../domain/enums/user-type.enum';
import { UserFactory } from '../../domain/factories/user.factory';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly eventPublisher: EventPublisherService,
    private readonly userFactory: UserFactory,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    // Factory valida invariantes (email, password, name, companyName para COMPANY)
    const { user, validatedPassword } = this.userFactory.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      userType: dto.userType,
      companyName: dto.companyName,
    });

    // Verifica unicidade de email
    const existingUser = await this.userRepository.findByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    // Hash do password (responsabilidade da aplicação, não do domínio)
    user.passwordHash = await bcrypt.hash(validatedPassword.value, 10);

    // Persiste o User
    const savedUser = await this.userRepository.create(user);

    let specialistId: string | undefined;
    let companyId: string | undefined;

    // Cria perfil conforme userType usando Factory
    if (dto.userType === UserType.SPECIALIST) {
      const profile = this.userFactory.createSpecialistProfile(savedUser.id);
      const savedProfile = await this.userRepository.createSpecialistProfile(profile);
      specialistId = savedProfile.id;
      savedUser.linkSpecialistProfile(savedProfile.id);
      await this.userRepository.update(savedUser.id, { specialistId: savedProfile.id });
    } else {
      const profile = this.userFactory.createCompanyProfile(savedUser.id, dto.companyName);
      const savedProfile = await this.userRepository.createCompanyProfile(profile);
      companyId = savedProfile.id;
      savedUser.linkCompanyProfile(savedProfile.id);
      await this.userRepository.update(savedUser.id, { companyId: savedProfile.id });
    }

    // Publica Integration Event
    const event = new UserRegisteredEvent({
      userId: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      userType: savedUser.userType as 'COMPANY' | 'SPECIALIST',
      companyId,
      specialistId,
      companyName: dto.companyName,
    });
    await this.eventPublisher.publishUserRegistered(event.payload);

    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      userType: savedUser.userType,
      specialistId,
      companyId,
      createdAt: savedUser.createdAt,
    };
  }
}
