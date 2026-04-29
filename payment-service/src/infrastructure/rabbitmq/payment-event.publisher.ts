import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

export class PaymentIntegrationEvent {
  eventType!: string;
  specialistId!: string;
  companyId?: string;
  projectId?: string;
  amount!: number;
  paymentId?: string;
  withdrawalId?: string;
  status!: string;
  timestamp!: Date;
}

@Injectable()
export class PaymentEventPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentEventPublisher.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  
  // Exchanges e filas
  private readonly EXCHANGE_NAME = 'meraki.payments';
  private readonly QUEUE_NAME = 'delivery-service.payment-events';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Conectar ao RabbitMQ
   */
  private async connect(): Promise<void> {
    const rabbitmqUri = this.configService.get<string>('RABBITMQ_URI') || 'amqp://guest:guest@localhost:5672';

    try {
      const connection = await amqp.connect(rabbitmqUri);
      const channel = await connection.createChannel();

      // Declarar exchange
      await channel.assertExchange(this.EXCHANGE_NAME, 'topic', {
        durable: true,
      });

      // Configurar event handlers para reconexão
      connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed, attempting reconnection...');
        this.connection = null;
        this.channel = null;
        setTimeout(() => this.connect(), 5000);
      });

      connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error', err);
      });

      this.connection = connection;
      this.channel = channel;

      this.logger.log(`Publisher connected to RabbitMQ: ${rabbitmqUri}`);
    } catch (error) {
      this.logger.error(
        `Failed to connect publisher to RabbitMQ at ${rabbitmqUri}. Events will be logged only.`,
        error,
      );
      // Tentar reconectar após 5 segundos
      setTimeout(() => this.connect(), 5000);
    }
  }

  /**
   * Publicar evento para o RabbitMQ
   */
  private async publish(routingKey: string, event: PaymentIntegrationEvent): Promise<void> {
    if (!this.channel) {
      this.logger.warn('Channel not available, event logged only');
      this.logger.log(`[Mock] ${routingKey}: ${JSON.stringify(event)}`);
      return;
    }

    try {
      const message = Buffer.from(JSON.stringify(event));
      this.channel.publish(this.EXCHANGE_NAME, routingKey, message, {
        persistent: true,
        contentType: 'application/json',
      });
      this.logger.log(`Published event: ${routingKey}`);
    } catch (error) {
      this.logger.error(`Failed to publish event: ${routingKey}`, error);
    }
  }

  /**
   * Publicar evento quando pagamento é confirmado
   */
  async publishPaymentConfirmed(
    paymentId: string,
    specialistId: string,
    amount: number,
    companyId?: string,
    projectId?: string,
  ): Promise<void> {
    const event: PaymentIntegrationEvent = {
      eventType: 'payment.confirmed',
      specialistId,
      companyId,
      projectId,
      paymentId,
      amount,
      status: 'COMPLETED',
      timestamp: new Date(),
    };

    await this.publish('payment.confirmed', event);
    this.logger.log(`Payment confirmed: ${paymentId} | R$ ${amount}`);
  }

  /**
   * Publicar evento quando saque é completado
   */
  async publishWithdrawalCompleted(
    withdrawalId: string,
    specialistId: string,
    amount: number,
  ): Promise<void> {
    const event: PaymentIntegrationEvent = {
      eventType: 'withdrawal.completed',
      specialistId,
      withdrawalId,
      amount,
      status: 'COMPLETED',
      timestamp: new Date(),
    };

    await this.publish('withdrawal.completed', event);
    this.logger.log(`Withdrawal completed: ${withdrawalId} | R$ ${amount}`);
  }

  /**
   * Publicar evento quando saque é rejeitado
   */
  async publishWithdrawalRejected(
    withdrawalId: string,
    specialistId: string,
    reason: string,
  ): Promise<void> {
    const event: PaymentIntegrationEvent = {
      eventType: 'withdrawal.rejected',
      specialistId,
      withdrawalId,
      amount: 0,
      status: 'REJECTED',
      timestamp: new Date(),
    };

    await this.publish('withdrawal.rejected', event);
    this.logger.log(`Withdrawal rejected: ${withdrawalId} | Reason: ${reason}`);
  }

  /**
   * Publicar evento de novo pagamento criado
   */
  async publishPaymentCreated(
    paymentId: string,
    specialistId: string,
    amount: number,
    companyId?: string,
    projectId?: string,
  ): Promise<void> {
    const event: PaymentIntegrationEvent = {
      eventType: 'payment.created',
      specialistId,
      companyId,
      projectId,
      paymentId,
      amount,
      status: 'PENDING',
      timestamp: new Date(),
    };

    await this.publish('payment.created', event);
    this.logger.log(`Payment created: ${paymentId} | R$ ${amount}`);
  }

  /**
   * Desconectar do RabbitMQ
   */
  private async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      this.logger.log('Publisher disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error disconnecting publisher', error);
    }
  }

  /**
   * Verificar status da conexão
   */
  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}
