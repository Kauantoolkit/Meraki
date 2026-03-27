# MERAKI Payment Service - Referência Rápida de Endpoints

## Base URL
```
http://localhost:3002
```

## Swagger UI
```
http://localhost:3002/api
```

---

## 💳 PAGAMENTOS DE CONTRATAÇÃO

### 1. POST /payments/hiring
**Criar novo pagamento**

```bash
curl -X POST http://localhost:3002/payments/hiring \
  -H "Content-Type: application/json" \
  -d '{
    "specialistId": "550e8400-e29b-41d4-a716-446655440000",
    "companyId": "550e8400-e29b-41d4-a716-446655440001",
    "projectId": "550e8400-e29b-41d4-a716-446655440002",
    "amount": 500.00,
    "description": "Payment for React specialization"
  }'
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| specialistId | UUID | Sim | ID do especialista |
| companyId | UUID | Sim | ID da empresa |
| projectId | UUID | Sim | ID do projeto |
| amount | Decimal | Sim | Valor a pagar |
| description | String | Não | Descrição do pagamento |

**Response 201:**
```json
{
  "id": "payment-id",
  "specialistId": "...",
  "companyId": "...",
  "projectId": "...",
  "amount": 500,
  "type": "HIRING",
  "status": "PENDING",
  "pixQrCode": "00020126360014br.gov.bcb.pix0136...",
  "description": "...",
  "createdAt": "2026-03-23T10:00:00Z",
  "updatedAt": "2026-03-23T10:00:00Z"
}
```

---

### 2. PATCH /payments/hiring/:id/confirm
**Confirmar pagamento (após PIX ser recebido)**

```bash
curl -X PATCH http://localhost:3002/payments/hiring/payment-id/confirm
```

| Parâmetro | Tipo | Obrigatório |
|-----------|------|-------------|
| id | UUID | Sim |

**Response 200:**
```json
{
  "id": "payment-id",
  "status": "COMPLETED",
  "transactionId": "TXN-1711267200000",
  "completedAt": "2026-03-23T10:05:00Z",
  "message": "Payment confirmed. Specialist balance increased by R$ 500.00"
}
```

---

### 3. GET /payments/hiring/:id
**Obter detalhes do pagamento**

```bash
curl http://localhost:3002/payments/hiring/payment-id
```

**Response 200:**
```json
{
  "id": "payment-id",
  "specialistId": "...",
  "companyId": "...",
  "projectId": "...",
  "amount": 500,
  "type": "HIRING",
  "status": "COMPLETED",
  "transactionId": "TXN-...",
  "pixQrCode": "...",
  "completedAt": "2026-03-23T10:05:00Z",
  "createdAt": "2026-03-23T10:00:00Z"
}
```

---

### 4. GET /payments/hiring/company/:companyId
**Listar todos os pagamentos de uma empresa**

```bash
curl http://localhost:3002/payments/hiring/company/company-id
```

**Response 200:**
```json
[
  { /* payment 1 */ },
  { /* payment 2 */ },
  { /* payment 3 */ }
]
```

---

## SAQUES DO ESPECIALISTA

### 5. POST /withdrawals
**Solicitar novo saque**

```bash
curl -X POST http://localhost:3002/withdrawals \
  -H "Content-Type: application/json" \
  -d '{
    "specialistId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 300.00,
    "paymentMethod": "PIX",
    "pixKey": "12345678901234567890123456789"
  }'
```

**Método: PIX**
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| specialistId | UUID | Sim |
| amount | Decimal | Sim |
| paymentMethod | Enum | Sim |
| pixKey | String | Sim |

**Método: BANK_TRANSFER**
```json
{
  "specialistId": "...",
  "amount": 300,
  "paymentMethod": "BANK_TRANSFER",
  "bankAccount": "{\"bank\": \"001\", \"agency\": \"1234\", \"account\": \"123456\"}"
}
```

**Response 201:**
```json
{
  "id": "withdrawal-id",
  "specialistId": "...",
  "amount": 300,
  "paymentMethod": "PIX",
  "pixKey": "12345678901234567890123456789",
  "status": "PENDING",
  "createdAt": "2026-03-23T10:10:00Z",
  "updatedAt": "2026-03-23T10:10:00Z"
}
```

---

### 6. PATCH /withdrawals/:id/approve
**Admin aprova solicitação de saque**

```bash
curl -X PATCH http://localhost:3002/withdrawals/withdrawal-id/approve
```

**Response 200:**
```json
{
  "id": "withdrawal-id",
  "status": "APPROVED",
  "approvedAt": "2026-03-23T10:15:00Z"
}
```

---

### 7. PATCH /withdrawals/:id/process
**Processar saque (enviar dinheiro)**

```bash
curl -X PATCH http://localhost:3002/withdrawals/withdrawal-id/process
```

**Response 200:**
```json
{
  "id": "withdrawal-id",
  "status": "PROCESSING",
  "updatedAt": "2026-03-23T10:16:00Z"
}
```

---

### 8. GET /withdrawals/:id
**Obter detalhes do saque**

```bash
curl http://localhost:3002/withdrawals/withdrawal-id
```

**Response 200:**
```json
{
  "id": "withdrawal-id",
  "specialistId": "...",
  "amount": 300,
  "paymentMethod": "PIX",
  "pixKey": "12345678901234567890123456789",
  "status": "COMPLETED",
  "approvedAt": "2026-03-23T10:15:00Z",
  "processedAt": "2026-03-23T10:20:00Z",
  "createdAt": "2026-03-23T10:10:00Z"
}
```

---

### 9. GET /withdrawals/specialist/:specialistId/list
**Listar todos os saques de um especialista**

```bash
curl http://localhost:3002/withdrawals/specialist/specialist-id/list
```

**Response 200:**
```json
[
  { /* withdrawal 1 */ },
  { /* withdrawal 2 */ },
  { /* withdrawal 3 */ }
]
```

---

### 10. GET /withdrawals/specialist/:specialistId/balance
**Obter saldo atual do especialista**

```bash
curl http://localhost:3002/withdrawals/specialist/specialist-id/balance
```

**Response 200:**
```json
{
  "specialistId": "specialist-id",
  "totalEarned": 500,
  "availableBalance": 200,
  "totalWithdrawn": 300,
  "createdAt": "2026-03-23T10:05:00Z",
  "updatedAt": "2026-03-23T10:20:00Z"
}
```

---

## 🎯 Cenários de Uso Comuns

### Cenário 1: Empresa contrata especialista
```bash
# 1. Criar pagamento
PAY_ID=$(curl -s -X POST http://localhost:3002/payments/hiring \
  -H "Content-Type: application/json" \
  -d '{"specialistId":"...","companyId":"...","projectId":"...","amount":500}' \
  | jq -r '.id')

