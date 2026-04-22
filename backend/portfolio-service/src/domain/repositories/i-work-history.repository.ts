import { WorkHistory } from '../entities/work-history.entity';

export interface IWorkHistoryRepository {
  save(history: Partial<WorkHistory>): Promise<WorkHistory>;
  findBySpecialist(specialistId: string): Promise<WorkHistory[]>;
}
