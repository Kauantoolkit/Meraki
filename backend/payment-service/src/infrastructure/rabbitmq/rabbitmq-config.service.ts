import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQConfigService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQConfigService.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly pendingSubscriptions: Array<{ queue: string; routingKey: string; callback: (msg: any) => void }> = [];

  async onModuleInit() { await this.connectWithRetry(); }
  async onModuleDestroy() { await this.close(); }

  private async connectWithRetry(attempt = 1, maxAttempts = 10) {
    const url = process.env.RABBITMQ_URL || 'amqp://meraki:meraki@localhost:5672';
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange('meraki.events', 'topic', { durable: true });
      this.logger.log('RabbitMQ conectado');

      this.connection.on('error', () => this.scheduleReconnect());
      this.connection.on('close', () => this.scheduleReconnect());

      // reprocessa subscriptions pendentes (caso reconectou)
      for (const s of this.pendingSubscriptions) {
        await this.doSubscribe(s.queue, s.routingKey, s.callback);
      }
    } catch (error) {
      const delay = Math.min(2000 * attempt, 15000);
      this.logger.warn(`RabbitMQ indisponível (tentativa ${attempt}/${maxAttempts}): ${error.message}. Retry em ${delay}ms`);
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, delay));
        await this.connectWithRetry(attempt + 1, maxAttempts);
      } else {
        this.logger.error('RabbitMQ: número máximo de tentativas atingido. Serviço continuará sem eventos.');
      }
    }
  }

  private scheduleReconnect() {
    this.connection = null;
    this.channel = null;
    this.logger.warn('Conexão com RabbitMQ perdida. Reconectando...');
    setTimeout(() => this.connectWithRetry(), 3000);
  }

  async publishEvent(routingKey: string, payload: Record<string, any>) {
    if (!this.channel) { this.logger.warn(`Evento ignorado (sem conexão): ${routingKey}`); return; }
    this.channel.publish(
      'meraki.events',
      routingKey,
      Buffer.from(JSON.stringify({ eventType: routingKey, timestamp: new Date().toISOString(), payload })),
      { persistent: true },
    );
    this.logger.log(`Evento publicado: ${routingKey}`);
  }

  async subscribe(queue: string, routingKey: string, callback: (msg: any) => void) {
    this.pendingSubscriptions.push({ queue, routingKey, callback });
    if (!this.channel) {
      this.logger.warn(`Subscribe registrado para quando RabbitMQ conectar: ${queue}`);
      return;
    }
    await this.doSubscribe(queue, routingKey, callback);
  }

  private async doSubscribe(queue: string, routingKey: string, callback: (msg: any) => void) {
    if (!this.channel) return;
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, 'meraki.events', routingKey);
    this.channel.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        await callback(JSON.parse(msg.content.toString()));
        this.channel!.ack(msg);
      } catch (err) {
        this.logger.error(`Erro ao processar mensagem de ${routingKey}: ${err.message}. Descartando.`);
        this.channel!.nack(msg, false, false); // não requeue — evita loop infinito
      }
    });
    this.logger.log(`Subscrito: ${queue} (${routingKey})`);
  }

  private async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch { /* ignora */ }
  }
}
