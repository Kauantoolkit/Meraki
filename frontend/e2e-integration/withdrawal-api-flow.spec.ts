import { test, expect } from '@playwright/test'
import { registerAndLogin, loginWithRetry } from './helpers/api'

const API_URL = 'http://localhost:3000/api'

/**
 * Testa o fluxo de saque do especialista via API.
 * A UI de saque ainda não existe — estes testes validam o backend
 * e servem como contrato para quando a tela for implementada.
 */
test.describe('UC: Saque do Especialista (POST /withdrawals)', () => {
  const ts = Date.now()
  const company = {
    name: 'Withdrawal Corp',
    email: `withdrawal-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
    companyName: 'Withdrawal Corp Ltda',
  }
  const specialist = {
    name: 'Withdrawal Dev',
    email: `withdrawal-dev-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'SPECIALIST' as const,
  }

  let companyToken: string
  let specialistToken: string

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    await page.request.post(`${API_URL}/auth/register`, { data: company })
    companyToken = await loginWithRetry(page, company.email, company.password)

    await page.request.post(`${API_URL}/auth/register`, { data: specialist })
    specialistToken = await loginWithRetry(page, specialist.email, specialist.password)

    // Ciclo completo para gerar saldo: projeto → bid → accept → start → submit → approve
    const projRes = await page.request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: {
        title: 'Projeto Saque E2E',
        description: 'Gera saldo para teste de saque.',
        requirements: ['Go'],
        budget: 5000,
        deadline: '2027-12-31',
      },
    })
    const projectId = (await projRes.json()).id

    const msRes = await page.request.post(`${API_URL}/projects/${projectId}/milestones`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: { title: 'Fase Saque', description: 'Entrega para gerar saldo.', amount: 5000 },
    })
    const milestoneId = (await msRes.json()).id

    const bidRes = await page.request.post(`${API_URL}/bids/project/${projectId}`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: { proposal: 'Proposta para saque.', proposedBudget: 4500, estimatedDuration: 10 },
    })
    const bidId = (await bidRes.json()).id

    await page.request.put(`${API_URL}/bids/${bidId}/accept`, {
      headers: { Authorization: `Bearer ${companyToken}` },
    })
    await page.request.put(`${API_URL}/milestones/${milestoneId}/start`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
    })
    await page.request.post(`${API_URL}/milestones/${milestoneId}/submit`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: { projectId, deliveryNotes: 'Entrega para saque.', deliveredFiles: ['https://github.com/test/saque'] },
    })
    await page.request.put(`${API_URL}/milestones/${milestoneId}/approve`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: { amount: 5000 },
    })

    // Aguarda evento milestone.validated ser processado pelo payment-service
    // e o saldo do especialista ser creditado (fluxo assíncrono via RabbitMQ)
    await page.waitForTimeout(4000)

    await ctx.close()
  })

  test('especialista tem saldo disponível após milestone aprovada', async ({ request }) => {
    const res = await request.get(`${API_URL}/withdrawals/balance`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body).toHaveProperty('availableBalance')
    expect(Number(body.availableBalance)).toBeGreaterThan(0)
  })

  test('especialista solicita saque via API com chave Pix', async ({ request }) => {
    const res = await request.post(`${API_URL}/withdrawals`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: {
        amount: 1000,
        method: 'PIX',
        pixKey: specialist.email,
      },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body).toHaveProperty('id')
    expect(body.status).toBe('PENDING')
    expect(Number(body.amount)).toBe(1000)
  })

  test('saque com valor maior que saldo disponível é rejeitado', async ({ request }) => {
    const res = await request.post(`${API_URL}/withdrawals`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: {
        amount: 999999,
        method: 'PIX',
        pixKey: specialist.email,
      },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
  })

  test('tela de ganhos exibe saldo na página /earnings', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await page.getByRole('link', { name: /GANHOS/i }).first().click()
    await page.waitForURL(/\/earnings/, { timeout: 5_000 })

    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    // Deve mostrar algum valor recebido
    await expect(page.getByText(/Total Recebido|Ganhos|Recebido/i).first()).toBeVisible({ timeout: 5_000 })
  })
})
