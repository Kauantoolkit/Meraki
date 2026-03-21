import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanColumn } from '../../domain/entities/kanban-column.entity';
import { KanbanCard } from '../../domain/entities/kanban-card.entity';
import { IKanbanRepository } from '../../domain/repositories/i-kanban.repository';

@Injectable()
export class KanbanRepository implements IKanbanRepository {
  constructor(
    @InjectRepository(KanbanColumn) private readonly columnRepo: Repository<KanbanColumn>,
    @InjectRepository(KanbanCard) private readonly cardRepo: Repository<KanbanCard>,
  ) {}

  findColumnsByProject(projectId: string): Promise<KanbanColumn[]> {
    return this.columnRepo.find({
      where: { projectId },
      relations: ['cards'],
      order: { order: 'ASC' },
    });
  }

  findFirstColumn(projectId: string): Promise<KanbanColumn | null> {
    return this.columnRepo.findOne({ where: { projectId, order: 1 } });
  }

  saveColumns(columns: KanbanColumn[]): Promise<KanbanColumn[]> {
    return this.columnRepo.save(columns);
  }

  saveCard(card: KanbanCard): Promise<KanbanCard> {
    return this.cardRepo.save(card);
  }

  async updateCardStatus(milestoneId: string, status: string): Promise<void> {
    await this.cardRepo.update({ milestoneId }, { milestoneStatus: status });
  }
}
