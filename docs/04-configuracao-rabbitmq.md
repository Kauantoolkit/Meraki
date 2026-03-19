# MERAKI - Eventos de Domínio e Integração (DDD)

## 1. Visão Geral: Domain Events vs Integration Events

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TIPOS DE EVENTOS (DDD)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    DOMAIN EVENTS                                      │   │
│  │  Eventos que ocorrem DENTRO de um Bounded Context                   │   │
│  │  Usados para manter consistência e reação interna                   │   │
│  │  Ex: UserRegistered, BidAccepted, PaymentReleased                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼ (são publicados como)                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                 INTEGRATION EVENTS                                    │   │
│  │  Eventos que são compartilhados ENTRE Bounded Contexts              │   │
│  │  Usados para comunicação assíncrona entre serviços                  │   │
│  │  Transportados via RabbitMQ (ou Kafka em cenários de alta carga)   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Diferenças Fundamentais

| Aspecto | Domain Events | Integration Events |
|---------|---------------|-------------------|
| **Escopo** | Dentro de um Context | Entre Contexts |
| **Propósito** | Manter consistência interna | Comunicação assíncrona |
| **RabbitMQ** | Não publicado diretamente | Transportados via RabbitMQ |
| **Exemplo** | `User.created` (interno) | `user.registered` (para outros ctx) |

---

## 2. Domain Events (Inside Each Context)

### 2.1 Event Base Class

```typescript
// src/domain/events/base.event.ts
import { v4 as uuidv4 } from 'uuid';

export interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  payload: any;
}

export abstract class Event implements BaseEvent {
  public readonly eventId: string;
  public readonly eventType: string;
  public readonly timestamp: Date;
  public readonly payload: any;

  constructor(eventType: string, payload: any) {
    this.eventId = uuidv4();
    this.eventType = eventType;
    this.timestamp = new Date();
    this.payload = payload;
  }
}
```

### 2.2 Event Types Enum

```typescript
// src/domain/events/event-types.enum.ts
export enum EventTypes {
  // User (Identity & Access) Events
  USER_REGISTERED = 'user.registered',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  
  // Project Events
  PROJECT_CREATED = 'project.created',
  PROJECT_UPDATED = 'project.updated',
  PROJECT_CANCELLED = 'project.cancelled',
  PROJECT_COMPLETED = 'project.completed',
  SPECIALIST_ASSIGNED = 'specialist.assigned',
  
  // Bidding Events
  BID_SUBMITTED = 'bid.submitted',
  BID_ACCEPTED = 'bid.accepted',
  BID_REJECTED = 'bid.rejected',
  BID_WITHDRAWN = 'bid.withdrawn',
  
  // Project Events (Milestone é owned pelo Project Context)
  MILESTONE_CREATED = 'milestone.created',
  MILESTONE_UPDATED = 'milestone.updated',

  // Delivery Events
  MILESTONE_STARTED = 'milestone.started',
  MILESTONE_VALIDATED = 'milestone.validated',   // delivery-service valida a entrega
  MILESTONE_REJECTED = 'milestone.rejected',
  HISTORY_RECORDED = 'history.recorded',         // RN07: histórico automático
  
  // Payment Events
  PAYMENT_ESCROW_CREATED = 'payment.escrow.created',
  PAYMENT_RELEASED = 'payment.released',
  PAYMENT_REFUNDED = 'payment.refunded',
}
```

---

## 3. Event Payloads

### 3.1 User Events

```typescript
// src/domain/events/user-registered.event.ts
import { Event } from './base.event';

export class UserRegisteredEvent extends Event {
  constructor(payload: {
    userId: string;
    email: string;
    name: string;
    userType: 'COMPANY' | 'SPECIALIST';
  }) {
    super('user.registered', payload);
  }
}
```

### 3.2 Project Events

```typescript
// src/domain/events/project-created.event.ts
import { Event } from './base.event';

export class ProjectCreatedEvent extends Event {
  constructor(payload: {
    projectId: string;
    title: string;
    description: string;
    budget: number;
    companyId: string;
    requirements: string[];
  }) {
    super('project.created', payload);
  }
}

// src/domain/events/specialist-assigned.event.ts
export class SpecialistAssignedEvent extends Event {
  constructor(payload: {
    projectId: string;
    specialistId: string;
    bidId: string;
  }) {
    super('specialist.assigned', payload);
  }
}
```

### 3.3 Bidding Events

