import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Bid } from '../../domain/entities/bid.entity';
import { IBidRepository } from '../../domain/repositories/bid.repository.interface';
import { BidStatus } from '../../domain/enums/bid-status.enum';
import { BidAlreadyAcceptedError } from '../../domain/exceptions/bid-already-accepted.error';

@Injectable()
export class BidRepository implements IBidRepository {
  constructor(
    @InjectRepository(Bid)
    private readonly repo: Repository<Bid>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  findById(id: string): Promise<Bid | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByProject(projectId: string): Promise<Bid[]> {
    return this.repo.find({ where: { projectId }, order: { createdAt: 'DESC' } });
  }

  findBySpecialist(specialistId: string): Promise<Bid[]> {
    return this.repo.find({ where: { specialistId }, order: { createdAt: 'DESC' } });
  }

  findByProjectAndSpecialist(projectId: string, specialistId: string): Promise<Bid[]> {
    return this.repo.find({ where: { projectId, specialistId } });
  }

  findAcceptedByProject(projectId: string): Promise<Bid | null> {
    return this.repo.findOne({ where: { projectId, status: BidStatus.ACCEPTED } });
  }

  save(bid: Bid): Promise<Bid> {
    return this.repo.save(bid);
  }

  /** Rejeita todas as propostas PENDING do projeto, exceto a aceita — RN03 */
  async rejectAllPendingExcept(projectId: string, acceptedBidId: string): Promise<void> {
    await this.repo.update(
      { projectId, status: BidStatus.PENDING, id: Not(acceptedBidId) },
      { status: BidStatus.REJECTED },
    );
  }

  /**
   * Aceita a proposta vencedora e rejeita todas as demais PENDING em uma única transação.
   * Usa lock pessimista na linha do vencedor para evitar race condition:
   * duas requisições simultâneas não conseguem aceitar bids diferentes no mesmo projeto.
   */
  async saveWinnerAtomically(winner: Bid, projectId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const bidRepo = manager.getRepository(Bid);

      // Lock pessimista: bloqueia a linha até o fim da transação
      await bidRepo.findOne({
        where: { id: winner.id },
        lock: { mode: 'pessimistic_write' },
      });

      // Double-check dentro da transação: nenhuma aceitação concorrente passou pelo lock
      const alreadyAccepted = await bidRepo.findOne({
        where: { projectId, status: BidStatus.ACCEPTED },
      });
      if (alreadyAccepted) {
        throw new BidAlreadyAcceptedError();
      }

      await bidRepo.save(winner);

      await bidRepo.update(
        { projectId, status: BidStatus.PENDING, id: Not(winner.id) },
        { status: BidStatus.REJECTED },
      );
    });
  }
}
