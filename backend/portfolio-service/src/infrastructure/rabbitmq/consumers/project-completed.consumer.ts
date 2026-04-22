import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQConfigService } from '../rabbitmq-config.service';
import { UpdateCompletedProjectsUseCase } from '../../../application/use-cases/update-completed-projects.use-case';

/** project.completed → incrementa completedProjects no perfil público do especialista */
@Injectable()
export class ProjectCompletedConsumer implements OnModuleInit {
  private readonly logger = new Logger(ProjectCompletedConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQConfigService,
    private readonly updateCompletedProjects: UpdateCompletedProjectsUseCase,
  ) {}

  async onModuleInit() {
    await this.rabbit.subscribe(
      'portfolio.events.project-completed',
      'project.completed',
      async (message) => {
        const { specialistId, projectId } = message.payload || message;
        this.logger.log(`project.completed: specialist=${specialistId} project=${projectId}`);
        await this.updateCompletedProjects.execute(specialistId);
      },
    );
  }
}
