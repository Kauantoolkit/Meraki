# MERAKI Payment Service - Arquitetura Visual

## Diagrama de Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENTE (Web/App)                                │
└──────────────────────────────────────────┬──────────────────────────────────┘
                                           │
                         ┌─────────────────┼─────────────────┐
                         │                 │                 │
                    ┌────▼───┐      ┌──────▼────┐      ┌─────▼────┐
                    │ Company│      │Specialist │      │   Admin  │
                    │ (Pagar)│      │ (Sacar)   │      │ (Aprovar)│
                    └────┬───┘      └──────┬────┘      └─────┬────┘
                         │                 │                  │
                         └────────────────┬┼──────────────────┘
                                          ││
                         ┌────────────────┘│└──────────────────┐
                         │                 │                   │
         ┌───────────────▼─────────────┐   │   ┌───────────────▼──────┐
         │  Payment Service (NestJS)   │   │   │  Withdrawal Service  │
         │  Port: 3002                 │   │   │  (mesmo serviço)     │
         ├─────────────────────────────┤   │   ├──────────────────────┤
         │ Controllers:                │   │   │ Controllers:         │
         │ • POST /payments/hiring     │   │   │ • POST /withdrawals  │
         │ • PATCH .../confirm         │   │   │ • PATCH .../approve  │
         │ • GET /payments/:id         │◄──┤   │ • PATCH .../process  │
         │                             │   │   │ • GET /withdrawals   │
         └──────────────┬──────────────┘   │   └──────────┬───────────┘
                        │                  │              │
         ┌──────────────▼──────────────┬───▼──────┬───────▼────────┐
         │                             │          │                │
         │ Use Cases (Application)     │          │                │
         │ ✓ CreatePaymentHiring       │          │                │
         │ ✓ ConfirmPaymentHiring      │          │                │
         │ ✓ RequestWithdrawal         │          │                │
         │ ✓ ApproveWithdrawal         │          │                │
         │ ✓ ProcessWithdrawal         │          │                │
         │ ✓ GetSpecialistBalance      │          │                │
         │                             │          │                │
         └──────────────┬──────────────┘          │                │
                        │                         │                │
         ┌──────────────▼──────────────────────┬─▼────┬──────────▼──┐
         │                                     │      │             │
         │     Repositories (Infrastructure)   │      │             │
         │                                     │      │             │
         │  • PaymentRepository                │      │             │
         │  • WithdrawalRepository             │      │             │
         │  • SpecialistBalanceRepository      │      │             │
         │                                     │      │             │
         └──────────────┬──────────────────────┴──┬───┴────┬────────┘
                        │                          │        │
         ┌──────────────▼──────────────────────────▼──┬─────▼──────┐
         │                                            │             │
         │              PostgreSQL (Docker)           │ RabbitMQ    │
         │           meraki_payment DB                │ (Docker)    │
         │                                            │             │
         │  Tables:                                   │ Exchanges:  │
         │  • payments                                │ • meraki... │
         │  • withdrawals                             │              
         │  • specialist_balances                     │ Queues:     │
         │                                            │ • payment.. │
         │                                            │ • withdraw..│
         └────────────────────────────────────────────┴─────────────┘
                            │                             ▲
                            │                             │
                            └─────────┬───────────────────┘
                                      │
                        ┌─────────────┼─────────────┐
                        │             │             │
                    ┌───▼────┐  ┌─────▼──┐  ┌──────▼────┐
                    │Project │  │  User  │  │ Notif.   │
                    │Service │  │Service │  │ Service  │
                    │(escuta)│  │(escuta)│  │ (escuta) │
                    └────────┘  └────────┘  └──────────┘


                          Integration Events Flow:
                    
                    1. payment.confirmed
                       └─► Project, User, Notification Services
                    
                    2. withdrawal.completed
                       └─► User, Notification Services
                    
                    3. withdrawal.rejected
                       └─► User, Notification Services