# 2. Empresa escaneia PIX e paga

# 3. Confirmar pagamento
curl -X PATCH http://localhost:3002/payments/hiring/$PAY_ID/confirm

# 4. Ver saldo do especialista
curl http://localhost:3002/withdrawals/specialist/spec-id/balance
```

---

### Cenário 2: Especialista solicita saque
```bash
# 1. Ver saldo disponível
curl http://localhost:3002/withdrawals/specialist/spec-id/balance

# 2. Solicitar saque
WITH_ID=$(curl -s -X POST http://localhost:3002/withdrawals \
  -H "Content-Type: application/json" \
  -d '{"specialistId":"...","amount":300,"paymentMethod":"PIX","pixKey":"..."}' \
  | jq -r '.id')

# 3. Admin aprova
curl -X PATCH http://localhost:3002/withdrawals/$WITH_ID/approve

# 4. Sistema processa
curl -X PATCH http://localhost:3002/withdrawals/$WITH_ID/process

# 5. Verificar status
curl http://localhost:3002/withdrawals/$WITH_ID
```

---

## 📊 Códigos HTTP

| Code | Significado |
|------|------------|
| 200 OK | Requisição bem-sucedida |
| 201 Created | Recurso criado com sucesso |
| 400 Bad Request | Dados inválidos / saldo insuficiente |
| 404 Not Found | Recurso não encontrado |
| 500 Internal Server Error | Erro no servidor |

---

## ⚠️ Erros Comuns

### 400 - Saldo insuficiente
```json
{
  "statusCode": 400,
  "message": "Insufficient balance. Available: 200"
}
```

### 400 - PIX key faltando
```json
{
  "statusCode": 400,
  "message": "PIX key is required for PIX withdrawals"
}
```

### 404 - Payment não encontrado
```json
{
  "statusCode": 404,
  "message": "Payment not found"
}
```

### 400 - Status inválido
```json
{
  "statusCode": 400,
  "message": "Payment is already COMPLETED"
}
```

---

## 🔐 Autenticação (Futura)

Quando implementar JWT:
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3002/payments/hiring
```

---

## 📈 Performance Tips

1. **Caching de saldo**: Cache o saldo por 5 segundos
2. **Índices no DB**: Criar índices em `specialist_id`, `status`
3. **Paginação**: Adicionar `skip` e `take` nas listagens
4. **Rate Limiting**: Limitar 100 req/min por IP

---

## 🔄 Ordem de Execução Recomendada

1. Criar pagamento (POST /payments/hiring)
2. Confirmar pagamento (PATCH /payments/hiring/:id/confirm)
3. Verificar saldo (GET /withdrawals/specialist/:id/balance)
4. Solicitar saque (POST /withdrawals)
5. Aprovar saque (PATCH /withdrawals/:id/approve)
6. Processar saque (PATCH /withdrawals/:id/process)

---

## 📱 Usando no Postman/Insomnia

Importar este `endpoints.json`:
```json
{
  "info": {
    "name": "MERAKI Payment Service",
    "description": "Payment and Withdrawal API"
  },
  "item": [
    {
      "name": "Create Payment",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/payments/hiring",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "specialistId": "{{specialistId}}",
          "companyId": "{{companyId}}",
          "projectId": "{{projectId}}",
          "amount": 500
        }
      }
    }
  ]
}
```

---

## 🚀 Pronto para usar!

Tudo está funcionando! 🎉

Próximo passo: Integrar com seu frontend e com outros serviços via RabbitMQ!
