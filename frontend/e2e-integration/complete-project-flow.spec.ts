import { test, expect } from '@playwright/test'
import { registerAndLogin, loginWithRetry } from './helpers/api'

const API_URL = 'http://localhost:3000/api'

test.describe('UC: Completar Projeto (PUT /projects/:id/complete)', () => {
  const ts = Date.now()
  const company = {
    name: 'Complete Corp',
    email: `complete-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
    companyName: 'Complete Corp Ltda',
  }
  const specialist = {
    name: 'Complete Dev',
    email: `complete-dev-${ts}@test.com`,
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
        title: 'Projeto Completar E2E',
        description: 'Projeto para testar o fluxo de conclusão.',
        requirements: ['TypeScript'],
        budget: 5000,
        deadline: '2027-12-31',
      },
    })
    projectId = (await projRes.json()).id

    const msRes = await page.request.post(`${API_URL}/projects/${projectId}/milestones`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: { title: 'Única Fase', description: 'Entrega final.', amount: 5000 },
    })
    milestoneId = (await msRes.json()).id

    await page.request.post(`${API_URL}/auth/register`, { data: specialist })
    specialistToken = await loginWithRetry(page, specialist.email, specialist.password)

    const bidRes = await page.request.post(`${API_URL}/bids/project/${projectId}`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: { proposal: 'Proposta para completar.', proposedBudget: 4500, estimatedDuration: 20 },
    })
    const bidId = (await bidRes.json()).id

    await page.request.put(`${API_URL}/bids/${bidId}/accept`, {
      headers: { Authorization: `Bearer ${companyToken}` },
    })

    // Ciclo completo via API: start → submit → approve
    await page.request.put(`${API_URL}/milestones/${milestoneId}/start`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
    })
    await page.request.post(`${API_URL}/milestones/${milestoneId}/submit`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: { projectId, deliveryNotes: 'Entrega final.', deliveredFiles: ['https://github.com/test/final'] },
    })
    await page.request.put(`${API_URL}/milestones/${milestoneId}/approve`, {
      headers: { Authorization: `Bearer ${companyToken}` },
    })

    await ctx.close()
  })

  test('botão MARCAR_COMPLETO() aparece no card do projeto IN_PROGRESS', async ({ page }) => {
    await registerAndLogin(page, company)
    await page.getByRole('link', { name: /EMPRESA/i }).first().click()
    await page.waitForURL(/\/dashboard/, { timeout: 5_000 })

    await expect(page.getByTestId(`complete-project-${projectId}`)).toBeVisible({ timeout: 10_000 })
  })

  test('empresa clica MARCAR_COMPLETO() e projeto muda para COMPLETED no dashboard', async ({ page }) => {
    await registerAndLogin(page, company)
    await page.getByRole('link', { name: /EMPRESA/i }).first().click()
    await page.waitForURL(/\/dashboard/, { timeout: 5_000 })

    await page.getByTestId(`complete-project-${projectId}`).click()

    // Projeto some do filtro ALL (que esconde COMPLETED) — precisa de filtro COMPLETED
    await page.getByRole('button', { name: /CONCLUÍDO|Concluído|COMPLETED/i }).click()
    await expect(page.getByText('Projeto Completar E2E')).toBeVisible({ timeout: 10_000 })
  })

  test('API retorna erro ao tentar completar projeto com milestone não aprovado', async ({ request }) => {
    // Cria novo projeto sem milestones aprovados
    const companyLogin = await request.post(`${API_URL}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    const token = (await companyLogin.json()).accessToken

    const projRes = await request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: 'Projeto Incompleto E2E',
        description: 'Projeto com milestone não aprovado.',
        requirements: ['Node'],
        budget: 1000,
        deadline: '2027-12-31',
      },
    })
    const incompleteProjectId = (await projRes.json()).id

    const res = await request.put(`${API_URL}/projects/${incompleteProjectId}/complete`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    // Backend deve rejeitar — projeto OPEN não pode ser completado
    expect(res.status()).toBeGreaterThanOrEqual(400)
  })
})