```

---

## 📍 Camadas da Arquitetura

```
┌──────────────────────────────────────────────────┐
│          INTERFACES LAYER (REST API)             │
│                                                  │
│  Controllers:                                    │
│  • PaymentHiringController                       │
│  • WithdrawalController                          │
└─────────────────────────┬────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────┐
│        APPLICATION LAYER (Use Cases)             │
│                                                  │
│  Use Cases:                                      │
│  • CreatePaymentHiringUseCase                    │
│  • ConfirmPaymentHiringUseCase                   │
│  • RequestWithdrawalUseCase                      │
│  • ApproveWithdrawalUseCase                      │
│  • ProcessWithdrawalUseCase                      │
│  • GetSpecialistBalanceUseCase                   │
└─────────────────────────┬────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────┐
│         DOMAIN LAYER (Business Rules)            │
│                                                  │
│  Entities:              Repositories:            │
│  • Payment              • IPaymentRepository     │
│  • Withdrawal           • IWithdrawalRepository  │
│  • SpecialistBalance    • IBalanceRepository     │
│                                                  │
│  Enums:                                          │
│  • PaymentStatus        • PaymentType            │
│  • WithdrawalStatus     • PaymentMethod          │
└─────────────────────────┬────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────┐
│      INFRASTRUCTURE LAYER (Implementation)       │
│                                                  │
│  Repositories:                                   │
│  • PaymentRepository                             │
│  • WithdrawalRepository                          │
│  • SpecialistBalanceRepository                   │
│                                                  │
│  External Services:                              │
│  • RabbitMQ (PaymentEventPublisher)              │
│  • PostgreSQL (TypeORM)                          │
└──────────────────────────────────────────────────┘
```

---

## 🔄 Estados do Pagamento

```
                    ┌─────────────┐
                    │   PENDING   │
                    │  (Aguardado)│
                    └──────┬──────┘
                           │
                           │ Empresa paga PIX
                           │
                    ┌──────▼──────┐
                    │ PROCESSING  │
                    │(Processando)│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ COMPLETED   │
                    │ (Completo)  │
                    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │   FAILED    │ ◄─── Se algo der errado
                    │   (Falhou)  │
                    └─────────────┘

Alternativo:
PENDING ──► FAILED (erro)
PENDING ──► CANCELLED (cancelado pela empresa)
```

---

## 💰 Estados do Saque

```
                    ┌─────────────┐
                    │   PENDING   │
                    │ (Solicitado)│
                    └──────┬──────┘
                           │
                           │ Admin aprova
                           │
                    ┌──────▼──────┐
                    │  APPROVED   │
                    │ (Aprovado)  │
                    └──────┬──────┘
                           │
                           │ Sistema envia dinheiro
                           │
                    ┌──────▼──────┐
                    │ PROCESSING  │
                    │(Processando)│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ COMPLETED   │
                    │ (Completado)│
                    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  REJECTED   │ ◄─── Admin rejeita
                    │ (Rejeitado) │
                    └─────────────┘

ou:

PROCESSING ──► FAILED (erro no banco/PIX)
```

---

## 📡 Integração com Bounded Contexts

```
┌─────────────────────────────────────────────────────────┐
│            RabbitMQ Message Broker                       │
└────┬──────────────┬─────────────┬───────────┬───────────┘
     │              │             │           │
     │              │             │           │
┌────▼────┐  ┌──────▼─────┐ ┌────▼──────┐ ┌─▼──────────┐
│ Payment │  │ Project    │ │ User      │ │Notif.     │
│Service  │  │ Service    │ │ Service   │ │Service    │
│         │  │            │ │           │ │           │
│Publica: │  │Escuta:     │ │Escuta:    │ │Escuta:    │
│         │  │            │ │           │ │           │
│1. pay.. │  │• pay..con..│ │• pay..con.│ │• pay......│
│confirmed│  │• with...com│ │ • with...c│ │• with.....│
│         │  │            │ │ • with...r│ │           │
│2. with..│  │Ação:       │ │ Ação:     │ │Ação:      │
│completed│  │Marcar proj │ │Registrar  │ │Enviar     │
│         │  │como pago   │ │transação  │ │email/SMS  │
│3. with..│  │Desbloquear │ │Atualizar  │ │           │
│rejected │  │milestones  │ │histórico  │ │           │
└─────────┘  └────────────┘ └───────────┘ └───────────┘
```

---

## 🗄️ Schema do Banco de Dados

```sql
-- Pagamentos de Contratação
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  specialist_id UUID NOT NULL,
  company_id UUID NOT NULL,
  project_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(20) NOT NULL,           -- HIRING, WITHDRAWAL
  status VARCHAR(20) NOT NULL,         -- PENDING, COMPLETED, FAILED, etc
  pix_qr_code TEXT,
  transaction_id VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Saques do Especialista
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY,
  specialist_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL, -- PIX, BANK_TRANSFER, CREDIT_ACCOUNT
  pix_key VARCHAR(255),
  bank_account TEXT,                   -- JSON com dados bancários
  status VARCHAR(20) NOT NULL,         -- PENDING, APPROVED, PROCESSING, etc
  approved_at TIMESTAMP,
  processed_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Saldo do Especialista
