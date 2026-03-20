import {
  Injectable,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserType } from '../../domain/enums/user-type.enum';
import { Email } from '../../domain/value-objects/email.value-object';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    // Valida email via Value Object (normaliza lowercase + trim)
    const email = new Email(dto.email);

    // RN: Company obrigatoriamente precisa de companyName
    if (dto.userType === UserType.COMPANY && !dto.companyName) {
      throw new BadRequestException(
        'companyName é obrigatório para contas do tipo COMPANY',
      );
    }

    // Verifica unicidade de email
    const existingUser = await this.userRepository.findByEmail(email.value);
    if (existingUser) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Cria o User (Aggregate Root)
    const user = await this.userRepository.create({
      email: email.value,
      passwordHash,
      name: dto.name,
      userType: dto.userType,
    });

    let specialistId: string | undefined;
    let companyId: string | undefined;

    // Cria perfil conforme userType
    if (dto.userType === UserType.SPECIALIST) {
      const profile = await this.userRepository.createSpecialistProfile({
        userId: user.id,
      });
      specialistId = profile.id;
      await this.userRepository.update(user.id, { specialistId: profile.id });
    } else {
      const profile = await this.userRepository.createCompanyProfile({
        userId: user.id,
        companyName: dto.companyName,
      });
      companyId = profile.id;
      await this.userRepository.update(user.id, { companyId: profile.id });
    }

    // Publica Integration Event (user.registered)
    const event = new UserRegisteredEvent({
      userId: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType as 'COMPANY' | 'SPECIALIST',
      companyId,
      specialistId,
    });
    await this.eventPublisher.publishUserRegistered(event.payload);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      specialistId,
      companyId,
      createdAt: user.createdAt,
    };
  }
}
