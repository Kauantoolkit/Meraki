import { EntitySchema } from 'typeorm';
import { SkillQuestion } from '../../../domain/entities/skill-question.entity';

export const SkillQuestionSchema = new EntitySchema<SkillQuestion>({
  name: 'SkillQuestion',
  target: SkillQuestion,
  tableName: 'skill_questions',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    skillId: {
      type: 'varchar',
    },
    text: {
      type: 'text',
    },
    options: {
      type: 'simple-json',
    },
    correctIndex: {
      type: 'int',
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
