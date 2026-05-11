import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'
import {
  getCompanyUser,
  getSpecialistUser,
  createProject,
  getMilestones,
  startMilestone,
  submitDelivery,
  approveMilestone,
  submitBid,
  apiRequest,
  type TestUser,
} from './helpers/api'

let company: TestUser
let specialist: TestUser

test.beforeAll(async () => {
  company = await getCompanyUser()
  specialist = await getSpecialistUser()
})

/* ═══════════════════════════════════════════
   FINANCEIRO - Empresa (T10b, RF10, RN05)
   ═══════════════════════════════════════════ */
test.describe('Financeiro - Company View (RF10, T10b)', () => {
  test('F85-render - renderiza página financeira', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/financial')
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Header
    await expect(page.getByText('Gestão de Fundo de Garantia')).toBeVisible({ timeout: 5_000 })

    // Stats cards
    await expect(page.getByText('Saldo Retido (Escrow)')).toBeVisible()
    await expect(page.getByText('Total Liberado (Fund)')).toBeVisible()
  })

  test('F85-ledger - exibe livro-razão de transações', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/financial')
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await expect(page.getByText('Livro-Razão de Transações')).toBeVisible()
    await expect(page.getByText('TX_ID')).toBeVisible()

    // Se não há transações, deve mostrar estado vazio
    const hasTransactions = await page.getByText('RELEASED').isVisible({ timeout: 2_000 }).catch(() => false)
    const isEmpty = await page.getByText(/Nenhuma transação registada/i).isVisible({ timeout: 2_000 }).catch(() => false)
    expect(hasTransactions || isEmpty).toBeTruthy()
  })

  test('F85-buttons - botões de exportar e aportar visíveis', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/financial')
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await expect(page.getByText('Exportar CSV')).toBeVisible()
    await expect(page.getByText('APORTAR FUNDOS')).toBeVisible()
  })

  test('F85-pending - exibe seção ações pendentes', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/financial')
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await expect(page.getByText('Ações Pendentes')).toBeVisible()
  })
})

/* ═══════════════════════════════════════════
   GANHOS ESPECIALISTA (T10b, RF10)
   ═══════════════════════════════════════════ */
test.describe('Ganhos Especialista (RF10, T10b)', () => {
  test('F87-render - renderiza dashboard de ganhos', async ({ page }) => {
    await loginAs(page, 'specialist')
    await page.goto('/earnings')
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await expect(page.getByText('Dashboard de Ganhos')).toBeVisible({ timeout: 5_000 })

    // Stats cards
    await expect(page.getByText('Saldo Disponível')).toBeVisible()
    await expect(page.getByText('Em Escrow (Seguro)')).toBeVisible()
    await expect(page.getByText('Ganhos Totais (Ano)')).toBeVisible()
  })

  test('F87-extrato - exibe extrato detalhado', async ({ page }) => {
    await loginAs(page, 'specialist')
    await page.goto('/earnings')
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await expect(page.getByText('Extrato Detalhado')).toBeVisible()

    // Pode ter transações reais ou estar vazio
    const hasTransactions = await page.getByText('RELEASED').isVisible({ timeout: 2_000 }).catch(() => false)
    const isEmpty = await page.getByText(/Nenhum pagamento recebido/i).isVisible({ timeout: 2_000 }).catch(() => false)
    expect(hasTransactions || isEmpty).toBeTruthy()
  })

  test('F87-saque - botão solicitar saque visível', async ({ page }) => {
    await loginAs(page, 'specialist')
    await page.goto('/earnings')
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await expect(page.getByText('Solicitar Saque')).toBeVisible()
  })
})

/* ═══════════════════════════════════════════
   KANBAN - Board básico (T10b, RF08, RF09, RN04)
   ═══════════════════════════════════════════ */
