import { test, expect } from '@playwright/test'
import { registerAndLogin, loginWithRetry } from './helpers/api'

const API_URL = 'http://localhost:3000/api'

/**
 * UC: RN03 — Apenas um vencedor por projeto
 *
 * Dois especialistas submetem propostas para o mesmo projeto.
 * A empresa aceita a proposta do especialista 1.
 * Verifica pela UI que:
 * - A proposta do especialista 2 é marcada automaticamente como REJEITADO
 * - Não é possível aceitar outra proposta após o primeiro aceite
 * - A empresa é redirecionada ao Kanban
 */
test.describe('UC: RN03 — Um Vencedor por Projeto (RF06/RF07/RN03)', () => {
  const ts = Date.now()
  const company = {
    name: `Multi Bid Corp ${ts}`,
    email: `multi-bid-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
    companyName: `Multi Bid Corp Ltda ${ts}`,
  }
  const specialist1 = {
    name: `Dev Alpha ${ts}`,
    email: `dev-alpha-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'SPECIALIST' as const,
  }
  const specialist2 = {
    name: `Dev Beta ${ts}`,
    email: `dev-beta-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'SPECIALIST' as const,
  }

  let projectId: string
  let companyToken: string

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    // Empresa
    await page.request.post(`${API_URL}/auth/register`, { data: company })
    companyToken = await loginWithRetry(page, company.email, company.password)

    // Cria projeto
    const projRes = await page.request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: {
        title: 'Projeto Multi-Bid E2E',
        description: 'Teste de seleção de vencedor único.',
        requirements: ['React', 'TypeScript'],
        budget: 20000,
        deadline: '2027-12-31',
      },
    })
    if (!projRes.ok()) throw new Error('Falha ao criar projeto')
    projectId = (await projRes.json()).id

    // Especialista 1 regista e submete proposta
    await page.request.post(`${API_URL}/auth/register`, { data: specialist1 })
    const spec1Token = await loginWithRetry(page, specialist1.email, specialist1.password)
    await page.request.post(`${API_URL}/bids/project/${projectId}`, {
      headers: { Authorization: `Bearer ${spec1Token}` },
      data: { proposal: 'Proposta do Dev Alpha: 5 anos de React.', proposedBudget: 18000, estimatedDuration: 45 },
    })

    // Especialista 2 regista e submete proposta
    await page.request.post(`${API_URL}/auth/register`, { data: specialist2 })
    const spec2Token = await loginWithRetry(page, specialist2.email, specialist2.password)
    await page.request.post(`${API_URL}/bids/project/${projectId}`, {
      headers: { Authorization: `Bearer ${spec2Token}` },
      data: { proposal: 'Proposta do Dev Beta: foco em TypeScript.', proposedBudget: 17000, estimatedDuration: 40 },
    })

    await ctx.close()
  })

  test('empresa vê duas propostas pendentes na página de avaliação', async ({ page }) => {
    await registerAndLogin(page, company)
    await page.goto(`/projects/${projectId}/bids`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Contador de pendentes deve mostrar 2
    await expect(page.getByText(/2\s+pendentes/i)).toBeVisible({ timeout: 5_000 })

    // Ambos os botões de aceite devem estar visíveis
    const acceptBtns = page.getByRole('button', { name: /ACEITAR_PROPOSTA/i })
    await expect(acceptBtns).toHaveCount(2, { timeout: 5_000 })
  })

  test('RN03 — aceitar uma proposta rejeita a outra automaticamente', async ({ page }) => {
    await registerAndLogin(page, company)
    await page.goto(`/projects/${projectId}/bids`, { waitUntil: 'networkidle' })
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Aceita a primeira proposta via modal
    await page.getByRole('button', { name: /ACEITAR_PROPOSTA/i }).first().click()
    await expect(page.getByText(/Aceitar Proposta/i)).toBeVisible({ timeout: 3_000 })
    await page.getByRole('button', { name: /CONFIRMAR_ACEITE/i }).click()

    // RN03: redireciona para o kanban
    await expect(page).toHaveURL(/\/kanban\//, { timeout: 10_000 })
  })

  test('RN03 — após aceite, página de propostas mostra vencedor e não permite novo aceite', async ({ page }) => {
    await registerAndLogin(page, company)
    await page.goto(`/projects/${projectId}/bids`, { waitUntil: 'networkidle' })
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Banner de especialista selecionado deve aparecer
    await expect(page.getByText(/Especialista Seleccionado/i)).toBeVisible({ timeout: 5_000 })

    // Não deve existir botão de ACEITAR ativo
    await expect(page.getByRole('button', { name: /ACEITAR_PROPOSTA/i })).not.toBeVisible()

    // RN03: a outra proposta foi auto-rejeitada — badge REJEITADO deve aparecer
    await expect(page.getByText('REJEITADO', { exact: true }).first()).toBeVisible({ timeout: 5_000 })
  })
})
