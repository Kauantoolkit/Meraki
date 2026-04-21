import { DomainException } from '../exceptions/domain.exception';

/**
 * Value Object que representa a posição de um card no Kanban.
 * Imutável — qualquer alteração gera uma nova instância.
 */
export class CardPosition {
  readonly columnId: string;
  readonly order: number;

  constructor(columnId: string, order: number) {
    if (!columnId || columnId.trim().length === 0) {
      throw new DomainException('O ID da coluna é obrigatório para a posição do card.');
    }
    if (order < 0) {
      throw new DomainException('A ordem do card não pode ser negativa.');
    }
    this.columnId = columnId;
    this.order = order;
  }

  /** Retorna uma nova posição na mesma coluna com ordem diferente. */
  withOrder(newOrder: number): CardPosition {
    return new CardPosition(this.columnId, newOrder);
  }

  /** Retorna uma nova posição em outra coluna. */
  moveTo(columnId: string, order: number): CardPosition {
    return new CardPosition(columnId, order);
  }

  equals(other: CardPosition): boolean {
    return this.columnId === other.columnId && this.order === other.order;
  }
}