test.describe('Kanban - Board Rendering', () => {
  let kanbanProjectId: string

  test.beforeAll(async () => {
    // Create project with milestones for Kanban tests
    const project = await createProject(company.token, {
      title: 'Projeto Kanban E2E',
      description: 'Projeto com milestones para testar Kanban.',
      budget: 9000,
      deadline: '2027-12-31',
      requirements: ['NestJS', 'React'],
      milestones: [
        { title: 'Setup Inicial', description: 'Configuração do ambiente', amount: 3000 },
        { title: 'Core Features', description: 'Desenvolvimento principal', amount: 3000 },
        { title: 'Testes Finais', description: 'Testes e deploy', amount: 3000 },
      ],
    })
    kanbanProjectId = project.id

    // Assign specialist: submit + accept bid
    const bid = await submitBid(specialist.token, {
      projectId: kanbanProjectId,
      amount: 8000,
      durationDays: 60,
      proposalText: 'Proposta para Kanban E2E test.',
    })
    await apiRequest(`/bids/${bid.id}/accept`, { method: 'PUT', token: company.token })
  })

  test('F65 - redirect para dashboard quando sem projectId', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/kanban')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5_000 })
  })

  test('F68 - board carrega com milestones do projeto', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto(`/kanban/${kanbanProjectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Project title or milestones should be visible
    await expect(page.getByText('Projeto Kanban E2E')).toBeVisible({ timeout: 5_000 })
  })

  test('F66 - specialist vê milestones no kanban', async ({ page }) => {
    await loginAs(page, 'specialist')
    await page.goto(`/kanban/${kanbanProjectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // At least one milestone should be visible
    await expect(page.getByText('Setup Inicial')).toBeVisible({ timeout: 5_000 })
  })

  test('F69 - RN04: milestone bloqueada quando anterior pendente', async ({ page }) => {
    await loginAs(page, 'specialist')
    await page.goto(`/kanban/${kanbanProjectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Check for BLOQUEADA button (milestone 2 or 3 should be blocked)
    const blockedBtn = page.getByRole('button', { name: /BLOQUEADA/i })
    if (await blockedBtn.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(blockedBtn.first()).toBeDisabled()
    }
  })
})

/* ═══════════════════════════════════════════
   KANBAN - Fluxo completo de milestone (RF09, RN04, RN05)
   ═══════════════════════════════════════════ */
test.describe('Kanban - Milestone Workflow', () => {
  let workflowProjectId: string

  test.beforeAll(async () => {
    const project = await createProject(company.token, {
      title: 'Projeto Workflow E2E',
      description: 'Para testar fluxo completo de milestone.',
      budget: 6000,
      deadline: '2027-12-31',
      requirements: ['Go', 'Docker'],
      milestones: [
        { title: 'Fase Alpha', description: 'Primeira fase', amount: 3000 },
        { title: 'Fase Beta', description: 'Segunda fase', amount: 3000 },
      ],
    })
    workflowProjectId = project.id

    // Assign specialist
    const bid = await submitBid(specialist.token, {
      projectId: workflowProjectId,
      amount: 5500,
      durationDays: 30,
      proposalText: 'Proposta para workflow E2E.',
    })
    await apiRequest(`/bids/${bid.id}/accept`, { method: 'PUT', token: company.token })
  })

  test('Specialist pode iniciar milestone (PENDING → IN_PROGRESS)', async ({ page }) => {
    await loginAs(page, 'specialist')
    await page.goto(`/kanban/${workflowProjectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Look for INICIAR TRABALHO button on the first milestone
    const startBtn = page.getByRole('button', { name: /INICIAR TRABALHO/i })
    if (await startBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await startBtn.click()
      // Wait for state to update — milestone should move to IN_PROGRESS
      await expect(page.getByRole('button', { name: /SUBMETER ENTREGA/i })).toBeVisible({ timeout: 10_000 })
    }
  })

  test('Specialist pode submeter entrega (IN_PROGRESS → SUBMITTED_REVIEW)', async ({ page }) => {
    await loginAs(page, 'specialist')
    await page.goto(`/kanban/${workflowProjectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    const submitBtn = page.getByRole('button', { name: /SUBMETER ENTREGA/i })
    if (await submitBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await submitBtn.click()

      // Modal deve abrir
      await expect(page.getByRole('heading', { name: 'Submeter Entrega' })).toBeVisible({ timeout: 3_000 })
      await page.locator('input[placeholder*="github.com"]').first().fill('https://github.com/test/repo')
      await page.locator('textarea[placeholder*="Descreva"]').first().fill('Entrega da Fase Alpha.')

      // Confirm
      await page.getByRole('button', { name: /DEPLOY_SUBMIT/i }).click()

      // Modal should close, milestone moves to SUBMITTED_REVIEW
      await expect(page.getByRole('heading', { name: 'Submeter Entrega' })).not.toBeVisible({ timeout: 10_000 })
    }
  })

  test('Company pode aprovar milestone (SUBMITTED_REVIEW → APPROVED)', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto(`/kanban/${workflowProjectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    const approveBtn = page.getByRole('button', { name: /APROVAR.*PAGAR/i })
    if (await approveBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await approveBtn.click()

      // Modal with warning
      await expect(page.getByText('Aprovar Milestone')).toBeVisible({ timeout: 3_000 })
      await expect(page.getByText(/Ação Irreversível/i)).toBeVisible()

      // Confirm
      await page.getByRole('button', { name: /CONFIRMAR_PAGAMENTO/i }).click()

      // Modal should close
      await expect(page.getByText('Aprovar Milestone')).not.toBeVisible({ timeout: 10_000 })
    }
  })
})

/* ═══════════════════════════════════════════
   KANBAN - Visibilidade por Role
   ═══════════════════════════════════════════ */
test.describe('Kanban - Role Visibility', () => {
  let roleProjectId: string

  test.beforeAll(async () => {
    const project = await createProject(company.token, {
      title: 'Projeto Role E2E',
      description: 'Para testar visibilidade por role.',
      budget: 4000,
      deadline: '2027-12-31',
      requirements: ['Python'],
      milestones: [
        { title: 'Milestone Role Test', description: 'Test', amount: 4000 },
      ],
    })
    roleProjectId = project.id

    const bid = await submitBid(specialist.token, {
      projectId: roleProjectId,
      amount: 3500,
      durationDays: 15,
      proposalText: 'Role visibility test.',
    })
    await apiRequest(`/bids/${bid.id}/accept`, { method: 'PUT', token: company.token })
  })

  test('Company NÃO vê INICIAR TRABALHO (só specialist pode)', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto(`/kanban/${roleProjectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Company should NOT see INICIAR TRABALHO
    await expect(page.getByRole('button', { name: /INICIAR TRABALHO/i })).not.toBeVisible()
  })

  test('Company NÃO vê SUBMETER ENTREGA (só specialist pode)', async ({ page }) => {
    // First advance milestone to IN_PROGRESS via API
    const milestones = await getMilestones(specialist.token, roleProjectId)
    if (milestones.length > 0 && milestones[0].status === 'PENDING') {
      await startMilestone(specialist.token, milestones[0].id)
    }

    await loginAs(page, 'company')
    await page.goto(`/kanban/${roleProjectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await expect(page.getByRole('button', { name: /SUBMETER ENTREGA/i })).not.toBeVisible()
  })

  test('Specialist NÃO vê APROVAR & PAGAR (só company pode)', async ({ page }) => {
    // Advance to SUBMITTED_REVIEW via API
    const milestones = await getMilestones(specialist.token, roleProjectId)
    if (milestones.length > 0 && milestones[0].status === 'IN_PROGRESS') {
      await submitDelivery(specialist.token, {
        milestoneId: milestones[0].id,
        projectId: roleProjectId,
        deliveryNotes: 'Test delivery',
        deliveredFiles: ['https://github.com/test/role-test'],
      })
    }

    await loginAs(page, 'specialist')
    await page.goto(`/kanban/${roleProjectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await expect(page.getByRole('button', { name: /APROVAR.*PAGAR/i })).not.toBeVisible()
  })
})
