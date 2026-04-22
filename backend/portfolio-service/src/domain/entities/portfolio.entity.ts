import { DomainException } from '../exceptions/domain.exception';

export class Portfolio {
  id: string;
  specialistId: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  projectUrl: string;
  technologies: string[];
  startDate: Date;
  endDate: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;

  canPublish(): boolean {
    return !!this.title && !!this.description && !!this.specialistId;
  }

  publish(): void {
    if (this.isPublished) {
      throw new DomainException('Portfolio já está publicado');
    }
    if (!this.canPublish()) {
      throw new DomainException('Portfolio precisa de título, descrição e specialistId para ser publicado');
    }
    this.isPublished = true;
  }

  unpublish(): void {
    if (!this.isPublished) {
      throw new DomainException('Portfolio já está despublicado');
    }
    this.isPublished = false;
  }

  updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new DomainException('Descrição não pode ser vazia');
    }
    this.description = description.trim();
  }
}
