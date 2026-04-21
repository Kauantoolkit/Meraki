import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../enums/user-type.enum';
import {
  DomainException,
  UserAlreadyDeactivatedException,
  UserAlreadyActivatedException,
  InvalidUserNameException,
} from '../exceptions/domain.exception';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserType })
  userType: UserType;

  @Column({ nullable: true })
  specialistId: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── Domain behavior ───────────────────────────────────────────────────────

  deactivate(): void {
    if (!this.isActive) {
      throw new UserAlreadyDeactivatedException();
    }
    this.isActive = false;
  }

  activate(): void {
    if (this.isActive) {
      throw new UserAlreadyActivatedException();
    }
    this.isActive = true;
  }

  changeName(newName: string): void {
    if (!newName || newName.trim().length < 2) {
      throw new InvalidUserNameException('deve ter pelo menos 2 caracteres');
    }
    this.name = newName.trim();
  }

  changePassword(newPasswordHash: string): void {
    if (!newPasswordHash) {
      throw new DomainException('Hash de senha não pode ser vazio');
    }
    this.passwordHash = newPasswordHash;
  }

  linkSpecialistProfile(specialistId: string): void {
    if (this.userType !== UserType.SPECIALIST) {
      throw new DomainException('Apenas usuários SPECIALIST podem ter perfil de especialista');
    }
    this.specialistId = specialistId;
  }

  linkCompanyProfile(companyId: string): void {
    if (this.userType !== UserType.COMPANY) {
      throw new DomainException('Apenas usuários COMPANY podem ter perfil de empresa');
    }
    this.companyId = companyId;
  }

  isSpecialist(): boolean {
    return this.userType === UserType.SPECIALIST;
  }

  isCompany(): boolean {
    return this.userType === UserType.COMPANY;
  }
}