```typescript
// src/domain/events/bid-submitted.event.ts
import { Event } from './base.event';

export class BidSubmittedEvent extends Event {
  constructor(payload: {
    bidId: string;
    projectId: string;
    specialistId: string;
    proposedBudget: number;
  }) {
    super('bid.submitted', payload);
  }
}

// src/domain/events/bid-accepted.event.ts
export class BidAcceptedEvent extends Event {
  constructor(payload: {
    bidId: string;
    projectId: string;
    specialistId: string;
    acceptedBudget: number;
  }) {
    super('bid.accepted', payload);
  }
}
```

### 3.4 Delivery Events

```typescript
// src/domain/events/milestone-completed.event.ts
import { Event } from './base.event';

export class MilestoneCompletedEvent extends Event {
  constructor(payload: {
    milestoneId: string;
    projectId: string;
    amount: number;
    completedAt: Date;
  }) {
    super('milestone.completed', payload);
  }
}

// src/domain/events/milestone-approved.event.ts
export class MilestoneApprovedEvent extends Event {
  constructor(payload: {
    milestoneId: string;
    projectId: string;
    amount: number;
    approvedAt: Date;
  }) {
    super('milestone.approved', payload);
  }
}
```

### 3.5 Payment Events

```typescript
// src/domain/events/payment-released.event.ts
import { Event } from './base.event';

export class PaymentReleasedEvent extends Event {
  constructor(payload: {
    paymentId: string;
    milestoneId: string;
    projectId: string;
    amount: number;
    releasedAt: Date;
    specialistId: string;
  }) {
    super('payment.released', payload);
  }
}
```

---

## 4. RabbitMQ Module

### 4.1 RabbitMQ Config Service

```typescript
// src/infrastructure/rabbitmq/rabbitmq-config.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQConfigService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

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
      
      // Declare exchange
      await this.channel.assertExchange('meraki.events', 'topic', { durable: true });
      
      console.log('RabbitMQ connected successfully');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
    }
  }

  async publishEvent(routingKey: string, message: any) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const messageBuffer = Buffer.from(JSON.stringify(message));
    
    this.channel.publish(
      'meraki.events',
      routingKey,
      messageBuffer,
      { persistent: true }
    );

    console.log(`Event published: ${routingKey}`);
  }

  async subscribe(queue: string, routingKey: string, callback: (message: any) => void) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    // Assert queue
    await this.channel.assertQueue(queue, { durable: true });
    
    // Bind queue to exchange
    await this.channel.bindQueue(queue, 'meraki.events', routingKey);
    
    // Consume messages
    this.channel.consume(queue, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        callback(content);
        this.channel.ack(msg);
      }
    });
  }

  private async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}
```

### 4.2 RabbitMQ Module

```typescript
// src/infrastructure/rabbitmq/rabbitmq.module.ts
import { Module, Global } from '@nestjs/common';
import { RabbitMQConfigService } from './rabbitmq-config.service';

@Global()
@Module({
  providers: [RabbitMQConfigService],
  exports: [RabbitMQConfigService],
})
export class RabbitMQModule {}
```

---

## 5. Event Publisher Service

```typescript
// src/infrastructure/rabbitmq/event-publisher.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { RabbitMQConfigService } from './rabbitmq-config.service';
import { Event, EventTypes } from '../../domain/events/event-types.enum';

@Injectable()
export class EventPublisherService {
  constructor(
    private readonly rabbitMQ: RabbitMQConfigService,
  ) {}

  // Identity Events
  async publishUserRegistered(payload: any) {
    await this.rabbitMQ.publishEvent(EventTypes.USER_REGISTERED, payload);
  }

  // Project Events
  async publishProjectCreated(payload: any) {
    await this.rabbitMQ.publishEvent(EventTypes.PROJECT_CREATED, payload);
  }

  async publishSpecialistAssigned(payload: any) {
    await this.rabbitMQ.publishEvent(EventTypes.SPECIALIST_ASSIGNED, payload);
  }

  // Bidding Events
  async publishBidSubmitted(payload: any) {
    await this.rabbitMQ.publishEvent(EventTypes.BID_SUBMITTED, payload);
  }

  async publishBidAccepted(payload: any) {
    await this.rabbitMQ.publishEvent(EventTypes.BID_ACCEPTED, payload);
  }

  // Delivery Events
  async publishMilestoneCompleted(payload: any) {
    await this.rabbitMQ.publishEvent(EventTypes.MILESTONE_COMPLETED, payload);
  }

  async publishMilestoneApproved(payload: any) {
    await this.rabbitMQ.publishEvent(EventTypes.MILESTONE_APPROVED, payload);
  }

  // Payment Events
  async publishPaymentReleased(payload: any) {
    await this.rabbitMQ.publishEvent(EventTypes.PAYMENT_RELEASED, payload);
  }
}
```

