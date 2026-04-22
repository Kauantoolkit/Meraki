import { DomainException } from '../exceptions/domain.exception';

/**
 * Domain Service — Progressão sequencial de milestones (RN04).
 * Encapsula a regra que não pertence a nenhum aggregate isolado:
 * a progressão depende do estado de TODOS os milestones do projeto.
 */
export class MilestoneProgressionDomainService {
  /**
   * Valida se o milestone pode ser iniciado com base no progresso dos anteriores.
   * @param milestoneOrder Ordem do milestone a iniciar
   * @param allStatuses Mapa de { order → status } de todos os milestones do projeto
   */
  canStart(milestoneOrder: number, allStatuses: Map<number, string>): boolean {
    if (milestoneOrder === 1) return true;

    for (let i = 1; i < milestoneOrder; i++) {
      const status = allStatuses.get(i);
      if (status !== 'APPROVED') {
        return false;
      }
    }
    return true;
  }

  assertCanStart(milestoneOrder: number, allStatuses: Map<number, string>): void {
    if (!this.canStart(milestoneOrder, allStatuses)) {
      throw new DomainException(
        `Milestone ${milestoneOrder} não pode ser iniciado: milestones anteriores ainda não foram aprovados (RN04)`,
      );
    }
  }
}
