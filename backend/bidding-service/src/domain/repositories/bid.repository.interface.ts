import { Bid } from '../entities/bid.entity';

export interface IBidRepository {
  findById(id: string): Promise<Bid | null>;
  findByProject(projectId: string): Promise<Bid[]>;
  findBySpecialist(specialistId: string): Promise<Bid[]>;
  findByProjectAndSpecialist(projectId: string, specialistId: string): Promise<Bid[]>;
  findAcceptedByProject(projectId: string): Promise<Bid | null>;
  save(bid: Bid): Promise<Bid>;
  rejectAllPendingExcept(projectId: string, acceptedBidId: string): Promise<void>;
  /** Persiste o vencedor e rejeita todas as demais PENDING em uma única transação (RN03). */
  saveWinnerAtomically(winner: Bid, projectId: string): Promise<void>;
}
