import { DomainException } from '../exceptions/domain.exception';

export class MilestoneComment {
  id: string;
  milestoneId: string;
  userId: string;
  comment: string;
  editedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // ── Behavior Methods ──────────────────────────────────────────────

  editContent(newContent: string, requestingUserId: string): void {
    if (this.userId !== requestingUserId) {
      throw new DomainException('Apenas o autor pode editar o comentário.');
    }
    if (!newContent || newContent.trim().length === 0) {
      throw new DomainException('O conteúdo do comentário não pode ser vazio.');
    }
    this.comment = newContent.trim();
    this.editedAt = new Date();
  }

  isEdited(): boolean {
    return this.editedAt !== null && this.editedAt !== undefined;
  }
}
