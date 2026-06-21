import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQConfigService } from '../rabbitmq-config.service';
import { SpecialistProfileRepository } from '../../repositories/specialist-profile.repository';

/** skill.validated → atualiza badge amarelo no perfil público do especialista */
@Injectable()
export class SkillValidatedConsumer implements OnModuleInit {
  private readonly logger = new Logger(SkillValidatedConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQConfigService,
    private readonly profileRepo: SpecialistProfileRepository,
  ) {}

  async onModuleInit() {
    await this.rabbit.subscribe(
      'portfolio.events.skill-validated',
      'skill.validated',
      async (message) => {
        const data = message.payload || message;
        const { specialistId, skillName, badge } = data;
        this.logger.log(`skill.validated: specialist=${specialistId} skill=${skillName} badge=${badge}`);

        try {
          const profile = await this.profileRepo.findByAnyId(specialistId);
          if (!profile) return;

          const badges = profile.skillBadges ?? {};
          const skills = profile.skills ?? [];

          // Só seta yellow se ainda não tiver green
          if (badges[skillName] !== 'green') {
            badges[skillName] = badge;
          }
          if (!skills.includes(skillName)) {
            skills.push(skillName);
          }

          profile.skillBadges = badges;
          profile.skills = skills;
          await this.profileRepo.save(profile);
          this.logger.log(`badge ${badge} atribuído: specialist=${specialistId} skill=${skillName}`);
        } catch (err) {
          this.logger.error(`Erro ao atualizar badge para specialist=${specialistId}: ${err}`);
        }
      },
    );
  }
}
