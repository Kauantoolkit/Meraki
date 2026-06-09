import { EntitySchema } from 'typeorm';
import { Skill } from '../../../domain/entities/skill.entity';

export const SkillSchema = new EntitySchema<Skill>({
  name: 'Skill',
  target: Skill,
  tableName: 'skills',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    name: {
      type: 'varchar',
      unique: true,
    },
    displayName: {
      type: 'varchar',
    },
    createdByCompanyId: {
      type: 'varchar',
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
  },
});
