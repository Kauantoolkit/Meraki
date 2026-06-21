import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQConfigService } from '../rabbitmq-config.service';
import { NotificationRepository } from '../../repositories/notification.repository';

const PROJECT_SERVICE_URL = process.env.PROJECT_SERVICE_URL || 'http://project-service:3002';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'meraki-internal-key';

@Injectable()
export class NotificationConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private readonly rabbitmq: RabbitMQConfigService,
    private readonly notificationRepo: NotificationRepository,
  ) {}

  /**
   * Busca o companyId do projeto via API interna do project-service.
   */
  private async fetchCompanyIdByProject(projectId: string): Promise<string | null> {
    try {
      const res = await fetch(
        `${PROJECT_SERVICE_URL}/api/internal/projects/${projectId}`,
        { headers: { 'X-API-Key': INTERNAL_API_KEY } },
      );
      if (!res.ok) {
        this.logger.warn(`Falha ao buscar projeto ${projectId}: status ${res.status}`);
        return null;
      }
      const project = await res.json();
      return project.companyId ?? null;
    } catch (err) {
      this.logger.error(`Erro ao buscar companyId do projeto ${projectId}`, err);
      return null;
    }
  }

  async onModuleInit() {
    // Empresa recebe: nova proposta, proposta retirada, entrega submetida
    await this.rabbitmq.subscribe('messaging.events.bid-submitted', 'bid.submitted', (msg) =>
      this.handleBidSubmitted(msg),
    );
    await this.rabbitmq.subscribe('messaging.events.bid-withdrawn', 'bid.withdrawn', (msg) =>
      this.handleBidWithdrawn(msg),
    );
    await this.rabbitmq.subscribe('messaging.events.delivery-submitted', 'delivery.submitted', (msg) =>
      this.handleDeliverySubmitted(msg),
    );

    // Especialista recebe: proposta aceita/rejeitada, milestone aprovada, pagamento, skill validada
    await this.rabbitmq.subscribe('messaging.events.bid-accepted', 'bid.accepted', (msg) =>
      this.handleBidAccepted(msg),
    );
    await this.rabbitmq.subscribe('messaging.events.bid-rejected', 'bid.rejected', (msg) =>
      this.handleBidRejected(msg),
    );
    await this.rabbitmq.subscribe('messaging.events.milestone-validated', 'milestone.validated', (msg) =>
      this.handleMilestoneValidated(msg),
    );
    await this.rabbitmq.subscribe('messaging.events.payment-released', 'payment.released', (msg) =>
      this.handlePaymentReleased(msg),
    );
    await this.rabbitmq.subscribe('messaging.events.skill-validated', 'skill.validated', (msg) =>
      this.handleSkillValidated(msg),
    );
    await this.rabbitmq.subscribe('messaging.events.project-completed', 'project.completed', (msg) =>
      this.handleProjectCompleted(msg),
    );
  }

  // ─── Notificações para EMPRESA ──────────────────────────────────────────────

  private async handleBidSubmitted(msg: any) {
    const { projectId, specialistId } = msg.payload ?? msg;
    this.logger.log(`bid.submitted: projeto ${projectId}`);
    const companyId = await this.fetchCompanyIdByProject(projectId);
    if (!companyId) {
      this.logger.warn(`bid.submitted: companyId não encontrado para projeto ${projectId}, notificação descartada`);
      return;
    }
    await this.notificationRepo.create({
      userId: companyId,
      type: 'bid.submitted',
      title: 'Nova proposta recebida',
      message: 'Um especialista enviou uma proposta para seu projeto.',
      metadata: { projectId, specialistId },
    });
  }

  private async handleBidWithdrawn(msg: any) {
    const { projectId, specialistId } = msg.payload ?? msg;
    const companyId = await this.fetchCompanyIdByProject(projectId);
    if (!companyId) {
      this.logger.warn(`bid.withdrawn: companyId não encontrado para projeto ${projectId}, notificação descartada`);
      return;
    }
    await this.notificationRepo.create({
      userId: companyId,
      type: 'bid.withdrawn',
      title: 'Proposta retirada',
      message: 'Um especialista retirou sua proposta.',
      metadata: { projectId, specialistId },
    });
  }

  private async handleDeliverySubmitted(msg: any) {
    const { projectId, milestoneId } = msg.payload ?? msg;
    const companyId = await this.fetchCompanyIdByProject(projectId);
    if (!companyId) {
      this.logger.warn(`delivery.submitted: companyId não encontrado para projeto ${projectId}, notificação descartada`);
      return;
    }
    await this.notificationRepo.create({
      userId: companyId,
      type: 'delivery.submitted',
      title: 'Entrega submetida',
      message: 'Uma milestone foi submetida para validação.',
      metadata: { projectId, milestoneId },
    });
  }

  // ─── Notificações para ESPECIALISTA ─────────────────────────────────────────

  private async handleBidAccepted(msg: any) {
    const { specialistId, projectId } = msg.payload ?? msg;
    await this.notificationRepo.create({
      userId: specialistId,
      type: 'bid.accepted',
      title: 'Proposta aceita!',
      message: 'Sua proposta foi aceita. Você pode iniciar o projeto.',
      metadata: { projectId },
    });
  }

  private async handleBidRejected(msg: any) {
    const { specialistId, projectId } = msg.payload ?? msg;
    await this.notificationRepo.create({
      userId: specialistId,
      type: 'bid.rejected',
      title: 'Proposta rejeitada',
      message: 'Sua proposta foi rejeitada pela empresa.',
      metadata: { projectId },
    });
  }

  private async handleMilestoneValidated(msg: any) {
    const { specialistId, projectId, milestoneId } = msg.payload ?? msg;
    await this.notificationRepo.create({
      userId: specialistId,
      type: 'milestone.validated',
      title: 'Milestone aprovada',
      message: 'Sua entrega foi aprovada e o pagamento será liberado.',
      metadata: { projectId, milestoneId },
    });
  }

  private async handlePaymentReleased(msg: any) {
    const { specialistId, amount, specialistAmount } = msg.payload ?? msg;
    const value = specialistAmount ?? amount;
    await this.notificationRepo.create({
      userId: specialistId,
      type: 'payment.released',
      title: 'Pagamento liberado',
      message: `R$ ${Number(value).toFixed(2)} foi liberado para sua conta.`,
      metadata: { amount: value },
    });
  }

  private async handleSkillValidated(msg: any) {
    const { specialistId, skillName } = msg.payload ?? msg;
    await this.notificationRepo.create({
      userId: specialistId,
      type: 'skill.validated',
      title: 'Habilidade validada',
      message: `Sua skill "${skillName}" foi validada com sucesso.`,
      metadata: { skillName },
    });
  }

  private async handleProjectCompleted(msg: any) {
    const { specialistId, companyId, projectId } = msg.payload ?? msg;
    if (specialistId) {
      await this.notificationRepo.create({
        userId: specialistId,
        type: 'project.completed',
        title: 'Projeto concluído',
        message: 'O projeto foi marcado como concluído. Parabéns!',
        metadata: { projectId },
      });
    }
    if (companyId) {
      await this.notificationRepo.create({
        userId: companyId,
        type: 'project.completed',
        title: 'Projeto concluído',
        message: 'Seu projeto foi concluído com sucesso.',
        metadata: { projectId },
      });
    }
  }
}
