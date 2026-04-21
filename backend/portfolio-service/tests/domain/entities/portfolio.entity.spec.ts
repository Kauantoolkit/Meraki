import { Portfolio } from '../../../src/domain/entities/portfolio.entity';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

function createPortfolio(overrides: Partial<Portfolio> = {}): Portfolio {
  const p = new Portfolio();
  p.id = 'portfolio-1';
  p.specialistId = 'specialist-1';
  p.title = 'Meu Portfolio';
  p.description = 'Descricao do portfolio';
  p.isPublished = false;
  Object.assign(p, overrides);
  return p;
}

describe('Portfolio Entity', () => {
  describe('canPublish()', () => {
    it('deve retornar true quando tem titulo, descricao e specialistId', () => {
      const p = createPortfolio();
      expect(p.canPublish()).toBe(true);
    });

    it('deve retornar false sem titulo', () => {
      const p = createPortfolio({ title: '' });
      expect(p.canPublish()).toBe(false);
    });

    it('deve retornar false sem descricao', () => {
      const p = createPortfolio({ description: '' });
      expect(p.canPublish()).toBe(false);
    });

    it('deve retornar false sem specialistId', () => {
      const p = createPortfolio({ specialistId: '' });
      expect(p.canPublish()).toBe(false);
    });
  });

  describe('publish()', () => {
    it('deve publicar portfolio valido', () => {
      const p = createPortfolio();
      p.publish();
      expect(p.isPublished).toBe(true);
    });

    it('deve rejeitar publicacao de portfolio ja publicado', () => {
      const p = createPortfolio({ isPublished: true });
      expect(() => p.publish()).toThrow(DomainException);
    });

    it('deve rejeitar publicacao sem dados completos', () => {
      const p = createPortfolio({ title: '' });
      expect(() => p.publish()).toThrow(DomainException);
    });
  });

  describe('unpublish()', () => {
    it('deve despublicar portfolio publicado', () => {
      const p = createPortfolio({ isPublished: true });
      p.unpublish();
      expect(p.isPublished).toBe(false);
    });

    it('deve rejeitar despublicacao de portfolio ja despublicado', () => {
      const p = createPortfolio({ isPublished: false });
      expect(() => p.unpublish()).toThrow(DomainException);
    });
  });

  describe('updateDescription()', () => {
    it('deve atualizar descricao valida', () => {
      const p = createPortfolio();
      p.updateDescription('Nova descricao');
      expect(p.description).toBe('Nova descricao');
    });

    it('deve rejeitar descricao vazia', () => {
      const p = createPortfolio();
      expect(() => p.updateDescription('')).toThrow(DomainException);
    });

    it('deve rejeitar descricao com apenas espacos', () => {
      const p = createPortfolio();
      expect(() => p.updateDescription('   ')).toThrow(DomainException);
    });
  });
});