CREATE TABLE specialist_balances (
  id UUID PRIMARY KEY,
  specialist_id UUID UNIQUE NOT NULL,
  total_earned DECIMAL(12,2) DEFAULT 0,    -- Total ganho
  available_balance DECIMAL(12,2) DEFAULT 0,  -- Disponível
  total_withdrawn DECIMAL(12,2) DEFAULT 0,     -- Já sacado
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_payments_specialist ON payments(specialist_id);
CREATE INDEX idx_payments_company ON payments(company_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_withdrawals_specialist ON withdrawals(specialist_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

CREATE INDEX idx_balance_specialist ON specialist_balances(specialist_id);
```

---

## 🎯 Casos de Uso em Detalhes

```
┌─────────────────────────────────────────────┐
│ 1. CREATE PAYMENT HIRING                    │
├─────────────────────────────────────────────┤
│ Actor: Empresa                              │
│ Trigger: Click em "Contratar Especialista" │
│                                             │
│ Flow:                                       │
│ 1. Empresa preenche formulário              │
│ 2. Sistema valida dados                     │
│ 3. Cria registro em "payments" table        │
│ 4. Gera QR Code PIX                         │
│ 5. Retorna QR Code para escanear            │
│ 6. Empresa escaneia e paga no banco         │
│                                             │
│ Output: Payment JSON com pixQrCode          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 2. CONFIRM PAYMENT HIRING                   │
├─────────────────────────────────────────────┤
│ Actor: Sistema / Empresa                    │
│ Trigger: Pagamento via PIX confirmado      │
│                                             │
│ Flow:                                       │
│ 1. Recebe callback do PIX (webhook)         │
│ 2. Valida pagamento                         │
│ 3. Atualiza status → COMPLETED              │
│ 4. Incrementa saldo do especialista         │
│ 5. Publica event "payment.confirmed"        │
│ 6. Retorna confirmação                      │
│                                             │
│ Output: Saldo incrementado + Event          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 3. REQUEST WITHDRAWAL                       │
├─────────────────────────────────────────────┤
│ Actor: Especialista                         │
│ Trigger: Click em "Sacar Dinheiro"         │
│                                             │
│ Flow:                                       │
│ 1. Especialista seleciona método (PIX/Bank) │
│ 2. Preenche chave PIX ou dados bancários    │
│ 3. Sistema valida saldo disponível          │
│ 4. Cria registro "withdrawal" (PENDING)     │
│ 5. Retorna solicitação confirmada           │
│                                             │
│ Output: Withdrawal JSON com status PENDING  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 4. APPROVE WITHDRAWAL                       │
├─────────────────────────────────────────────┤
│ Actor: Admin/Sistema                        │
│ Trigger: Click em "Aprovar Saque"          │
│                                             │
│ Flow:                                       │
│ 1. Admin verifica detalhes do saque         │
│ 2. Atualiza status → APPROVED               │
│ 3. Sistema pronto para processar            │
│ 4. Retorna confirmação                      │
│                                             │
│ Output: Withdrawal com status APPROVED      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 5. PROCESS WITHDRAWAL                       │
├─────────────────────────────────────────────┤
│ Actor: Sistema (background job)             │
│ Trigger: Status APPROVED                    │
│                                             │
│ Flow:                                       │
│ 1. Sistema processa em background           │
│ 2. Chama API do banco/PIX                   │
│ 3. Atualiza status → PROCESSING             │
│ 4. Aguarda confirmação da transferência     │
│ 5. Se OK: status → COMPLETED                │
│ 6. Decrementa saldo disponível              │
│ 7. Publica event "withdrawal.completed"     │
│                                             │
│ Output: Especialista recebe dinheiro        │
└─────────────────────────────────────────────┘
```

---

## 💡 Importante Saber

```
✅ Implementado:
  • Estrutura completa DDD
  • Todas as entidades e enums
  • Todos os use cases
  • Controllers REST com Swagger
  • Repositórios TypeORM
  • Testes unitários
  • Docker Compose para BD/RabbitMQ
  • Documentação completa

⏳ Para Fazer (quando necessário):
  • Integração real com PIX (API do banco)
  • Webhooks para confirmação de pagamento
  • Autenticação JWT
  • Rate limiting
  • Logging e Auditoria
  • Métricas (Prometheus)
  • Monitoramento (ELK)
  • CI/CD pipeline
```

Este é o core do sistema de pagamento! 🎯
