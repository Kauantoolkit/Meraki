import { Contract } from '../../../src/domain/entities/contract.entity';
import { ContractStatus } from '../../../src/domain/enums/contract-status.enum';

describe('Contract Entity', () => {
  it('deve finalizar contrato DRAFT', () => {
    const contract = new Contract();
    contract.status = ContractStatus.DRAFT;
    contract.finalizedAt = undefined as any;

    contract.finalize();

    expect(contract.status).toBe(ContractStatus.FINALIZED);
    expect(contract.finalizedAt).toBeInstanceOf(Date);
  });

  it('nao deve alterar contrato ja finalizado', () => {
    const contract = new Contract();
    contract.status = ContractStatus.FINALIZED;
    contract.finalizedAt = new Date('2026-01-01');

    contract.finalize();

    expect(contract.status).toBe(ContractStatus.FINALIZED);
    expect(contract.finalizedAt).toEqual(new Date('2026-01-01'));
  });
});
