import { EntitySchema } from 'typeorm';
import { Certification } from '../../../domain/entities/certification.entity';

export const CertificationSchema = new EntitySchema<Certification>({
  name: 'Certification',
  target: Certification,
  tableName: 'certifications',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    specialistId: { type: 'varchar' },
    name: { type: 'varchar' },
    issuer: { type: 'varchar' },
    issueDate: { type: 'timestamp', nullable: true },
    expiryDate: { type: 'timestamp', nullable: true },
    credentialId: { type: 'varchar', nullable: true },
    credentialUrl: { type: 'varchar', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
  },
});
