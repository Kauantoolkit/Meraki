import { Delivery, DeliveryStatus } from '../../../src/domain/entities/delivery.entity';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';
import { InvalidDeliveryTransitionError } from '../../../src/domain/exceptions/invalid-delivery-transition.error';

function createDelivery(overrides: Partial<Delivery> = {}): Delivery {
  const d = new Delivery();
  d.id = 'delivery-1';
  d.milestoneId = 'milestone-1';
  d.projectId = 'project-1';
  d.specialistId = 'specialist-1';
  d.status = DeliveryStatus.PENDING;
  Object.assign(d, overrides);
  return d;
}

describe('Delivery Entity', () => {
  describe('submit()', () => {
    it('deve submeter entrega PENDING com arquivos', () => {
      const d = createDelivery();
      d.submit(['arquivo1.zip'], 'Notas de entrega');

      expect(d.status).toBe(DeliveryStatus.SUBMITTED);
      expect(d.deliveredFiles).toEqual(['arquivo1.zip']);
      expect(d.deliveryNotes).toBe('Notas de entrega');
      expect(d.submittedAt).toBeInstanceOf(Date);
    });

    it('deve permitir resubmissao de entrega REJECTED', () => {
      const d = createDelivery({ status: DeliveryStatus.REJECTED });
      d.submit(['arquivo2.zip']);

      expect(d.status).toBe(DeliveryStatus.SUBMITTED);
      expect(d.rejectionReason).toBeNull();
    });

    it('deve impedir submissao de entrega SUBMITTED', () => {
      const d = createDelivery({ status: DeliveryStatus.SUBMITTED });
      expect(() => d.submit(['arquivo.zip'])).toThrow(InvalidDeliveryTransitionError);
    });

    it('deve impedir submissao de entrega APPROVED', () => {
      const d = createDelivery({ status: DeliveryStatus.APPROVED });
      expect(() => d.submit(['arquivo.zip'])).toThrow(InvalidDeliveryTransitionError);
    });

    it('deve exigir ao menos um arquivo', () => {
      const d = createDelivery();
      expect(() => d.submit([])).toThrow(DomainException);
    });

    it('deve rejeitar lista de arquivos nula', () => {
      const d = createDelivery();
      expect(() => d.submit(null as any)).toThrow(DomainException);
    });
  });

  describe('approve() — RN05', () => {
    it('deve aprovar entrega SUBMITTED', () => {
      const d = createDelivery({ status: DeliveryStatus.SUBMITTED });
      d.approve();

      expect(d.status).toBe(DeliveryStatus.APPROVED);
      expect(d.reviewedAt).toBeInstanceOf(Date);
    });

    it('deve impedir aprovacao de entrega que nao e SUBMITTED', () => {
      const d = createDelivery({ status: DeliveryStatus.PENDING });
      expect(() => d.approve()).toThrow(InvalidDeliveryTransitionError);
    });
  });

  describe('reject()', () => {
    it('deve rejeitar entrega SUBMITTED com motivo', () => {
      const d = createDelivery({ status: DeliveryStatus.SUBMITTED });
      d.reject('Codigo incompleto');

      expect(d.status).toBe(DeliveryStatus.REJECTED);
      expect(d.rejectionReason).toBe('Codigo incompleto');
      expect(d.reviewedAt).toBeInstanceOf(Date);
    });

    it('deve exigir motivo para rejeicao', () => {
      const d = createDelivery({ status: DeliveryStatus.SUBMITTED });
      expect(() => d.reject('')).toThrow(DomainException);
    });

    it('deve exigir motivo nao-vazio para rejeicao', () => {
      const d = createDelivery({ status: DeliveryStatus.SUBMITTED });
      expect(() => d.reject('   ')).toThrow(DomainException);
    });

    it('deve impedir rejeicao de entrega que nao e SUBMITTED', () => {
      const d = createDelivery({ status: DeliveryStatus.APPROVED });
      expect(() => d.reject('Motivo')).toThrow(InvalidDeliveryTransitionError);
    });
  });

  describe('helper methods', () => {
    it('isCompleted() retorna true para APPROVED', () => {
      const d = createDelivery({ status: DeliveryStatus.APPROVED });
      expect(d.isCompleted()).toBe(true);
    });

    it('isCompleted() retorna false para outros status', () => {
      const d = createDelivery({ status: DeliveryStatus.SUBMITTED });
      expect(d.isCompleted()).toBe(false);
    });

    it('canResubmit() retorna true para REJECTED', () => {
      const d = createDelivery({ status: DeliveryStatus.REJECTED });
      expect(d.canResubmit()).toBe(true);
    });

    it('canResubmit() retorna false para PENDING', () => {
      const d = createDelivery({ status: DeliveryStatus.PENDING });
      expect(d.canResubmit()).toBe(false);
    });
  });
});
