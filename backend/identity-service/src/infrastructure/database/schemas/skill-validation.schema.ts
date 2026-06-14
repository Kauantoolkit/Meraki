import { EntitySchema } from 'typeorm';
import { SkillValidation } from '../../../domain/entities/skill-validation.entity';

export const SkillValidationSchema = new EntitySchema<SkillValidation>({
  name: 'SkillValidation',
  target: SkillValidation,
  tableName: 'skill_validations',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    specialistId: {
      type: 'varchar',
    },
    skillId: {
      type: 'uuid',
    },
    skillName: {
      type: 'varchar',
    },
    passed: {
      type: 'boolean',
    },
    score: {
      type: 'decimal',
      precision: 5,
      scale: 2,
    },
    attemptedAt: {
      type: 'timestamp',
      createDate: true,
    },
  },
});
