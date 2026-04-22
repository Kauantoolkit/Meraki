import { Bid } from '../entities/bid.entity';
import { BidStatus } from '../enums/bid-status.enum';

export interface IBidRepository {
  findById(id: string): Promise<Bid | null>;
  findByProject(projectId: string): Promise<Bid[]>;
  findBySpecialist(specialistId: string): Promise<Bid[]>;
  findByProjectAndSpecialist(projectId: string, specialistId: string): Promise<Bid[]>;
  findAcceptedByProject(projectId: string): Promise<Bid | null>;
  save(bid: Bid): Promise<Bid>;
  rejectAllPendingExcept(projectId: string, acceptedBidId: string): Promise<void>;
}
