import { Injectable } from '@nestjs/common';
import { HistoryRepository } from '../../infrastructure/repositories/history.repository';

/** RF11 — Histórico de atividades do projeto */
@Injectable()
export class GetProjectHistoryUseCase {
  constructor(private readonly historyRepo: HistoryRepository) {}

  execute(projectId: string) {
    return this.historyRepo.findByProject(projectId);
  }
}
