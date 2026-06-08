import { test, expect } from '@playwright/test'
import { registerAndLogin, loginWithRetry } from './helpers/api'

const API_URL = 'http://localhost:3000/api'

test.describe('UC: Kanban + Milestone Delivery (RF08/RF09/RN04)', () => {
  const ts = Date.now()
  const company = {
    name: 'Kanban Corp',
    email: `kanban-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
    companyName: 'Kanban Corp Ltda',
  }
  const specialist = {
    name: 'Kanban Dev',
    email: `kanban-dev-${ts}@test.com`,
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
    companyToken = await loginWithRetry(page, company.email, company.password)

    // Cria projeto com milestone
    const projRes = await page.request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: {
        title: 'Projeto Kanban E2E',
        description: 'Teste de fluxo kanban e entregas via UI.',
        requirements: ['Flutter', 'NestJS'],
        budget: 20000,
        deadline: '2027-12-31',
      },
    })
    if (!projRes.ok()) throw new Error('Falha ao criar projeto no beforeAll')
    projectId = (await projRes.json()).id

    // Cria milestone para o projeto
    await page.request.post(`${API_URL}/projects/${projectId}/milestones`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: { title: 'Fase Alpha', description: 'Primeira entrega do projeto.', amount: 20000 },
    })

    // Registra e faz login do especialista
    await page.request.post(`${API_URL}/auth/register`, { data: specialist })
    specialistToken = await loginWithRetry(page, specialist.email, specialist.password)

    // Especialista submete proposta
    const bidRes = await page.request.post(`${API_URL}/bids/project/${projectId}`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: { proposal: 'Proposta E2E para kanban flow.', proposedBudget: 18000, estimatedDuration: 45 },
    })
    if (!bidRes.ok()) throw new Error('Falha ao submeter proposta no beforeAll')
    const bidId = (await bidRes.json()).id

    // Empresa aceita a proposta
    const acceptRes = await page.request.put(`${API_URL}/bids/${bidId}/accept`, {
      headers: { Authorization: `Bearer ${companyToken}` },
    })
    if (!acceptRes.ok()) throw new Error('Falha ao aceitar proposta no beforeAll')

    await ctx.close()
  })

  // ── Testes via UI ─────────────────────────────────────────────────────────

  test('kanban board exibe colunas e milestone após bid aceito', async ({ page }) => {
    await registerAndLogin(page, company)
    await page.goto(`/kanban/${projectId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Projeto Kanban E2E').first()).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('Fase Alpha')).toBeVisible({ timeout: 5_000 })
  })

  test('especialista inicia milestone via UI (PENDING → IN_PROGRESS)', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await page.goto(`/kanban/${projectId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Clica em INICIAR TRABALHO
    const startBtn = page.getByRole('button', { name: /INICIAR TRABALHO/i })
    await expect(startBtn).toBeVisible({ timeout: 5_000 })
    await startBtn.click()

    // Após clicar, milestone muda para IN_PROGRESS — botão SUBMETER ENTREGA deve aparecer
    await expect(page.getByRole('button', { name: /SUBMETER ENTREGA/i })).toBeVisible({ timeout: 10_000 })
  })

  test('especialista submete entrega via UI (IN_PROGRESS → SUBMITTED_REVIEW)', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await page.goto(`/kanban/${projectId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Clica em SUBMETER ENTREGA
    const submitBtn = page.getByRole('button', { name: /SUBMETER ENTREGA/i })
    await expect(submitBtn).toBeVisible({ timeout: 5_000 })
    await submitBtn.click()

    // Modal abre
    await expect(page.getByRole('heading', { name: 'Submeter Entrega' })).toBeVisible({ timeout: 3_000 })

    await page.locator('input[placeholder*="github.com"]').first().fill('https://github.com/test/kanban-e2e')
    await page.locator('textarea[placeholder*="Descreva"]').first().fill('Fase Alpha concluída conforme especificação.')

    await page.getByRole('button', { name: /DEPLOY_SUBMIT/i }).click()

    // Modal fecha — milestone vai para SUBMITTED
    await expect(page.getByRole('heading', { name: 'Submeter Entrega' })).not.toBeVisible({ timeout: 10_000 })
    // Botão SUBMETER ENTREGA some da coluna (milestone saiu de IN_PROGRESS)
    await expect(page.getByRole('button', { name: /SUBMETER ENTREGA/i })).not.toBeVisible({ timeout: 5_000 })
  })

  test('empresa aprova milestone via UI (SUBMITTED_REVIEW → APPROVED)', async ({ page }) => {
    await registerAndLogin(page, company)
    await page.goto(`/kanban/${projectId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Clica em APROVAR
    const approveBtn = page.getByRole('button', { name: /APROVAR/i }).first()
    await expect(approveBtn).toBeVisible({ timeout: 5_000 })
    await approveBtn.click()

    // Modal de confirmação abre
    await expect(page.getByText('Aprovar Milestone')).toBeVisible({ timeout: 3_000 })
    await expect(page.getByText(/Ação Irreversível/i)).toBeVisible()

    await page.getByTestId('ms-approve-confirm').click()

    // Modal fecha — milestone vai para APPROVED
    await expect(page.getByText('Aprovar Milestone')).not.toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('PAGO E FINALIZADO')).toBeVisible({ timeout: 5_000 })
  })
})