---

## 6. Event Subscriber/Handler

### 6.1 Example: Project Service Listening to Bid Events

```typescript
// src/infrastructure/rabbitmq/project-event-handler.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQConfigService } from './rabbitmq-config.service';
import { EventTypes } from '../../domain/events/event-types.enum';

@Injectable()
export class ProjectEventHandlerService implements OnModuleInit {
  constructor(private readonly rabbitMQ: RabbitMQConfigService) {}

  async onModuleInit() {
    // Listen for bid.accepted events
    await this.rabbitMQ.subscribe(
      'project.bid_events',
      EventTypes.BID_ACCEPTED,
      this.handleBidAccepted.bind(this)
    );

    // Listen for user.registered events
    await this.rabbitMQ.subscribe(
      'project.identity_events',
      EventTypes.USER_REGISTERED,
      this.handleUserRegistered.bind(this)
    );
  }

  private async handleBidAccepted(payload: any) {
    console.log('Received bid.accepted event:', payload);
    // Update project with assigned specialist
    // Implementation here
  }

  private async handleUserRegistered(payload: any) {
    console.log('Received user.registered event:', payload);
    // Handle new user registration if needed
  }
}
```

### 6.2 Example: Payment Service Listening to Delivery Events

```typescript
// src/infrastructure/rabbitmq/payment-event-handler.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQConfigService } from './rabbitmq-config.service';
import { EventTypes } from '../../domain/events/event-types.enum';

@Injectable()
export class PaymentEventHandlerService implements OnModuleInit {
  constructor(private readonly rabbitMQ: RabbitMQConfigService) {}

  async onModuleInit() {
    // Listen for milestone.completed events to prepare payment
    await this.rabbitMQ.subscribe(
      'payment.delivery_events',
      EventTypes.MILESTONE_COMPLETED,
      this.handleMilestoneCompleted.bind(this)
    );

    // Listen for milestone.approved events to release payment
    await this.rabbitMQ.subscribe(
      'payment.delivery_events',
      EventTypes.MILESTONE_APPROVED,
      this.handleMilestoneApproved.bind(this)
    );
  }

  private async handleMilestoneCompleted(payload: any) {
    console.log('Milestone completed, preparing payment:', payload);
    // Prepare escrow for milestone
  }

  private async handleMilestoneApproved(payload: any) {
    console.log('Milestone approved, releasing payment:', payload);
    // Release payment to specialist
  }
}
```

---

## 7. Integration with Use Cases

### 7.1 Publishing Event in Use Case

```typescript
// src/application/use-cases/submit-bid.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { IBidRepository } from '../../domain/repositories/bid.repository.interface';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { CreateBidDto } from '../dto/create-bid.dto';

@Injectable()
export class SubmitBidUseCase {
  constructor(
    @Inject('IBidRepository')
    private readonly bidRepository: IBidRepository,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async execute(dto: CreateBidDto) {
    // Create bid
    const bid = await this.bidRepository.create(dto);
    
    // Publish bid.submitted event
    await this.eventPublisher.publishBidSubmitted({
      bidId: bid.id,
      projectId: bid.projectId,
      specialistId: bid.specialistId,
      proposedBudget: bid.proposedBudget,
    });

    return bid;
  }
}
```

---

## 8. RabbitMQ Management UI

Acesse o painel de gerenciamento do RabbitMQ em:
- **URL**: http://localhost:15672
- **Usuário**: meraki
- **Senha**: meraki

### 8.1 Exchanges

| Exchange | Type | Purpose |
|----------|------|---------|
| meraki.events | topic | Main event exchange |

### 8.2 Queues

| Queue | Routing Keys | Service |
|-------|--------------|---------|
| user.events | user.* | User Service (Identity & Access) |
| project.events | project.*, milestone.created, milestone.updated | Project Service |
| bidding.events | bid.* | Bidding Service |
| delivery.events | milestone.started, milestone.validated, milestone.rejected, history.* | Delivery Service |
| payment.events | payment.* | Payment Service |
| portfolio.events | portfolio.*, review.*, history.recorded | Portfolio Service |

---

## 9. Retry and Error Handling

```typescript
// src/infrastructure/rabbitmq/rabbitmq-retry.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitMQRetryService {
  async retryWithBackoff(
    fn: () => Promise<any>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<any> {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`Retry attempt ${attempt} after ${delay}ms`);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 10. Próximos Passos

- [ ] 05 - API Gateway
- [ ] 06 - Arquitetura Flutter MVVM
- [ ] 07 - Implementação Flutter/Dart

