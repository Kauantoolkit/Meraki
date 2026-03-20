import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQConfigService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQConfigService.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.close();
  }

  private async connect() {
    const url = process.env.RABBITMQ_URL || 'amqp://meraki:meraki@localhost:5672';

    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Declara o exchange principal (topic para roteamento por padrão)
      await this.channel.assertExchange('meraki.events', 'topic', { durable: true });

      this.logger.log('RabbitMQ conectado com sucesso');
    } catch (error) {
      // Falha graceful — serviço sobe sem RabbitMQ para testes standalone
      this.logger.warn(`RabbitMQ indisponível: ${error.message}. Eventos não serão publicados.`);
    }
  }

  async publishEvent(routingKey: string, payload: Record<string, any>) {
    if (!this.channel) {
      this.logger.warn(`Evento ignorado (RabbitMQ offline): ${routingKey}`);
      return;
    }

    const message = {
      eventId: payload['eventId'],
      eventType: routingKey,
      timestamp: new Date().toISOString(),
      payload,
    };

    this.channel.publish(
      'meraki.events',
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );

    this.logger.log(`Evento publicado: ${routingKey}`);
  }

  async subscribe(
    queue: string,
    routingKey: string,
    callback: (message: any) => void,
  ) {
    if (!this.channel) {
      this.logger.warn(`Subscribe ignorado (RabbitMQ offline): ${queue}`);
      return;
    }

    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, 'meraki.events', routingKey);

    this.channel.consume(queue, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        callback(content);
        this.channel.ack(msg);
      }
    });

    this.logger.log(`Subscrito na fila: ${queue} (routing: ${routingKey})`);
  }

  private async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch {
      // Ignora erros ao fechar (ex: já desconectado)
    }
  }
}
