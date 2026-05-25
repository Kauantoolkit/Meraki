import { DomainException } from '../exceptions/domain.exception';

/**
 * Value Object — ProposalText
 * Encapsula e valida o texto de uma proposta.
 * Comparado por atributos, sem identidade própria.
 */
export class ProposalText {
  static readonly MIN_LENGTH = 20;
  static readonly MAX_LENGTH = 2000;

  private readonly value: string;

  constructor(text: string) {
    const trimmed = (text ?? '').trim();

    if (trimmed.length < ProposalText.MIN_LENGTH) {
      throw new DomainException(
        `Proposta deve ter pelo menos ${ProposalText.MIN_LENGTH} caracteres`,
      );
    }
    if (trimmed.length > ProposalText.MAX_LENGTH) {
      throw new DomainException(
        `Proposta não pode ultrapassar ${ProposalText.MAX_LENGTH} caracteres`,
      );
    }

    this.value = trimmed;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProposalText): boolean {
    return this.value === other.value;
  }
}
