import { User } from '../../../src/domain/entities/user.entity';
import { UserType } from '../../../src/domain/enums/user-type.enum';
import {
  DomainException,
  UserAlreadyDeactivatedException,
  UserAlreadyActivatedException,
  InvalidUserNameException,
} from '../../../src/domain/exceptions/domain.exception';

function createUser(overrides: Partial<User> = {}): User {
  const user = new User();
  user.id = 'user-1';
  user.email = 'user@test.com';
  user.passwordHash = 'hashedpassword';
  user.name = 'Test User';
  user.userType = UserType.SPECIALIST;
  user.isActive = true;
  Object.assign(user, overrides);
  return user;
}

describe('User Entity', () => {
  describe('deactivate()', () => {
    it('deve desativar usuario ativo', () => {
      const user = createUser();
      user.deactivate();
      expect(user.isActive).toBe(false);
    });

    it('deve falhar ao desativar usuario ja desativado', () => {
      const user = createUser({ isActive: false });
      expect(() => user.deactivate()).toThrow(UserAlreadyDeactivatedException);
    });
  });

  describe('activate()', () => {
    it('deve ativar usuario desativado', () => {
      const user = createUser({ isActive: false });
      user.activate();
      expect(user.isActive).toBe(true);
    });

    it('deve falhar ao ativar usuario ja ativo', () => {
      const user = createUser();
      expect(() => user.activate()).toThrow(UserAlreadyActivatedException);
    });
  });

  describe('changeName()', () => {
    it('deve alterar nome valido', () => {
      const user = createUser();
      user.changeName('Novo Nome');
      expect(user.name).toBe('Novo Nome');
    });

    it('deve fazer trim do nome', () => {
      const user = createUser();
      user.changeName('  Nome  ');
      expect(user.name).toBe('Nome');
    });

    it('deve rejeitar nome com menos de 2 caracteres', () => {
      const user = createUser();
      expect(() => user.changeName('A')).toThrow(InvalidUserNameException);
    });

    it('deve rejeitar nome vazio', () => {
      const user = createUser();
      expect(() => user.changeName('')).toThrow(InvalidUserNameException);
    });
  });

  describe('changePassword()', () => {
    it('deve alterar hash de senha', () => {
      const user = createUser();
      user.changePassword('newhash');
      expect(user.passwordHash).toBe('newhash');
    });

    it('deve rejeitar hash vazio', () => {
      const user = createUser();
      expect(() => user.changePassword('')).toThrow(DomainException);
    });
  });

  describe('linkSpecialistProfile()', () => {
    it('deve vincular perfil de especialista', () => {
      const user = createUser({ userType: UserType.SPECIALIST });
      user.linkSpecialistProfile('specialist-1');
      expect(user.specialistId).toBe('specialist-1');
    });

    it('deve rejeitar vinculo para usuario COMPANY', () => {
      const user = createUser({ userType: UserType.COMPANY });
      expect(() => user.linkSpecialistProfile('specialist-1')).toThrow(DomainException);
    });
  });

  describe('linkCompanyProfile()', () => {
    it('deve vincular perfil de empresa', () => {
      const user = createUser({ userType: UserType.COMPANY });
      user.linkCompanyProfile('company-1');
      expect(user.companyId).toBe('company-1');
    });

    it('deve rejeitar vinculo para usuario SPECIALIST', () => {
      const user = createUser({ userType: UserType.SPECIALIST });
      expect(() => user.linkCompanyProfile('company-1')).toThrow(DomainException);
    });
  });

  describe('type checks', () => {
    it('isSpecialist retorna true para SPECIALIST', () => {
      const user = createUser({ userType: UserType.SPECIALIST });
      expect(user.isSpecialist()).toBe(true);
      expect(user.isCompany()).toBe(false);
    });

    it('isCompany retorna true para COMPANY', () => {
      const user = createUser({ userType: UserType.COMPANY });
      expect(user.isCompany()).toBe(true);
      expect(user.isSpecialist()).toBe(false);
    });
  });
});
