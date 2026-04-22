import { EntitySchema } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { UserType } from '../../../domain/enums/user-type.enum';

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  target: User,
  tableName: 'users',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    email: {
      type: 'varchar',
      unique: true,
    },
    passwordHash: {
      type: 'varchar',
    },
    name: {
      type: 'varchar',
    },
    userType: {
      type: 'enum',
      enum: UserType,
    },
    specialistId: {
      type: 'varchar',
      nullable: true,
    },
    companyId: {
      type: 'varchar',
      nullable: true,
    },
    isActive: {
      type: 'boolean',
      default: true,
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
    },
  },
});
