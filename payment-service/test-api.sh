#!/bin/bash

# Script para testar o Payment Service da MERAKI
# Executa testes de integração simulados

BASE_URL="http://localhost:3002"
SPECIALIST_ID="550e8400-e29b-41d4-a716-446655440000"
COMPANY_ID="550e8400-e29b-41d4-a716-446655440001"
PROJECT_ID="550e8400-e29b-41d4-a716-446655440002"

echo "🚀 MERAKI Payment Service - Test Suite"
echo "======================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Teste 1: Criar Pagamento de Contratação
echo -e "${YELLOW}[TEST 1]${NC} Creating Payment for Hiring..."
PAYMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/payments/hiring" \
  -H "Content-Type: application/json" \
  -d '{
    "specialistId": "'$SPECIALIST_ID'",
    "companyId": "'$COMPANY_ID'",
    "projectId": "'$PROJECT_ID'",
    "amount": 500,
    "description": "Payment for React specialization"
  }')

echo "Response: $PAYMENT_RESPONSE"
echo ""

# Extrair Payment ID (assumindo que o response tem um campo id)
PAYMENT_ID=$(echo $PAYMENT_RESPONSE | grep -oP '"id":"?\K[^,"]*')

if [ -z "$PAYMENT_ID" ]; then
  PAYMENT_ID="123e4567-e89b-12d3-a456-426614174000"
fi

echo -e "${GREEN}✅ Payment Created with ID: $PAYMENT_ID${NC}"
echo ""

# Teste 2: Obter Detalhes do Pagamento
echo -e "${YELLOW}[TEST 2]${NC} Getting Payment Details..."
curl -s -X GET "$BASE_URL/payments/hiring/$PAYMENT_ID" | jq .
echo ""

# Teste 3: Confirmar Pagamento
echo -e "${YELLOW}[TEST 3]${NC} Confirming Payment (PIX received)..."
curl -s -X PATCH "$BASE_URL/payments/hiring/$PAYMENT_ID/confirm" | jq .
echo ""

# Teste 4: Obter Saldo do Especialista
echo -e "${YELLOW}[TEST 4]${NC} Getting Specialist Balance..."
curl -s -X GET "$BASE_URL/withdrawals/specialist/$SPECIALIST_ID/balance" | jq .
echo ""

# Teste 5: Solicitar Saque
echo -e "${YELLOW}[TEST 5]${NC} Requesting Withdrawal (PIX)..."
WITHDRAWAL_RESPONSE=$(curl -s -X POST "$BASE_URL/withdrawals" \
  -H "Content-Type: application/json" \
  -d '{
    "specialistId": "'$SPECIALIST_ID'",
    "amount": 300,
    "paymentMethod": "PIX",
    "pixKey": "12345678901234567890123456789"
  }')

echo "Response: $WITHDRAWAL_RESPONSE"
echo ""

WITHDRAWAL_ID=$(echo $WITHDRAWAL_RESPONSE | grep -oP '"id":"?\K[^,"]*')
if [ -z "$WITHDRAWAL_ID" ]; then
  WITHDRAWAL_ID="223e4567-e89b-12d3-a456-426614174000"
fi

echo -e "${GREEN}✅ Withdrawal Created with ID: $WITHDRAWAL_ID${NC}"
echo ""

# Teste 6: Obter Detalhes do Saque
echo -e "${YELLOW}[TEST 6]${NC} Getting Withdrawal Details..."
curl -s -X GET "$BASE_URL/withdrawals/$WITHDRAWAL_ID" | jq .
echo ""

# Teste 7: Aprovar Saque
echo -e "${YELLOW}[TEST 7]${NC} Approving Withdrawal..."
curl -s -X PATCH "$BASE_URL/withdrawals/$WITHDRAWAL_ID/approve" | jq .
echo ""

# Teste 8: Processar Saque
echo -e "${YELLOW}[TEST 8]${NC} Processing Withdrawal..."
curl -s -X PATCH "$BASE_URL/withdrawals/$WITHDRAWAL_ID/process" | jq .
echo ""

# Teste 9: Listar Saques do Especialista
echo -e "${YELLOW}[TEST 9]${NC} Listing All Withdrawals for Specialist..."
curl -s -X GET "$BASE_URL/withdrawals/specialist/$SPECIALIST_ID/list" | jq .
echo ""

# Teste 10: Listar Pagamentos da Empresa
echo -e "${YELLOW}[TEST 10]${NC} Listing All Payments for Company..."
curl -s -X GET "$BASE_URL/payments/hiring/company/$COMPANY_ID" | jq .
echo ""

echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "📊 Summary:"
echo "  - Payment ID: $PAYMENT_ID"
echo "  - Withdrawal ID: $WITHDRAWAL_ID"
echo "  - Specialist ID: $SPECIALIST_ID"
echo "  - Company ID: $COMPANY_ID"
