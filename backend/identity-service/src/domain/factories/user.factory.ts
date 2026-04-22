import { User } from '../entities/user.entity';
import { CompanyProfile } from '../entities/company-profile.entity';
import { SpecialistProfile } from '../entities/specialist-profile.entity';
import { UserType } from '../enums/user-type.enum';
import { Email } from '../value-objects/email.value-object';
import { Password } from '../value-objects/password.value-object';
import { DomainException } from '../exceptions/domain.exception';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  userType: UserType;
  companyName?: string;
}

export interface UserCreationResult {
  user: User;
  passwordHash: string;
  companyProfile?: CompanyProfile;
  specialistProfile?: SpecialistProfile;
}

export class UserFactory {
  /**
   * Cria um User (Aggregate Root) com validação de invariantes.
   * Retorna a entidade preparada (sem persistir) e o password validado.
   * O hash do password é responsabilidade da camada de aplicação (use case).
   */
  create(data: CreateUserData): { user: User; validatedEmail: Email; validatedPassword: Password } {
    if (!data.name || data.name.trim().length < 2) {
      throw new DomainException('Nome deve ter pelo menos 2 caracteres');
    }

    // Value Objects validam email e password
    const email = new Email(data.email);
    const password = new Password(data.password);

    // Invariante: COMPANY precisa de companyName
    if (data.userType === UserType.COMPANY && !data.companyName) {
      throw new DomainException('companyName é obrigatório para contas do tipo COMPANY');
    }

    const user = new User();
    user.email = email.value;
    user.name = data.name.trim();
    user.userType = data.userType;
    user.isActive = true;

    return { user, validatedEmail: email, validatedPassword: password };
  }

  createCompanyProfile(userId: string, companyName: string): CompanyProfile {
    if (!companyName || companyName.trim().length < 2) {
      throw new DomainException('Nome da empresa deve ter pelo menos 2 caracteres');
    }

    const profile = new CompanyProfile();
    profile.userId = userId;
    profile.companyName = companyName.trim();

    return profile;
  }

  createSpecialistProfile(userId: string): SpecialistProfile {
    const profile = new SpecialistProfile();
    profile.userId = userId;
    profile.skills = [];
    profile.experience = 0;
    profile.hourlyRate = 0;
    profile.rating = 0;

    return profile;
  }
}
