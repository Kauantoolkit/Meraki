# MERAKI Payment Service - API Examples

## 1. Criar Pagamento de Contratação

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

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "specialistId": "550e8400-e29b-41d4-a716-446655440000",
  "companyId": "550e8400-e29b-41d4-a716-446655440001",
  "projectId": "550e8400-e29b-41d4-a716-446655440002",
  "amount": 500,
  "type": "HIRING",
  "status": "PENDING",
  "pixQrCode": "00020126360014br.gov.bcb.pix0136...",
  "description": "Payment for React specialization",
  "createdAt": "2026-03-23T10:00:00.000Z",
  "updatedAt": "2026-03-23T10:00:00.000Z"
}
```

---

## 2. Confirmar Pagamento (após PIX ser recebido)

```bash
curl -X PATCH http://localhost:3002/payments/hiring/123e4567-e89b-12d3-a456-426614174000/confirm
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "COMPLETED",
  "transactionId": "TXN-1711267200000",
  "completedAt": "2026-03-23T10:05:00.000Z",
  "message": "Payment confirmed. Specialist balance increased by R$ 500.00"
}
```

---

## 3. Obter Saldo do Especialista

```bash
curl http://localhost:3002/withdrawals/specialist/550e8400-e29b-41d4-a716-446655440000/balance
```

**Response:**
```json
{
  "specialistId": "550e8400-e29b-41d4-a716-446655440000",
  "totalEarned": 500.00,
  "availableBalance": 500.00,
  "totalWithdrawn": 0,
  "createdAt": "2026-03-23T10:05:00.000Z",
  "updatedAt": "2026-03-23T10:05:00.000Z"
}
```

---

## 4. Solicitar Saque (via PIX)

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

**Response:**
```json
{
  "id": "223e4567-e89b-12d3-a456-426614174000",
  "specialistId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 300,
  "paymentMethod": "PIX",
  "pixKey": "12345678901234567890123456789",
  "status": "PENDING",
  "createdAt": "2026-03-23T10:10:00.000Z",
  "updatedAt": "2026-03-23T10:10:00.000Z"
}
```

---

## 5. Solicitar Saque (via Transferência Bancária)

```bash
curl -X POST http://localhost:3002/withdrawals \
  -H "Content-Type: application/json" \
  -d '{
    "specialistId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 200.00,
    "paymentMethod": "BANK_TRANSFER",
    "bankAccount": "{\"bank\": \"001\", \"agency\": \"1234\", \"account\": \"123456\", \"accountType\": \"C\"}"
  }'
```

---

## 6. Aprovar Saque (Admin)

```bash
curl -X PATCH http://localhost:3002/withdrawals/223e4567-e89b-12d3-a456-426614174000/approve
```

**Response:**
```json
{
  "id": "223e4567-e89b-12d3-a456-426614174000",
  "status": "APPROVED",
  "approvedAt": "2026-03-23T10:15:00.000Z"
}
```

---

## 7. Processar Saque (Enviar dinheiro)

```bash
curl -X PATCH http://localhost:3002/withdrawals/223e4567-e89b-12d3-a456-426614174000/process
```

**Response:**
```json
{
  "id": "223e4567-e89b-12d3-a456-426614174000",
  "status": "PROCESSING",
  "updatedAt": "2026-03-23T10:16:00.000Z"
}
```

---

## 8. Obter Detalhes do Saque

```bash
curl http://localhost:3002/withdrawals/223e4567-e89b-12d3-a456-426614174000
```

---

## 9. Listar Todos os Saques de um Especialista

```bash
curl http://localhost:3002/withdrawals/specialist/550e8400-e29b-41d4-a716-446655440000/list
```

---

## 10. Listar Todos os Pagamentos de uma Empresa

```bash
curl http://localhost:3002/payments/hiring/company/550e8400-e29b-41d4-a716-446655440001
```

---

## Códigos de Status

| Status | Significado |
|--------|-------------|
| PENDING | Aguardando confirmação/aprovação |
| APPROVED | Aprovado, pronto para processar |
| PROCESSING | Em processamento |
| COMPLETED | Completado com sucesso |
| REJECTED | Rejeitado |
| FAILED | Falha no processamento |
| CANCELLED | Cancelado |

---

## Fluxo Recomendado

### Para Empresa Contratar Especialista:
1. Criar pagamento → POST /payments/hiring
2. Copiar QR Code PIX e pagar via aplicativo
3. Confirmar pagamento → PATCH /payments/hiring/:id/confirm

### Para Especialista Sacar:
1. Consultar saldo → GET /withdrawals/specialist/:id/balance
2. Solicitar saque → POST /withdrawals
3. Aguardar aprovação do admin
4. Admin aprova → PATCH /withdrawals/:id/approve
5. Admin processa → PATCH /withdrawals/:id/process
6. Especialista recebe em sua conta
