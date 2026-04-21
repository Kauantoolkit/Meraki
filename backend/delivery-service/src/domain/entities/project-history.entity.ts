import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { DomainException } from '../exceptions/domain.exception';

/** Aggregate Root — RN07: histórico automático de atividades do projeto */
@Entity('project_histories')
export class ProjectHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @Column({ nullable: true })
  specialistId: string;

  @Column()
  action: string;

  @Column('text', { nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  // ── Factory Method ────────────────────────────────────────────────

  /**
   * Cria uma nova entrada de histórico com validação.
   * RN07 — O histórico de entregas é registrado automaticamente pelo sistema.
   */
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
