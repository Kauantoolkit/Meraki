import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQService } from '@shared/infra/messaging/rabbitmq.service';
import { IdentityRoutingKey } from '@shared/contracts/events/identity.events';
import { CreateSpecialistProfileUseCase } from '../../../application/use-cases/create-specialist-profile.use-case';
import { CreateCompanyProfileUseCase } from '../../../application/use-cases/create-company-profile.use-case';

/** user.registered -> cria perfil publico inicial (SPECIALIST ou COMPANY) */
@Injectable()
export class UserRegisteredConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserRegisteredConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQService,
    private readonly createSpecialistProfile: CreateSpecialistProfileUseCase,
    private readonly createCompanyProfile: CreateCompanyProfileUseCase,
  ) {}

  async onModuleInit() {
    await this.rabbit.subscribe(
      'portfolio.events.user-registered',
      IdentityRoutingKey.USER_REGISTERED,
      async (message) => {
        const { userId, userType, name, companyName } = message.payload || message;
        if (userType === 'SPECIALIST') {
          await this.createSpecialistProfile.execute(userId, name);
        } else if (userType === 'COMPANY') {
          await this.createCompanyProfile.execute(userId, companyName);
        }
      },
    );
  }
}
