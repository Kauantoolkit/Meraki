import { Injectable } from '@nestjs/common';
import { KanbanColumn } from '../entities/kanban-column.entity';
import { DomainException } from '../exceptions/domain.exception';

@Injectable()
export class KanbanColumnFactory {
  /** Cria as 4 colunas padrão do Kanban para um projeto */
  createDefaultColumns(projectId: string): KanbanColumn[] {
    if (!projectId) throw new DomainException('projectId é obrigatório para criar colunas Kanban');

    const definitions = [
      { title: 'Pendente', order: 1 },
      { title: 'Em Progresso', order: 2 },
      { title: 'Em Revisão', order: 3 },
      { title: 'Concluído', order: 4 },
    ];

    return definitions.map((def) => {
      const column = new KanbanColumn();
      column.projectId = projectId;
      column.title = def.title;
      column.order = def.order;
      return column;
    });
  }
}
