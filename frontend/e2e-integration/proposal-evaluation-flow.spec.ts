import { test, expect } from '@playwright/test'
import { registerAndLogin } from './helpers/api'

const API_URL = 'http://localhost:3000/api'

test.describe('UC: Avaliar Propostas e Selecionar Vencedor (RF06/RF07/RN03)', () => {
  const ts = Date.now()
  const company = {
    name: 'Eval Corp',
    email: `eval-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
    companyName: 'Eval Corp Ltda',
  }
  const specialist = {
    name: 'Eval Dev',
    email: `eval-dev-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'SPECIALIST' as const,
  }

  let projectId: string
  let companyToken: string
  let specialistToken: string

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    // Registra e faz login da empresa
    await page.request.post(`${API_URL}/auth/register`, { data: company })
    const companyLogin = await page.request.post(`${API_URL}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    if (!companyLogin.ok()) throw new Error('Falha ao logar empresa no beforeAll')
    companyToken = (await companyLogin.json()).accessToken

    // Cria projeto
    const projRes = await page.request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: {
        title: 'Projeto Avaliação E2E',
        description: 'Teste de avaliação de propostas via UI.',
        requirements: ['React', 'NestJS'],
        budget: 15000,
        deadline: '2027-12-31',
      },
    })
    if (!projRes.ok()) throw new Error('Falha ao criar projeto no beforeAll')
    projectId = (await projRes.json()).id

    // Registra e faz login do especialista
    await page.request.post(`${API_URL}/auth/register`, { data: specialist })
    const specLogin = await page.request.post(`${API_URL}/auth/login`, {
      data: { email: specialist.email, password: specialist.password },
    })
    if (!specLogin.ok()) throw new Error('Falha ao logar especialista no beforeAll')
    specialistToken = (await specLogin.json()).accessToken

    // Especialista submete proposta via API (setup)
    const bidRes = await page.request.post(`${API_URL}/bids/project/${projectId}`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: {
        proposal: 'Proposta E2E: experiência sólida em React e NestJS com foco em microsserviços.',
        proposedBudget: 12000,
        estimatedDuration: 30,
      },
    })
    if (!bidRes.ok()) throw new Error('Falha ao submeter proposta no beforeAll')

    await ctx.close()
  })

  test('empresa vê a proposta do especialista na página de avaliação', async ({ page }) => {
    await registerAndLogin(page, company)
    await page.goto(`/projects/${projectId}/bids`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Proposta deve estar visível com dados reais do backend
    await expect(page.getByText(/Especialista|Eval Dev/i).first()).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText(/12\.?000|R\$\s*12/i)).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('button', { name: /ACEITAR_BID/i })).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('button', { name: /REJEITAR/i })).toBeVisible({ timeout: 5_000 })
  })

  test('empresa aceita proposta via UI e é redirecionada ao kanban (RN03)', async ({ page }) => {
    await registerAndLogin(page, company)
    await page.goto(`/projects/${projectId}/bids`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Clica em aceitar
    await page.getByRole('button', { name: /ACEITAR_BID/i }).first().click()

    // Modal de confirmação
    await expect(page.getByText(/Confirmar/i)).toBeVisible({ timeout: 3_000 })
    await page.getByRole('button', { name: /CONFIRMAR/i }).click()

    // RN03: ao aceitar, redireciona para o kanban do projeto
    await expect(page).toHaveURL(/\/kanban\//, { timeout: 10_000 })
    await expect(page.locator('main')).toBeVisible({ timeout: 5_000 })
  })
})
