import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../src/domain/entities/payment.entity';
import { Withdrawal } from '../src/domain/entities/withdrawal.entity';
import { SpecialistBalance } from '../src/domain/entities/specialist-balance.entity';
import { PaymentRepository } from '../src/infrastructure/repositories/payment.repository';
import { WithdrawalRepository } from '../src/infrastructure/repositories/withdrawal.repository';
import { SpecialistBalanceRepository } from '../src/infrastructure/repositories/specialist-balance.repository';
import { CreatePaymentHiringUseCase } from '../src/application/use-cases/create-payment-hiring.use-case';
import { ConfirmPaymentHiringUseCase } from '../src/application/use-cases/confirm-payment-hiring.use-case';
import { RequestWithdrawalUseCase } from '../src/application/use-cases/request-withdrawal.use-case';
import { ApproveWithdrawalUseCase } from '../src/application/use-cases/approve-withdrawal.use-case';
import { ProcessWithdrawalUseCase } from '../src/application/use-cases/process-withdrawal.use-case';
import { GetSpecialistBalanceUseCase } from '../src/application/use-cases/get-specialist-balance.use-case';
import { PaymentStatus } from '../src/domain/enums/payment-status.enum';
import { WithdrawalStatus } from '../src/domain/enums/withdrawal-status.enum';
import { PaymentType } from '../src/domain/enums/payment-type.enum';
import { PaymentMethod } from '../src/domain/enums/payment-method.enum';
import { v4 as uuidv4 } from 'uuid';

