import { Injectable, Logger } from '@nestjs/common';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { EscrowAccountRepository } from '../../infrastructure/repositories/escrow-account.repository';
import { PaymentFactory } from '../../domain/factories/payment.factory';
import { EscrowAccount, EscrowStatus } from '../../domain/entities/escrow-account.entity';
import { Money } from '../../domain/value-objects/money.value-object';
import axios from 'axios';

export interface CreateEscrowDto {
  projectId: string;
  specialistId: string;
  proposedBudget: number;
  milestoneProposals?: Array<{ milestoneId: string; proposedAmount: number }>;
}

@Injectable()
export class CreateEscrowOnBidAcceptedUseCase {
  private readonly logger = new Logger(CreateEscrowOnBidAcceptedUseCase.name);

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly escrowRepo: EscrowAccountRepository,
    private readonly paymentFactory: PaymentFactory,
  ) {}

  async execute(dto: CreateEscrowDto): Promise<void> {
    // 1. Buscar milestones do projeto via HTTP no project-service
    const projectServiceUrl = process.env.PROJECT_SERVICE_URL || 'http://project-service:3002';
    let milestones: Array<{ id: string; amount: number }>;

    const apiKey = process.env.INTERNAL_API_KEY || 'meraki-internal-key';

    try {
      const { data } = await axios.get(
        `${projectServiceUrl}/api/internal/projects/${dto.projectId}/milestones`,
        { headers: { 'x-api-key': apiKey } },
      );
      milestones = Array.isArray(data) ? data : data.milestones ?? [];
    } catch (err) {
      this.logger.error(`Falha ao buscar milestones do projeto ${dto.projectId}: ${err.message}`);
      throw err;
    }

    if (milestones.length === 0) {
      this.logger.warn(`Projeto ${dto.projectId} sem milestones — distribuindo budget como milestone único`);
      milestones = [{ id: `single-${dto.projectId}`, amount: dto.proposedBudget }];
    }

    // 2. Criar EscrowAccount para o projeto
    let escrow = await this.escrowRepo.findByProject(dto.projectId);
    if (!escrow) {
      escrow = new EscrowAccount();
      escrow.projectId = dto.projectId;
      escrow.totalAmount = 0;
      escrow.heldAmount = 0;
      escrow.releasedAmount = 0;
      escrow.status = EscrowStatus.OPEN;
    }

    // 3. Criar um Payment por milestone em ESCROW_HELD
    //    Usa o valor proposto pelo especialista (milestoneProposals) para cada milestone.
    //    Fallback: distribui igualmente se não houver proposals.
    const proposalMap = new Map<string, number>();
    if (dto.milestoneProposals?.length) {
      for (const mp of dto.milestoneProposals) {
        proposalMap.set(mp.milestoneId, Number(mp.proposedAmount));
      }
    }

    let totalHeld = 0;
    for (const milestone of milestones) {
      const existing = await this.paymentRepo.findByMilestone(milestone.id);
      if (existing) {
        this.logger.warn(`Payment já existe para milestone ${milestone.id} — ignorando`);
        continue;
      }

      const amount = proposalMap.get(milestone.id)
        ?? Number((dto.proposedBudget / milestones.length).toFixed(2));
      const payment = this.paymentFactory.create({
        milestoneId: milestone.id,
        projectId: dto.projectId,
        specialistId: dto.specialistId,
        amount,
      });

      await this.paymentRepo.save(payment);
      totalHeld += amount;
      this.logger.log(`Payment criado: milestone=${milestone.id} amount=R$${amount}`);
    }

    // 4. Atualizar escrow com total retido
    if (totalHeld > 0) {
      escrow.holdFunds(new Money(totalHeld));
      await this.escrowRepo.save(escrow);
      this.logger.log(`Escrow criado: projeto=${dto.projectId} total=R$${totalHeld}`);
    }
  }
}
