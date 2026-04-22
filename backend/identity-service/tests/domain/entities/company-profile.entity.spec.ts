import { CompanyProfile } from '../../../src/domain/entities/company-profile.entity';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

function createCompany(overrides: Partial<CompanyProfile> = {}): CompanyProfile {
  const c = new CompanyProfile();
  c.id = 'company-1';
  c.userId = 'user-1';
  c.companyName = 'Empresa Teste';
  c.industry = 'Tecnologia';
  c.companySize = '11-50';
  c.website = 'https://empresa.com';
  Object.assign(c, overrides);
  return c;
}

describe('CompanyProfile Entity', () => {
  describe('updateCompanyName()', () => {
    it('deve atualizar nome valido', () => {
      const c = createCompany();
      c.updateCompanyName('Novo Nome');
      expect(c.companyName).toBe('Novo Nome');
    });

    it('deve rejeitar nome com menos de 2 caracteres', () => {
      const c = createCompany();
      expect(() => c.updateCompanyName('A')).toThrow(DomainException);
    });

    it('deve rejeitar nome vazio', () => {
      const c = createCompany();
      expect(() => c.updateCompanyName('')).toThrow(DomainException);
    });
  });

  describe('updateIndustry()', () => {
    it('deve atualizar industria', () => {
      const c = createCompany();
      c.updateIndustry('Financeiro');
      expect(c.industry).toBe('Financeiro');
    });

    it('deve aceitar null', () => {
      const c = createCompany();
      c.updateIndustry(null as any);
      expect(c.industry).toBeNull();
    });
  });

  describe('updateCompanySize()', () => {
    it('deve aceitar tamanhos validos', () => {
      const validSizes = ['1-10', '11-50', '51-200', '201-500', '500+'];
      for (const size of validSizes) {
        const c = createCompany();
        c.updateCompanySize(size);
        expect(c.companySize).toBe(size);
      }
    });

    it('deve rejeitar tamanho invalido', () => {
      const c = createCompany();
      expect(() => c.updateCompanySize('1000+')).toThrow(DomainException);
    });

    it('deve aceitar null/vazio', () => {
      const c = createCompany();
      c.updateCompanySize('');
      expect(c.companySize).toBeNull();
    });
  });

  describe('updateWebsite()', () => {
    it('deve aceitar URL com https', () => {
      const c = createCompany();
      c.updateWebsite('https://example.com');
      expect(c.website).toBe('https://example.com');
    });

    it('deve aceitar URL com http', () => {
      const c = createCompany();
      c.updateWebsite('http://example.com');
      expect(c.website).toBe('http://example.com');
    });

    it('deve rejeitar URL sem protocolo', () => {
      const c = createCompany();
      expect(() => c.updateWebsite('example.com')).toThrow(DomainException);
    });

    it('deve aceitar null/vazio', () => {
      const c = createCompany();
      c.updateWebsite('');
      expect(c.website).toBeNull();
    });
  });
});
