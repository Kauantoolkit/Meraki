@echo off
REM Script para testar o Payment Service da MERAKI no Windows

setlocal enabledelayedexpansion

set "BASE_URL=http://localhost:3002"
set "SPECIALIST_ID=550e8400-e29b-41d4-a716-446655440000"
set "COMPANY_ID=550e8400-e29b-41d4-a716-446655440001"
set "PROJECT_ID=550e8400-e29b-41d4-a716-446655440002"

echo.
echo ========================================
echo 🚀 MERAKI Payment Service - Test Suite
echo ========================================
echo.

REM Teste 1: Criar Pagamento
echo [TEST 1] Creating Payment for Hiring...
echo.
curl -X POST "%BASE_URL%/payments/hiring" ^
  -H "Content-Type: application/json" ^
  -d "{\"specialistId\":\"!SPECIALIST_ID!\",\"companyId\":\"!COMPANY_ID!\",\"projectId\":\"!PROJECT_ID!\",\"amount\":500,\"description\":\"Payment for React specialization\"}"
echo.
echo.

REM Teste 2: Obter Saldo
echo [TEST 2] Getting Specialist Balance...
curl -X GET "%BASE_URL%/withdrawals/specialist/%SPECIALIST_ID%/balance"
echo.
echo.

REM Teste 3: Solicitar Saque
echo [TEST 3] Requesting Withdrawal (PIX)...
curl -X POST "%BASE_URL%/withdrawals" ^
  -H "Content-Type: application/json" ^
  -d "{\"specialistId\":\"!SPECIALIST_ID!\",\"amount\":300,\"paymentMethod\":\"PIX\",\"pixKey\":\"12345678901234567890123456789\"}"
echo.
echo.

echo.
echo ✅ Test script completed!
echo.
