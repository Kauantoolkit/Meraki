import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { CreatePaymentHiringUseCase } from '../../application/use-cases/create-payment-hiring.use-case';
import { ConfirmPaymentHiringUseCase } from '../../application/use-cases/confirm-payment-hiring.use-case';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

/**
 * Eventos esperados do Delivery Service
 */
export interface DeliveryCompletedEvent {
  eventType: 'delivery.completed' | 'delivery.cancelled';
  deliveryId: string;
  specialistId: string;
  companyId: string;
  projectId: string;
  amount: number;
  paymentId?: string;
  timestamp: Date;
}

export interface DeliveryPaymentRequestEvent {
  eventType: 'delivery.payment.request';
  deliveryId: string;
  specialistId: string;
  companyId: string;
  projectId: string;
  amount: number;
  description?: string;
  timestamp: Date;
}

/**
 * Tipos de eventos suportados
 */
export type PaymentServiceEvent = DeliveryCompletedEvent | DeliveryPaymentRequestEvent;

@Injectable()
export class DeliveryEventConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DeliveryEventConsumer.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  // Filas e exchanges
  private readonly EXCHANGE_NAME = 'meraki.delivery';
  private readonly QUEUE_NAME = 'payment-service.delivery-events';
  private readonly ROUTING_KEY = 'delivery.#';

  constructor(
    private readonly configService: ConfigService,
    private readonly createPaymentHiringUseCase: CreatePaymentHiringUseCase,
    private readonly confirmPaymentHiringUseCase: ConfirmPaymentHiringUseCase,
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  // Método público para verificação de saúde
  isHealthy(): boolean {
    return this.isConnected();
  }

  async onModuleInit() {
    await this.connect();
    await this.setupConsumer();
    this.logger.log('Delivery Event Consumer initialized');
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Conectar ao RabbitMQ
   */
  private async connect(): Promise<void> {
    try {
      const rabbitmqUri = this.configService.get<string>('RABBITMQ_URI') || 'amqp://guest:guest@localhost:5672';

      this.connection = await amqp.connect(rabbitmqUri);
      this.channel = await this.connection.createChannel();

      // Declarar exchange
      await this.channel.assertExchange(this.EXCHANGE_NAME, 'topic', {
        durable: true,
      });

      // Declarar fila
      await this.channel.assertQueue(this.QUEUE_NAME, {
        durable: true,
      });

      // Bind da fila ao exchange
      await this.channel.bindQueue(this.QUEUE_NAME, this.EXCHANGE_NAME, this.ROUTING_KEY);

      this.logger.log(`Connected to RabbitMQ: ${rabbitmqUri}`);
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      // Não throw - permite funcionar sem RabbitMQ em dev
    }
  }

  /**
   * Configurar consumer para receber eventos
   */
  private async setupConsumer(): Promise<void> {
    if (!this.channel) {
      this.logger.warn('Channel not available, skipping consumer setup');
      return;
    }

    // Prefetch de 1 mensagem por vez
    await this.channel.prefetch(1);

    // Consumir mensagens
    await this.channel.consume(this.QUEUE_NAME, async (msg) => {
      if (!msg) return;

      try {
        const event: PaymentServiceEvent = JSON.parse(msg.content.toString());
        await this.handleEvent(event);
        this.channel?.ack(msg);
      } catch (error) {
        this.logger.error('Error processing message', error);
        // Reject e requeue para retry
        this.channel?.nack(msg, false, true);
      }
    });

    this.logger.log(`Consumer listening on queue: ${this.QUEUE_NAME}`);
  }

  /**
   * Processar eventos recebidos
   */
  private async handleEvent(event: PaymentServiceEvent): Promise<void> {
    this.logger.log(`Processing event: ${event.eventType}`);

    switch (event.eventType) {
      case 'delivery.completed':
        await this.handleDeliveryCompleted(event as DeliveryCompletedEvent);
        break;
      case 'delivery.cancelled':
        await this.handleDeliveryCancelled(event as DeliveryCompletedEvent);
        break;
      case 'delivery.payment.request':
        await this.handlePaymentRequest(event as DeliveryPaymentRequestEvent);
        break;
      default:
        this.logger.warn(`Unknown event type: ${(event as any).eventType}`);
    }
  }

  /**
   * Handler: Delivery concluído - processar pagamento automático
   */
  private async handleDeliveryCompleted(event: DeliveryCompletedEvent): Promise<void> {
    this.logger.log(
      `Delivery completed: ${event.deliveryId} | Specialist: ${event.specialistId} | Amount: R$ ${event.amount}`,
    );

    try {
      // Criar pagamento automaticamente
      const payment = await this.createPaymentHiringUseCase.execute({
        specialistId: event.specialistId,
        companyId: event.companyId,
        projectId: event.projectId,
        amount: event.amount,
        description: `Payment for delivery ${event.deliveryId}`,
      });

      // Confirmar pagamento automaticamente
      await this.confirmPaymentHiringUseCase.execute(payment.id);

      this.logger.log(
        `Payment automatically created and confirmed for delivery ${event.deliveryId} | Payment ID: ${payment.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process payment for delivery ${event.deliveryId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handler: Delivery cancelado - reverter pagamento se necessário
   */
  private async handleDeliveryCancelled(event: DeliveryCompletedEvent): Promise<void> {
    this.logger.log(
      `Delivery cancelled: ${event.deliveryId} | Specialist: ${event.specialistId}`,
    );

    if (event.paymentId) {
      try {
        // Reverter pagamento associado
        await this.paymentRepository.update(event.paymentId, {
          status: PaymentStatus.CANCELLED,
        });
        this.logger.log(
          `Payment ${event.paymentId} cancelled due to delivery cancellation ${event.deliveryId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to cancel payment ${event.paymentId} for delivery ${event.deliveryId}`,
          error,
        );
      }
    }
  }

  /**
   * Handler: Requisição de pagamento do delivery
   */
  private async handlePaymentRequest(event: DeliveryPaymentRequestEvent): Promise<void> {
    this.logger.log(
      `Payment request from delivery: ${event.deliveryId} | Amount: R$ ${event.amount}`,
    );

    try {
      // Criar registro de pagamento pendente
      const payment = await this.createPaymentHiringUseCase.execute({
        specialistId: event.specialistId,
        companyId: event.companyId,
        projectId: event.projectId,
        amount: event.amount,
        description: event.description || `Payment for delivery ${event.deliveryId}`,
      });

      this.logger.log(
        `Payment created for delivery ${event.deliveryId} | Payment ID: ${payment.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create payment for delivery ${event.deliveryId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Desconectar do RabbitMQ
   */
  private async disconnect(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ', error);
    }
  }

  /**
   * Verificar status da conexão
   */
  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}