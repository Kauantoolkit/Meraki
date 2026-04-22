import { Injectable } from '@nestjs/common';
import { KanbanRepository } from '../../infrastructure/repositories/kanban.repository';

/** RF08 — Kanban board do projeto */
@Injectable()
export class GetKanbanBoardUseCase {
  constructor(private readonly kanbanRepo: KanbanRepository) {}

  async execute(projectId: string) {
    const columns = await this.kanbanRepo.findColumnsByProject(projectId);
    return { projectId, columns };
  }
}
