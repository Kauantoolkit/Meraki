import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQService } from '@shared/infra/messaging/rabbitmq.service';
import { ProjectRoutingKey } from '@shared/contracts/events/project.events';
import { UpdateCompletedProjectsUseCase } from '../../../application/use-cases/update-completed-projects.use-case';

/** project.completed -> incrementa completedProjects no perfil publico do especialista */
@Injectable()
export class ProjectCompletedConsumer implements OnModuleInit {
  private readonly logger = new Logger(ProjectCompletedConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQService,
    private readonly updateCompletedProjects: UpdateCompletedProjectsUseCase,
  ) {}

  async onModuleInit() {
    await this.rabbit.subscribe(
      'portfolio.events.project-completed',
      ProjectRoutingKey.PROJECT_COMPLETED,
      async (message) => {
        const { specialistId, projectId } = message.payload || message;
        this.logger.log(`project.completed: specialist=${specialistId} project=${projectId}`);
        await this.updateCompletedProjects.execute(specialistId);
      },
    );
  }
}
