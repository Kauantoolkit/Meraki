import { test, expect } from '@playwright/test'
import { registerAndLogin, loginWithRetry } from './helpers/api'

const API_URL = 'http://localhost:3000/api'

test.describe('UC: Retirar Proposta (PUT /bids/:id/withdraw)', () => {
  const ts = Date.now()
  const company = {
    name: 'Withdraw Corp',
    email: `withdraw-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
    companyName: 'Withdraw Corp Ltda',
  }
  const specialist = {
    name: 'Withdraw Dev',
    email: `withdraw-dev-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'SPECIALIST' as const,
  }

  let projectId: string
  let bidId: string
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
        title: 'Projeto Withdraw E2E',
        description: 'Projeto para testar retirada de proposta.',
        requirements: ['Python'],
        budget: 6000,
        deadline: '2027-12-31',
      },
    })
    projectId = (await projRes.json()).id

    await page.request.post(`${API_URL}/projects/${projectId}/milestones`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: { title: 'Fase Única', description: 'Entrega.', amount: 6000 },
    })

    await page.request.post(`${API_URL}/auth/register`, { data: specialist })
    specialistToken = await loginWithRetry(page, specialist.email, specialist.password)

    const bidRes = await page.request.post(`${API_URL}/bids/project/${projectId}`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: { proposal: 'Proposta para withdraw.', proposedBudget: 5500, estimatedDuration: 15 },
    })
    bidId = (await bidRes.json()).id

    await ctx.close()
  })

  test('botão Retirar Proposta aparece para bid PENDING na tela de bidding', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await page.goto(`/bidding/${projectId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('bid-withdraw-btn')).toBeVisible({ timeout: 5_000 })
  })

  test('especialista retira proposta via UI — status muda para WITHDRAWN', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await page.goto(`/bidding/${projectId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Aceita o diálogo de confirmação automaticamente
    page.on('dialog', dialog => dialog.accept())

    await page.getByTestId('bid-withdraw-btn').click()

    // Após withdraw, o botão some (bid deixa de ser PENDING)
    await expect(page.getByTestId('bid-withdraw-btn')).not.toBeVisible({ timeout: 10_000 })

    // O status WITHDRAWN deve ser visível no overlay
    await expect(page.getByText(/WITHDRAWN|RETIRADO|Retirado/i).first()).toBeVisible({ timeout: 5_000 })
  })

  test('API confirma que proposta ficou WITHDRAWN', async ({ request }) => {
    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email: specialist.email, password: specialist.password },
    })
    const token = (await login.json()).accessToken

    const res = await request.get(`${API_URL}/bids/${bidId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const bid = await res.json()
    expect(bid.status).toBe('WITHDRAWN')
  })

  test('especialista pode submeter nova proposta após retirada (RN02 liberado)', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await page.goto(`/bidding/${projectId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Após WITHDRAWN, o formulário de nova proposta deve estar disponível
    const form = page.locator('form').first()
    await expect(form).toBeVisible({ timeout: 5_000 })
  })
})