describe('Payment System - Integrated Tests', () => {
  let module: TestingModule;
  let paymentRepository: PaymentRepository;
  let withdrawalRepository: WithdrawalRepository;
  let balanceRepository: SpecialistBalanceRepository;
  let createPaymentHiringUseCase: CreatePaymentHiringUseCase;
  let confirmPaymentHiringUseCase: ConfirmPaymentHiringUseCase;
  let requestWithdrawalUseCase: RequestWithdrawalUseCase;
  let approveWithdrawalUseCase: ApproveWithdrawalUseCase;
  let processWithdrawalUseCase: ProcessWithdrawalUseCase;
  let getSpecialistBalanceUseCase: GetSpecialistBalanceUseCase;

  const specialistId = uuidv4();
  const companyId = uuidv4();
  const projectId = uuidv4();
  const paymentAmount = 500;

  beforeAll(async () => {
    const mockPaymentRepository = {
      findById: jest.fn(),
      findByProjectId: jest.fn(),
      findBySpecialistId: jest.fn(),
      findByCompanyId: jest.fn(),
      findByStatus: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockWithdrawalRepository = {
      findById: jest.fn(),
      findBySpecialistId: jest.fn(),
      findByStatus: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockBalanceRepository = {
      findBySpecialistId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        { provide: PaymentRepository, useValue: mockPaymentRepository },
        { provide: WithdrawalRepository, useValue: mockWithdrawalRepository },
        { provide: SpecialistBalanceRepository, useValue: mockBalanceRepository },
        {
          provide: CreatePaymentHiringUseCase,
          useFactory: () =>
            new CreatePaymentHiringUseCase(mockPaymentRepository, mockBalanceRepository),
        },
        {
          provide: ConfirmPaymentHiringUseCase,
          useFactory: () =>
            new ConfirmPaymentHiringUseCase(mockPaymentRepository, mockBalanceRepository),
        },
        {
          provide: RequestWithdrawalUseCase,
          useFactory: () =>
            new RequestWithdrawalUseCase(mockWithdrawalRepository, mockBalanceRepository),
        },
        {
          provide: ApproveWithdrawalUseCase,
          useFactory: () =>
            new ApproveWithdrawalUseCase(mockWithdrawalRepository, mockBalanceRepository),
        },
        {
          provide: ProcessWithdrawalUseCase,
          useFactory: () =>
            new ProcessWithdrawalUseCase(mockWithdrawalRepository, mockBalanceRepository),
        },
        {
          provide: GetSpecialistBalanceUseCase,
          useFactory: () => new GetSpecialistBalanceUseCase(mockBalanceRepository),
        },
      ],
    }).compile();

    paymentRepository = module.get<PaymentRepository>(PaymentRepository);
    withdrawalRepository = module.get<WithdrawalRepository>(WithdrawalRepository);
    balanceRepository = module.get<SpecialistBalanceRepository>(SpecialistBalanceRepository);
    createPaymentHiringUseCase = module.get<CreatePaymentHiringUseCase>(
      CreatePaymentHiringUseCase,
    );
    confirmPaymentHiringUseCase = module.get<ConfirmPaymentHiringUseCase>(
      ConfirmPaymentHiringUseCase,
    );
    requestWithdrawalUseCase = module.get<RequestWithdrawalUseCase>(RequestWithdrawalUseCase);
    approveWithdrawalUseCase = module.get<ApproveWithdrawalUseCase>(ApproveWithdrawalUseCase);
    processWithdrawalUseCase = module.get<ProcessWithdrawalUseCase>(ProcessWithdrawalUseCase);
    getSpecialistBalanceUseCase = module.get<GetSpecialistBalanceUseCase>(
      GetSpecialistBalanceUseCase,
    );
  });

  describe('Scenario: Complete Payment & Withdrawal Flow', () => {
    let paymentId: string;
    let withdrawalId: string;

    it('1️⃣  Should create a payment (company hires specialist)', async () => {
      const paymentId = uuidv4();

      const mockPayment = {
        id: paymentId,
        specialistId,
        companyId,
        projectId,
        amount: paymentAmount,
        type: PaymentType.HIRING,
        status: PaymentStatus.PENDING,
        pixQrCode: `00020126360014br.gov.bcb.pix0136${paymentId}-${Date.now()}-${Math.floor(
          paymentAmount * 100,
        )}`,
        transactionId: undefined,
        description: 'Payment for specializing in React',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: undefined,
      };

      jest.spyOn(paymentRepository, 'create').mockResolvedValue(mockPayment);
      jest.spyOn(paymentRepository, 'update').mockResolvedValue(mockPayment);

      const result = await createPaymentHiringUseCase.execute({
        specialistId,
        companyId,
        projectId,
        amount: paymentAmount,
        description: 'Payment for specializing in React',
      });

      expect(result).toBeDefined();
      expect(result.status).toBe(PaymentStatus.PENDING);
      expect(result.amount).toBe(paymentAmount);
      expect(result.type).toBe(PaymentType.HIRING);
      expect(result.pixQrCode).toBeDefined();

      console.log('✅ Payment created:', result);
    });

    it('2️⃣  Should confirm payment (PIX received)', async () => {
      const paymentId = uuidv4();

      const mockPayment = {
        id: paymentId,
        specialistId,
        companyId,
        projectId,
        amount: paymentAmount,
        type: PaymentType.HIRING,
        status: PaymentStatus.COMPLETED,
        transactionId: `TXN-${Date.now()}`,
        completedAt: new Date(),
        pixQrCode: 'qr-code',
        description: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(paymentRepository, 'findById').mockResolvedValue(mockPayment);
      jest.spyOn(paymentRepository, 'update').mockResolvedValue(mockPayment);

      const mockBalance = {
        id: uuidv4(),
        specialistId,
        totalEarned: paymentAmount,
        availableBalance: paymentAmount,
        totalWithdrawn: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(balanceRepository, 'findBySpecialistId').mockResolvedValue(null);
      jest.spyOn(balanceRepository, 'create').mockResolvedValue(mockBalance);

      const result = await confirmPaymentHiringUseCase.execute(paymentId);

      expect(result).toBeDefined();
      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(result.transactionId).toBeDefined();
      expect(result.message).toContain('Specialist balance increased');

      console.log('✅ Payment confirmed:', result);
    });

    it('3️⃣  Should request withdrawal (specialist requests money)', async () => {
      const mockBalance = {
        id: uuidv4(),
        specialistId,
        totalEarned: paymentAmount,
        availableBalance: paymentAmount,
        totalWithdrawn: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(balanceRepository, 'findBySpecialistId').mockResolvedValue(mockBalance);

      const withdrawalId = uuidv4();
      const mockWithdrawal = {
        id: withdrawalId,
        specialistId,
        amount: 300,
        paymentMethod: PaymentMethod.PIX,
        pixKey: '12345678901234567890123456789',
        bankAccount: undefined,
        status: WithdrawalStatus.PENDING,
        approvedAt: undefined,
        processedAt: undefined,
        rejectionReason: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(withdrawalRepository, 'create').mockResolvedValue(mockWithdrawal);

      const result = await requestWithdrawalUseCase.execute({
        specialistId,
        amount: 300,
        paymentMethod: PaymentMethod.PIX,
        pixKey: '12345678901234567890123456789',
      });

      expect(result).toBeDefined();
      expect(result.status).toBe(WithdrawalStatus.PENDING);
      expect(result.amount).toBe(300);
      expect(result.paymentMethod).toBe(PaymentMethod.PIX);

      console.log('✅ Withdrawal requested:', result);
    });

    it('4️⃣  Should approve withdrawal (admin/system)', async () => {
      const withdrawalId = uuidv4();
      const mockWithdrawal = {
        id: withdrawalId,
        specialistId,
        amount: 300,
        paymentMethod: PaymentMethod.PIX,
        pixKey: '12345678901234567890123456789',
        bankAccount: undefined,
        status: WithdrawalStatus.PENDING,
        approvedAt: undefined,
        processedAt: undefined,
        rejectionReason: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const approvedWithdrawal = {
        ...mockWithdrawal,
        status: WithdrawalStatus.APPROVED,
        approvedAt: new Date(),
      };

      jest.spyOn(withdrawalRepository, 'findById').mockResolvedValue(mockWithdrawal);
      jest.spyOn(withdrawalRepository, 'update').mockResolvedValue(approvedWithdrawal);

      const result = await approveWithdrawalUseCase.execute(withdrawalId);

      expect(result).toBeDefined();
      expect(result.status).toBe(WithdrawalStatus.APPROVED);
      expect(result.approvedAt).toBeDefined();

      console.log('✅ Withdrawal approved:', result);
    });

    it('5️⃣  Should process withdrawal (send money via PIX)', async () => {
      const withdrawalId = uuidv4();
      const mockWithdrawal = {
        id: withdrawalId,
        specialistId,
        amount: 300,
        paymentMethod: PaymentMethod.PIX,
        pixKey: '12345678901234567890123456789',
        bankAccount: undefined,
        status: WithdrawalStatus.APPROVED,
        approvedAt: new Date(),
        processedAt: undefined,
        rejectionReason: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(withdrawalRepository, 'findById').mockResolvedValue(mockWithdrawal);
      jest.spyOn(withdrawalRepository, 'update').mockResolvedValue({
        ...mockWithdrawal,
        status: WithdrawalStatus.PROCESSING,
      });

      const result = await processWithdrawalUseCase.execute(withdrawalId);

      expect(result).toBeDefined();
      expect(result.status).toBe(WithdrawalStatus.PROCESSING);

      console.log('✅ Withdrawal processing started:', result);
    });

    it('6️⃣  Should get specialist balance', async () => {
      const mockBalance = {
        id: uuidv4(),
        specialistId,
        totalEarned: paymentAmount,
        availableBalance: paymentAmount - 300,
        totalWithdrawn: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(balanceRepository, 'findBySpecialistId').mockResolvedValue(mockBalance);

      const result = await getSpecialistBalanceUseCase.execute(specialistId);

      expect(result).toBeDefined();
      expect(result.specialistId).toBe(specialistId);
      expect(result.totalEarned).toBe(paymentAmount);
      expect(result.availableBalance).toBe(paymentAmount - 300);

      console.log('✅ Specialist balance retrieved:', result);
    });
  });

  describe('Error Handling', () => {
    it('Should fail when amount is invalid', async () => {
      await expect(
        createPaymentHiringUseCase.execute({
          specialistId,
          companyId,
          projectId,
          amount: -100,
        }),
      ).rejects.toThrow();

      console.log('✅ Invalid amount validation works');
    });

    it('Should fail withdrawal with insufficient balance', async () => {
      const mockBalance = {
        id: uuidv4(),
        specialistId,
        totalEarned: 100,
        availableBalance: 50,
        totalWithdrawn: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(balanceRepository, 'findBySpecialistId').mockResolvedValue(mockBalance);

      await expect(
        requestWithdrawalUseCase.execute({
          specialistId,
          amount: 100,
          paymentMethod: PaymentMethod.PIX,
          pixKey: '12345678901234567890123456789',
        }),
      ).rejects.toThrow();

      console.log('✅ Insufficient balance validation works');
    });

    it('Should fail when PIX key is missing', async () => {
      const mockBalance = {
        id: uuidv4(),
        specialistId,
        totalEarned: 1000,
        availableBalance: 500,
        totalWithdrawn: 500,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(balanceRepository, 'findBySpecialistId').mockResolvedValue(mockBalance);

      await expect(
        requestWithdrawalUseCase.execute({
          specialistId,
          amount: 200,
          paymentMethod: PaymentMethod.PIX,
        }),
      ).rejects.toThrow();

      console.log('✅ PIX key validation works');
    });
  });

  afterAll(async () => {
    await module.close();
  });
});
