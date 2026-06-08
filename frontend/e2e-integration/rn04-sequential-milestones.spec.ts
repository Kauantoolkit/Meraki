import { test, expect } from '@playwright/test'
import { registerAndLogin, loginWithRetry } from './helpers/api'

const API_URL = 'http://localhost:3000/api'

/**
 * UC: RN04 — Milestones sequenciais
 *
 * Cria um projeto com 2 milestones. Verifica pela UI que:
 * - Milestone 2 está BLOQUEADA enquanto Milestone 1 não está APPROVED
 * - Após completar Milestone 1 (start → submit → approve), Milestone 2 fica disponível
 */
test.describe('UC: RN04 — Sequência Obrigatória de Milestones (RF08/RF09/RN04)', () => {
  const ts = Date.now()
  const company = {
    name: `Seq Corp ${ts}`,
    email: `seq-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
    companyName: `Seq Corp Ltda ${ts}`,
  }
  const specialist = {
    name: `Seq Dev ${ts}`,
    email: `seq-dev-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'SPECIALIST' as const,
  }

  let projectId: string
  let companyToken: string
  let specialistToken: string
  let milestone1Id: string

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    // Empresa
    await page.request.post(`${API_URL}/auth/register`, { data: company })
    companyToken = await loginWithRetry(page, company.email, company.password)

    // Cria projeto com 2 milestones
    const projRes = await page.request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: {
        title: 'Projeto Sequencial E2E',
        description: 'Teste de sequenciamento de milestones via UI.',
        requirements: ['NestJS', 'PostgreSQL'],
        budget: 30000,
        deadline: '2027-12-31',
      },
    })
    if (!projRes.ok()) throw new Error('Falha ao criar projeto')
    projectId = (await projRes.json()).id

    const m1 = await page.request.post(`${API_URL}/projects/${projectId}/milestones`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: { title: 'Milestone Alpha', description: 'Primeira etapa.', amount: 15000 },
    })
    if (!m1.ok()) throw new Error('Falha ao criar milestone 1')
    milestone1Id = (await m1.json()).id

    await page.request.post(`${API_URL}/projects/${projectId}/milestones`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: { title: 'Milestone Beta', description: 'Segunda etapa — só inicia após Alpha.', amount: 15000 },
    })

    // Especialista
    await page.request.post(`${API_URL}/auth/register`, { data: specialist })
    specialistToken = await loginWithRetry(page, specialist.email, specialist.password)

    // Submete proposta e empresa aceita
    const bidRes = await page.request.post(`${API_URL}/bids/project/${projectId}`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: { proposal: 'Proposta para sequencial E2E.', proposedBudget: 28000, estimatedDuration: 60 },
    })
    if (!bidRes.ok()) throw new Error('Falha ao submeter proposta')
    const bidId = (await bidRes.json()).id

    const acceptRes = await page.request.put(`${API_URL}/bids/${bidId}/accept`, {
      headers: { Authorization: `Bearer ${companyToken}` },
    })
    if (!acceptRes.ok()) throw new Error('Falha ao aceitar proposta')

    await ctx.close()
  })

  test('RN04 — Milestone Beta está BLOQUEADA enquanto Alpha não está aprovada', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await page.goto(`/kanban/${projectId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Milestone Alpha')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('Milestone Beta')).toBeVisible({ timeout: 5_000 })

    // Milestone Alpha pode ser iniciada (é a primeira)
    await expect(page.getByRole('button', { name: /INICIAR TRABALHO/i }).first()).toBeVisible()

    // Milestone Beta deve estar BLOQUEADA
    await expect(page.getByRole('button', { name: /BLOQUEADA/i })).toBeVisible()
  })

  test('RN04 — Após aprovar Alpha, Beta torna-se disponível para iniciar', async ({ page }) => {
    // Fase 1: especialista inicia e submete Milestone Alpha
    await registerAndLogin(page, specialist)
    await page.goto(`/kanban/${projectId}`, { waitUntil: 'networkidle' })
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    const startBtn = page.getByRole('button', { name: /INICIAR TRABALHO/i })
    await expect(startBtn).toBeVisible({ timeout: 5_000 })
    await startBtn.click()
    await expect(page.getByRole('button', { name: /SUBMETER ENTREGA/i })).toBeVisible({ timeout: 10_000 })

    await page.getByRole('button', { name: /SUBMETER ENTREGA/i }).click()
    await expect(page.getByRole('heading', { name: 'Submeter Entrega' })).toBeVisible({ timeout: 3_000 })
    await page.locator('input[placeholder*="github.com"]').first().fill('https://github.com/test/alpha')
    await page.locator('textarea[placeholder*="Descreva"]').first().fill('Alpha concluída.')
    await page.getByRole('button', { name: /DEPLOY_SUBMIT/i }).click()
    await expect(page.getByRole('heading', { name: 'Submeter Entrega' })).not.toBeVisible({ timeout: 10_000 })

    // Fase 2: empresa aprova Milestone Alpha
    await registerAndLogin(page, company)
    await page.goto(`/kanban/${projectId}`, { waitUntil: 'networkidle' })
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    const approveBtn = page.getByRole('button', { name: /APROVAR/i }).first()
    await expect(approveBtn).toBeVisible({ timeout: 5_000 })
    await approveBtn.click()
    await expect(page.getByText('Aprovar Milestone')).toBeVisible({ timeout: 3_000 })
    await page.getByTestId('ms-approve-confirm').click()
    await expect(page.getByText('PAGO E FINALIZADO')).toBeVisible({ timeout: 10_000 })

    // Fase 3: especialista vê Beta disponível (não mais BLOQUEADA)
    await registerAndLogin(page, specialist)
    await page.goto(`/kanban/${projectId}`, { waitUntil: 'networkidle' })
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await expect(page.getByText('Milestone Beta')).toBeVisible({ timeout: 5_000 })
    // Beta agora deve ter o botão INICIAR TRABALHO (não BLOQUEADA)
    await expect(page.getByRole('button', { name: /INICIAR TRABALHO/i })).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('button', { name: /BLOQUEADA/i })).not.toBeVisible()
  })
})
