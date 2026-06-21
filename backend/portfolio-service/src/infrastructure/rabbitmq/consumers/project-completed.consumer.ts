import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQConfigService } from '../rabbitmq-config.service';
import { UpdateCompletedProjectsUseCase } from '../../../application/use-cases/update-completed-projects.use-case';
import { SpecialistProfileRepository } from '../../repositories/specialist-profile.repository';

/** project.completed → incrementa completedProjects e faz upgrade yellow→green nos badges */
@Injectable()
export class ProjectCompletedConsumer implements OnModuleInit {
  private readonly logger = new Logger(ProjectCompletedConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQConfigService,
    private readonly updateCompletedProjects: UpdateCompletedProjectsUseCase,
    private readonly profileRepo: SpecialistProfileRepository,
  ) {}

  async onModuleInit() {
    await this.rabbit.subscribe(
      'portfolio.events.project-completed',
      'project.completed',
      async (message) => {
        const data = message.payload || message;
        const { specialistId, projectId, requirements } = data;
        this.logger.log(`project.completed: specialist=${specialistId} project=${projectId}`);

        await this.updateCompletedProjects.execute(specialistId);

        // Upgrade yellow → green for each skill in the completed project's requirements
        if (requirements && Array.isArray(requirements) && requirements.length > 0) {
          try {
            const profile = await this.profileRepo.findByAnyId(specialistId);
            if (profile) {
              const badges = profile.skillBadges ?? {};
              let changed = false;
              const skills = profile.skills ?? [];
              for (const skillName of requirements as string[]) {
                const normalized = skillName.trim().toLowerCase();
                if (badges[normalized] !== 'green') {
                  badges[normalized] = 'green';
                  changed = true;
                }
                // Adiciona a skill ao perfil se ainda não existe
                if (!skills.some(s => s.toLowerCase() === normalized)) {
                  skills.push(skillName.trim());
                  changed = true;
                }
              }
              profile.skills = skills;
              if (changed) {
                profile.skillBadges = badges;
                await this.profileRepo.save(profile);
                this.logger.log(
                  `green badge(s) assigned: specialist=${specialistId} skills=${requirements.join(',')}`,
                );
              }
            }
          } catch (err) {
            this.logger.error(`Failed to upgrade badges for specialist=${specialistId}: ${err}`);
          }
        }
      },
    );
  }
}
