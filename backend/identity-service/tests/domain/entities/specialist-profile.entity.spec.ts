import { SpecialistProfile } from '../../../src/domain/entities/specialist-profile.entity';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

function createProfile(overrides: Partial<SpecialistProfile> = {}): SpecialistProfile {
  const p = new SpecialistProfile();
  p.id = 'profile-1';
  p.userId = 'user-1';
  p.bio = 'Bio do especialista';
  p.skills = ['typescript', 'node.js'];
  p.experience = 5;
  p.hourlyRate = 100;
  p.rating = 4.5;
  Object.assign(p, overrides);
  return p;
}

describe('SpecialistProfile Entity', () => {
  describe('updateBio()', () => {
    it('deve atualizar bio valida', () => {
      const p = createProfile();
      p.updateBio('Nova bio');
      expect(p.bio).toBe('Nova bio');
    });

    it('deve aceitar bio nula', () => {
      const p = createProfile();
      p.updateBio(null as any);
      expect(p.bio).toBeNull();
    });

    it('deve rejeitar bio com mais de 2000 caracteres', () => {
      const p = createProfile();
      expect(() => p.updateBio('a'.repeat(2001))).toThrow(DomainException);
    });

    it('deve aceitar bio com exatamente 2000 caracteres', () => {
      const p = createProfile();
      p.updateBio('a'.repeat(2000));
      expect(p.bio.length).toBe(2000);
    });
  });

  describe('addSkill()', () => {
    it('deve adicionar skill nova', () => {
      const p = createProfile({ skills: [] });
      p.addSkill('React');
      expect(p.skills).toContain('react');
    });

    it('deve normalizar para lowercase', () => {
      const p = createProfile({ skills: [] });
      p.addSkill('TypeScript');
      expect(p.skills).toContain('typescript');
    });

    it('deve rejeitar skill duplicada', () => {
      const p = createProfile({ skills: ['react'] });
      expect(() => p.addSkill('React')).toThrow(DomainException);
    });

    it('deve rejeitar skill vazia', () => {
      const p = createProfile();
      expect(() => p.addSkill('  ')).toThrow(DomainException);
    });

    it('deve inicializar array de skills se nulo', () => {
      const p = createProfile({ skills: null as any });
      p.addSkill('flutter');
      expect(p.skills).toEqual(['flutter']);
    });
  });

  describe('removeSkill()', () => {
    it('deve remover skill existente', () => {
      const p = createProfile({ skills: ['react', 'node.js'] });
      p.removeSkill('React');
      expect(p.skills).not.toContain('react');
    });

    it('deve rejeitar remocao de skill inexistente', () => {
      const p = createProfile({ skills: ['react'] });
      expect(() => p.removeSkill('angular')).toThrow(DomainException);
    });
  });

  describe('updateExperience()', () => {
    it('deve atualizar experiencia valida', () => {
      const p = createProfile();
      p.updateExperience(10);
      expect(p.experience).toBe(10);
    });

    it('deve aceitar zero', () => {
      const p = createProfile();
      p.updateExperience(0);
      expect(p.experience).toBe(0);
    });

    it('deve rejeitar experiencia negativa', () => {
      const p = createProfile();
      expect(() => p.updateExperience(-1)).toThrow(DomainException);
    });

    it('deve rejeitar experiencia maior que 70', () => {
      const p = createProfile();
      expect(() => p.updateExperience(71)).toThrow(DomainException);
    });
  });

  describe('updateHourlyRate()', () => {
    it('deve atualizar taxa valida', () => {
      const p = createProfile();
      p.updateHourlyRate(150);
      expect(p.hourlyRate).toBe(150);
    });

    it('deve rejeitar taxa negativa', () => {
      const p = createProfile();
      expect(() => p.updateHourlyRate(-10)).toThrow(DomainException);
    });
  });

  describe('updateRating()', () => {
    it('deve atualizar rating valido', () => {
      const p = createProfile();
      p.updateRating(4.8);
      expect(p.rating).toBe(4.8);
    });

    it('deve rejeitar rating maior que 5', () => {
      const p = createProfile();
      expect(() => p.updateRating(6)).toThrow(DomainException);
    });

    it('deve rejeitar rating negativo', () => {
      const p = createProfile();
      expect(() => p.updateRating(-1)).toThrow(DomainException);
    });
  });
});
