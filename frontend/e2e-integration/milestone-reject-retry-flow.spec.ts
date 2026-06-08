import { test, expect } from '@playwright/test'
import { registerAndLogin, loginWithRetry } from './helpers/api'

const API_URL = 'http://localhost:3000/api'

test.describe('UC: Rejeitar Milestone + Retry (SUBMITTED → IN_PROGRESS → SUBMITTED → APPROVED)', () => {
  const ts = Date.now()
  const company = {
    name: 'Reject Corp',
    email: `reject-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
    companyName: 'Reject Corp Ltda',
  }
  const specialist = {
    name: 'Reject Dev',
    email: `reject-dev-${ts}@test.com`,
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
        title: 'Projeto Rejeitar E2E',
        description: 'Teste de rejeição e retry de milestone.',
        requirements: ['React', 'NestJS'],
        budget: 10000,
        deadline: '2027-12-31',
      },
    })
    projectId = (await projRes.json()).id

    const msRes = await page.request.post(`${API_URL}/projects/${projectId}/milestones`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: { title: 'Milestone Rejeitar', description: 'Entrega a ser rejeitada e corrigida.', amount: 10000 },
    })
    milestoneId = (await msRes.json()).id

    await page.request.post(`${API_URL}/auth/register`, { data: specialist })
    specialistToken = await loginWithRetry(page, specialist.email, specialist.password)

    const bidRes = await page.request.post(`${API_URL}/bids/project/${projectId}`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: { proposal: 'Proposta para milestone rejeitar.', proposedBudget: 9000, estimatedDuration: 30 },
    })
    const bidId = (await bidRes.json()).id

    await page.request.put(`${API_URL}/bids/${bidId}/accept`, {
      headers: { Authorization: `Bearer ${companyToken}` },
    })

    // Especialista inicia e submete entrega via API
    await page.request.put(`${API_URL}/milestones/${milestoneId}/start`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
    })
    await page.request.post(`${API_URL}/milestones/${milestoneId}/submit`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: { projectId, deliveryNotes: 'Primeira entrega (será rejeitada)', deliveredFiles: ['https://github.com/test/v1'] },
    })

    await ctx.close()
  })

  test('empresa vê botão REJEITAR no kanban para milestone SUBMITTED', async ({ page }) => {
    await registerAndLogin(page, company)
    await page.goto(`/kanban/${projectId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId(`ms-reject-${milestoneId}`)).toBeVisible({ timeout: 5_000 })
    await expect(page.getByTestId(`ms-approve-${milestoneId}`)).toBeVisible({ timeout: 5_000 })
  })

  test('empresa rejeita entrega via UI — milestone sai da coluna Submetido', async ({ page }) => {
    await registerAndLogin(page, company)
    await page.goto(`/kanban/${projectId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await page.getByTestId(`ms-reject-${milestoneId}`).click()

    // Modal de rejeição abre
    await expect(page.getByTestId('ms-reject-reason')).toBeVisible({ timeout: 3_000 })
    await page.getByTestId('ms-reject-reason').fill('O código não passou nos testes unitários.')

    await page.getByTestId('ms-reject-confirm').click()

    // Modal fecha — botão REJEITAR some (milestone saiu da coluna SUBMITTED)
    await expect(page.getByTestId('ms-reject-reason')).not.toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId(`ms-reject-${milestoneId}`)).not.toBeVisible({ timeout: 10_000 })
    // Botão APROVAR também some — milestone não está mais SUBMITTED
    await expect(page.getByTestId(`ms-approve-${milestoneId}`)).not.toBeVisible({ timeout: 5_000 })
  })

  test('especialista re-submete entrega após rejeição — milestone vai para SUBMITTED', async ({ page }) => {
    // Garante que a rejeição foi aplicada via API antes de verificar a UI do especialista
    const login = await page.request.post(`${API_URL}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    const token = (await login.json()).accessToken
    await page.request.put(`${API_URL}/milestones/${milestoneId}/reject`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { reason: 'Rejeição via API para garantir estado IN_PROGRESS' },
    }).catch(() => {}) // pode já estar IN_PROGRESS se o teste anterior passou

    await registerAndLogin(page, specialist)
    await page.goto(`/kanban/${projectId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await page.getByTestId(`ms-submit-${milestoneId}`).click()

    await expect(page.getByTestId('ms-submit-repo')).toBeVisible({ timeout: 3_000 })
    await page.getByTestId('ms-submit-repo').fill('https://github.com/test/v2-corrigido')
    await page.getByTestId('ms-submit-notes').fill('Corrigido após rejeição — testes passando.')

    await page.getByTestId('ms-submit-confirm').click()

    // Modal fecha — milestone volta para SUBMITTED
    await expect(page.getByTestId('ms-submit-repo')).not.toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId(`ms-submit-${milestoneId}`)).not.toBeVisible({ timeout: 5_000 })
  })

  test('empresa aprova entrega corrigida — milestone vai para APPROVED', async ({ page }) => {
    await registerAndLogin(page, company)
    await page.goto(`/kanban/${projectId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await page.getByTestId(`ms-approve-${milestoneId}`).click()

    await expect(page.getByText('Aprovar Milestone')).toBeVisible({ timeout: 3_000 })
    await page.getByTestId('ms-approve-confirm').click()

    await expect(page.getByText('PAGO E FINALIZADO')).toBeVisible({ timeout: 15_000 })
  })
})
