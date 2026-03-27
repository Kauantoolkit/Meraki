# MERAKI Payment Service

Sistema de pagamento via PIX para a plataforma MERAKI.

## Arquitetura

O Payment Service segue o padrão **Domain-Driven Design (DDD)** com as camadas:

- **Domain Layer**: Entidades e regras de negócio
- **Application Layer**: Use Cases (orquestração de operações)
- **Infrastructure Layer**: Repositórios e acesso a dados
- **Interfaces Layer**: Controllers REST

## Funcionalidades Implementadas

### 1. Contratação de Especialista (Hiring Payment)
- Empresa inicia pagamento para contratar especialista
- Gera QR Code PIX para recebimento
- Sistema aguarda confirmação de pagamento

**Endpoints:**
```
POST /payments/hiring
- Criar novo pagamento de contratação

PATCH /payments/hiring/:id/confirm
- Confirmar que o PIX foi recebido

GET /payments/hiring/:id
- Obter detalhes do pagamento

GET /payments/hiring/company/:companyId
- Listar todos os pagamentos de uma empresa
```

### 2. Saque do Especialista (Withdrawal)
- Especialista solicita saque do valor ganho
- Suporta: PIX, Transferência Bancária, Crédito na Plataforma
- Admin aprova/rejeita o saque
- Sistema processa o pagamento

**Endpoints:**
```
POST /withdrawals
- Solicitar novo saque

PATCH /withdrawals/:id/approve
- Admin aprova o saque

PATCH /withdrawals/:id/process
- Processa o pagamento (enviar dinheiro)

GET /withdrawals/:id
- Obter detalhes do saque

GET /withdrawals/specialist/:specialistId/list
- Listar todos os saques de um especialista

GET /withdrawals/specialist/:specialistId/balance
- Obter saldo atual do especialista
```

## Modelos de Dados

### Payment (Pagamento de Contratação)
```typescript
{
  id: UUID
  specialistId: UUID
  companyId: UUID
  projectId: UUID
  amount: decimal
  type: HIRING | WITHDRAWAL
  status: PENDING | PROCESSING | COMPLETED | FAILED | CANCELLED
  pixQrCode: string (código QR para escanear)
  transactionId: string (ID da transação no PIX)
  createdAt: DateTime
  updatedAt: DateTime
  completedAt: DateTime (preenchido quando confirmado)
}
```

### Withdrawal (Saque do Especialista)
```typescript
{
  id: UUID
  specialistId: UUID
  amount: decimal
  paymentMethod: PIX | BANK_TRANSFER | CREDIT_ACCOUNT
  pixKey: string (chave PIX: CPF, CNPJ, email ou telefone)
  bankAccount: string (dados bancários em JSON)
  status: PENDING | APPROVED | PROCESSING | COMPLETED | REJECTED | FAILED
  approvedAt: DateTime
  processedAt: DateTime
  rejectionReason: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### SpecialistBalance (Saldo do Especialista)
```typescript
{
  id: UUID
  specialistId: UUID (unique)
  totalEarned: decimal (total ganho)
  availableBalance: decimal (disponível para saque)
  totalWithdrawn: decimal (total já sacado)
  createdAt: DateTime
  updatedAt: DateTime
}
```

## Fluxo Completo

### 1. Contratação de Especialista
```
1. Empresa cria pagamento → POST /payments/hiring
   - Retorna QR Code PIX
2. Empresa escaneia e paga via PIX
3. Sistema confirma pagamento → PATCH /payments/hiring/:id/confirm
   - Incrementa saldo disponível do especialista
```

### 2. Saque do Especialista
```
1. Especialista solicita saque → POST /withdrawals
   - Informa método (PIX/Banco) e dados
   - Sistema valida saldo disponível
2. Admin aprova → PATCH /withdrawals/:id/approve
3. Sistema processa → PATCH /withdrawals/:id/process
   - Envia dinheiro via PIX/Banco
   - Decrementa saldo disponível
4. Especialista recebe em sua conta
```

## Testando o Sistema

### Testes Diretos
```bash
npm test:direct
```

O arquivo `payment.service.spec.ts` contém testes que validam:
- ✅ Criação de pagamento de contratação
- ✅ Confirmação de pagamento
- ✅ Solicitação de saque
- ✅ Aprovação de saque
- ✅ Processamento de saque
- ✅ Obtenção de saldo
- ✅ Validações de erro

### Executar Testes com Cobertura
```bash
npm test:cov
```

## Instalação e Configuração

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados
Criar arquivo `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=meraki_payment
NODE_ENV=development
```

### 3. Executar Servidor
```bash
npm start:dev
```

O servidor estará disponível em `http://localhost:3002/api`

## Próximas Etapas (Se Necessário)

1. **Integração Real com PIX**: Integrar com API de banco (Banco do Brasil, Itaú, etc)
2. **WebHooks**: Receber notificações de pagamentos confirmados
3. **Rate Limiting**: Limitar requisições
4. **Autenticação**: JWT para validar usuários
5. **Auditoria**: Log de todas as transações
6. **Notificações**: Email/SMS para confirmar pagamentos
7. **Reembolsos**: Permitir reembolso de pagamentos
