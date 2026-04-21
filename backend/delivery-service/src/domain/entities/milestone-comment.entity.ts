import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DomainException } from '../exceptions/domain.exception';

@Entity('milestone_comments')
export class MilestoneComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  milestoneId: string;

  @Column()
  userId: string;

  @Column('text')
  comment: string;

  @Column({ nullable: true })
  editedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ── Behavior Methods ──────────────────────────────────────────────

  /**
   * Edita o conteúdo do comentário. Apenas o autor pode editar.
   */
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

  /** Verifica se o comentário já foi editado. */
  isEdited(): boolean {
    return this.editedAt !== null && this.editedAt !== undefined;
  }
}
