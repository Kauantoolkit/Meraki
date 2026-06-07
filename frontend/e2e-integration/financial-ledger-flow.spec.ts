import { test, expect } from '@playwright/test'
import { registerAndLogin, loginWithRetry } from './helpers/api'

const API_URL = 'http://localhost:3000/api'

test.describe('UC: Ledger Financeiro — pagamento liberado via Kanban aparece no extrato (RF10)', () => {
  const ts = Date.now()
  const company = {
    name: 'Ledger Corp',
    email: `ledger-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
    companyName: 'Ledger Corp Ltda',
  }
  const specialist = {
    name: 'Ledger Dev',
    email: `ledger-dev-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'SPECIALIST' as const,
  }

  let projectId: string
  let milestoneId: string
  let companyToken: string
  let specialistToken: string

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    await page.request.post(`${API_URL}/auth/register`, { data: company })
    companyToken = await loginWithRetry(page, company.email, company.password)

    const projRes = await page.request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: {
        title: 'Projeto Ledger E2E',
        description: 'Teste do extrato financeiro.',
        requirements: ['Node.js'],
        budget: 8000,
        deadline: '2027-12-31',
      },
    })
    projectId = (await projRes.json()).id

    const msRes = await page.request.post(`${API_URL}/projects/${projectId}/milestones`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: { title: 'Fase Ledger', description: 'Entrega financeira.', amount: 8000 },
    })
    milestoneId = (await msRes.json()).id

    await page.request.post(`${API_URL}/auth/register`, { data: specialist })
    specialistToken = await loginWithRetry(page, specialist.email, specialist.password)

    const bidRes = await page.request.post(`${API_URL}/bids/project/${projectId}`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: { proposal: 'Proposta ledger.', proposedBudget: 7500, estimatedDuration: 25 },
    })
    const bidId = (await bidRes.json()).id

    await page.request.put(`${API_URL}/bids/${bidId}/accept`, {
      headers: { Authorization: `Bearer ${companyToken}` },
    })

    // Ciclo via API até SUBMITTED
    await page.request.put(`${API_URL}/milestones/${milestoneId}/start`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
    })
    await page.request.post(`${API_URL}/milestones/${milestoneId}/submit`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: { projectId, deliveryNotes: 'Entrega para ledger.', deliveredFiles: ['https://github.com/test/ledger'] },
    })

    await ctx.close()
  })

  test('empresa aprova milestone no Kanban e pagamento aparece no ledger do Financeiro', async ({ page }) => {
    await registerAndLogin(page, company)
    await page.goto(`/kanban/${projectId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Aprova via Kanban
    await page.getByTestId(`ms-approve-${milestoneId}`).click()
    await expect(page.getByText('Aprovar Milestone')).toBeVisible({ timeout: 3_000 })
    await page.getByTestId('ms-approve-confirm').click()
    await expect(page.getByText('PAGO E FINALIZADO')).toBeVisible({ timeout: 15_000 })

    // Aguarda evento RabbitMQ ser processado pelo payment-service
    // (milestone.validated → payment criado/liberado é assíncrono)
    await page.waitForTimeout(3000)

    // Navega para Financeiro
    await page.getByRole('link', { name: /FINANCEIRO/i }).first().click()
    await page.waitForURL(/\/financial/, { timeout: 5_000 })
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })

    // O livro-razão deve mostrar pelo menos uma transação
    await expect(page.getByText(/ESCROW_REL/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test('especialista vê pagamento RELEASED no extrato de ganhos', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await page.getByRole('link', { name: /GANHOS/i }).first().click()
    await page.waitForURL(/\/earnings/, { timeout: 5_000 })

    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    // Algum valor liberado deve aparecer
    await expect(page.getByText(/Liberado|LIBERADO/i).first()).toBeVisible({ timeout: 10_000 })
  })
})
