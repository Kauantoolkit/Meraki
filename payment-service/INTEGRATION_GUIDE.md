# MERAKI Payment Service - Integração com Arquitetura

## Conectar com outros Contextos via RabbitMQ

O Payment Service se comunica com outros Bounded Contexts através do RabbitMQ usando Integration Events.

### Events Publicados pelo Payment Service

#### 1. `payment.confirmed`
Publicado quando um pagamento de contratação é confirmado.

```json
{
  "eventType": "payment.confirmed",
  "specialistId": "uuid",
  "companyId": "uuid",
  "projectId": "uuid",
  "paymentId": "uuid",
  "amount": 500,
  "status": "COMPLETED",
  "timestamp": "2026-03-23T10:00:00Z"
}
```

**Serviços que devem escutar:**
- **Project Service**: Pode registrar que o pagamento foi feito
- **Notification Service**: Enviar email de confirmação

---

#### 2. `withdrawal.completed`
Publicado quando um saque é completado com sucesso.

```json
{
  "eventType": "withdrawal.completed",
  "specialistId": "uuid",
  "withdrawalId": "uuid",
  "amount": 300,
  "status": "COMPLETED",
  "timestamp": "2026-03-23T10:30:00Z"
}
```

**Serviços que devem escutar:**
- **User Service**: Atualizar histórico de transações
- **Notification Service**: Notificar especialista

---

#### 3. `withdrawal.rejected`
Publicado quando um saque é rejeitado.

```json
{
  "eventType": "withdrawal.rejected",
  "specialistId": "uuid",
  "withdrawalId": "uuid",
  "status": "REJECTED",
  "timestamp": "2026-03-23T10:30:00Z"
}
```

---

## Usando o RabbitMQ Publisher no Código

### Exemplo: Confirmar Pagamento e Publicar Evento

```typescript
// confirm-payment-hiring.use-case.ts

import { PaymentEventPublisher } from '../../infrastructure/rabbitmq/payment-event.publisher';

@Injectable()
export class ConfirmPaymentHiringUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly balanceRepository: ISpecialistBalanceRepository,
    private readonly eventPublisher: PaymentEventPublisher,
  ) {}

  async execute(paymentId: string): Promise<any> {
    // ... lógica existente ...

    // Publicar evento
    await this.eventPublisher.publishPaymentConfirmed(
      paymentId,
      payment.specialistId,
      payment.amount,
    );

    return result;
  }
}
```

---

## Integração com Project Service

Quando um pagamento de contratação é confirmado, o Project Service pode "marcar" que o especialista foi pago.

### Exemplo: Project Service escuta `payment.confirmed`

```typescript
// src/application/consumers/payment-confirmed.consumer.ts

import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class PaymentConfirmedConsumer {
  constructor(private readonly projectService: ProjectService) {}

  @EventPattern('payment.confirmed')
  async handlePaymentConfirmed(@Payload() event: any) {
    console.log('Payment confirmed:', event);
    
    // Atualizar projeto indicando que foi pago
    await this.projectService.markAsPaid({
      projectId: event.projectId,
      paymentId: event.paymentId,
      amount: event.amount,
    });
  }
}
```

---

## Fluxo Completo com Eventos

```
1. Empresa cria pagamento
   POST /payments/hiring
   │
   └─> Payment Service: PaymentPending criado

2. Empresa paga via PIX

3. Especialista confirma recebimento
   PATCH /payments/hiring/:id/confirm
   │
   ├─> Payment Service: Status → COMPLETED
   ├─> Saldo do Especialista: +R$ 500
   │
   └─> 📤 Event: payment.confirmed
       │
       ├─> Project Service: marca pagamento OK
       ├─> User Service: registra transação
       └─> Notification Service: envia email

4. Especialista solicita saque
   POST /withdrawals
   │
   └─> Payment Service: WithdrawalPending criado

5. Admin aprova saque
   PATCH /withdrawals/:id/approve
   │
   └─> Payment Service: Status → APPROVED

6. Sistem processa saque
   PATCH /withdrawals/:id/process
   │
   ├─> Payment Service: Status → PROCESSING/COMPLETED
   ├─> Saldo do Especialista: -R$ 300
   │
   └─> 📤 Event: withdrawal.completed
       │
       ├─> User Service: atualiza histórico
       └─> Notification Service: notifica especialista
```

---

## Configuração do RabbitMQ no payment-module.ts

```typescript
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule.forRoot, {
      exchanges: [
        {
          name: 'meraki.payments',
          type: 'topic',
        },
      ],
      uri: process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672',
    }),
    // ... resto das imports ...
  ],
  // ...
})
export class PaymentModule {}
```

---

## Events que o Payment Service ESCUTA

### 1. `project.hired`
Quando um projeto foi marcado como "com especialista" (vem do Project Service)

```json
{
  "eventType": "project.hired",
  "projectId": "uuid",
  "specialistId": "uuid",
  "projectPaymentAmount": 500
}
```

---

## Próximas Integrações

1. **Integração com Notification Service**
   - Enviar email quando pagamento é confirmado
   - Enviar SMS quando saque é processado

2. **Integração com User Service**
   - Notificar ambos os usuários sobre pagamento
   - Manter histórico de transações

3. **Integração com Project Service**
   - Garantir que projeto tem especialista pago
   - Desbloquear milestones após pagamento

4. **Auditoria e Logs**
   - Registrar todas as transações em banco de dados de auditoria
   - Rastrear mudanças de status

---

## Testing com RabbitMQ

Para testar, configure um RabbitMQ local:

```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:management
```

URL Admin: http://localhost:15672
Username: guest
Password: guest
