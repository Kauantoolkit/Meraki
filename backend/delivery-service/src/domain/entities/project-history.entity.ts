import { DomainException } from '../exceptions/domain.exception';

/** Aggregate Root — RN07: histórico automático de atividades do projeto */
export class ProjectHistory {
  id: string;
  projectId: string;
  specialistId: string;
  action: string;
  description: string;
  createdAt: Date;

  // ── Factory Method ────────────────────────────────────────────────

  static createEntry(
    projectId: string,
    action: string,
    description?: string,
    specialistId?: string,
  ): ProjectHistory {
    if (!projectId || projectId.trim().length === 0) {
      throw new DomainException('O ID do projeto é obrigatório para o histórico.');
    }
    if (!action || action.trim().length === 0) {
      throw new DomainException('A ação do histórico é obrigatória.');
    }
    const entry = new ProjectHistory();
    entry.projectId = projectId;
    entry.action = action.trim();
    entry.description = description?.trim() ?? null;
    entry.specialistId = specialistId ?? null;
    return entry;
  }
}
