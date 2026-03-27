import { Injectable, Logger } from '@nestjs/common';

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
export class PaymentEventPublisher {
  private readonly logger = new Logger(PaymentEventPublisher.name);

  /**
   * Publicar evento quando pagamento é confirmado
   * Para usar com RabbitMQ, instale: npm install @nestjs/rabbitmq amqplib
   * Então importe AmqpConnection do @nestjs/rabbitmq
   */
  async publishPaymentConfirmed(
    paymentId: string,
    specialistId: string,
    amount: number,
  ): Promise<void> {
    const event: PaymentIntegrationEvent = {
      eventType: 'payment.confirmed',
      specialistId,
      paymentId,
      amount,
      status: 'COMPLETED',
      timestamp: new Date(),
    };

    this.logger.log(
      `[Event] Payment confirmed: ${JSON.stringify(event)}`,
    );
    // Em produção, publicar para RabbitMQ
    // await this.amqpConnection.publish(...)
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

    this.logger.log(
      `[Event] Withdrawal completed: ${JSON.stringify(event)}`,
    );
    // Em produção, publicar para RabbitMQ
    // await this.amqpConnection.publish(...)
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

    this.logger.log(
      `[Event] Withdrawal rejected: ${JSON.stringify(event)} | Reason: ${reason}`,
    );
    // Em produção, publicar para RabbitMQ
    // await this.amqpConnection.publish(...)
  }
}
