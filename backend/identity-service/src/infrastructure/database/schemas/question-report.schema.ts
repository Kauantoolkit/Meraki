import { EntitySchema } from 'typeorm';
import { QuestionReport } from '../../../domain/entities/question-report.entity';

export const QuestionReportSchema = new EntitySchema<QuestionReport>({
  name: 'QuestionReport',
  target: QuestionReport,
  tableName: 'question_reports',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    questionId: {
      type: 'uuid',
    },
    userId: {
      type: 'varchar',
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
  },
  indices: [
    {
      name: 'UQ_question_report_question_user',
      unique: true,
      columns: ['questionId', 'userId'],
    },
  ],
});
