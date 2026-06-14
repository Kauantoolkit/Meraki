import { test, expect } from '@playwright/test'
import { registerAndLogin, loginWithRetry, createSkillInCatalog } from './helpers/api'

const API_URL = 'http://localhost:3000/api'

/** Navigate to the company dashboard via navbar, find the project card by title, click an action button */
async function openProjectAction(
  page: Parameters<typeof registerAndLogin>[0],
  title: string,
  btnName: RegExp,
) {
  await page.getByRole('button', { name: /EMPRESA/i }).first().click()
  await page.waitForURL(/\/dashboard/, { timeout: 5_000 })
  await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('h3').filter({ hasText: title })).toBeVisible({ timeout: 10_000 })
  const card = page.locator('h3').filter({ hasText: title }).locator('..')
  await card.getByRole('button', { name: btnName }).click()
}

/** Fill and submit the CreateProject wizard (Steps 1–4), return to dashboard */
async function createProjectViaWizard(
  page: Parameters<typeof registerAndLogin>[0],
  opts: {
    title: string
    description: string
    skill: string
    milestoneTitle: string
    milestoneAmount: string
    milestoneDesc: string
    deadline: string
  },
) {
  await page.getByRole('button', { name: /EMPRESA/i }).first().click()
  await page.waitForURL(/\/dashboard/, { timeout: 5_000 })
  await page.getByRole('button', { name: /Novo Projeto/i }).click()
  await expect(page).toHaveURL(/\/projects\/new/, { timeout: 5_000 })

  // Step 1: Base
  await expect(page.locator('text=Título do Projeto')).toBeVisible({ timeout: 10_000 })
  await page.locator('input[type="text"]').first().fill(opts.title)
  await page.locator('textarea').first().fill(opts.description)
  await page.getByTestId('cp-next-1').click()

  // Step 2: Skill — garante que existe no catálogo e seleciona via autocomplete
  await expect(page.locator('text=Adicionar Tecnologia')).toBeVisible({ timeout: 5_000 })
  await createSkillInCatalog(page, opts.skill)
  await page.getByTestId('cp-skill-input').fill(opts.skill.toLowerCase())
  await page.getByTestId(`cp-skill-suggestion-${opts.skill.toLowerCase()}`).waitFor({ timeout: 5_000 })
  await page.getByTestId(`cp-skill-suggestion-${opts.skill.toLowerCase()}`).click()
  await page.getByTestId('cp-next-2').click()

  // Step 3: Milestone
  await expect(page.locator('input[placeholder="Nome do Entregável"]').first()).toBeVisible({ timeout: 5_000 })
  await page.locator('input[placeholder="Nome do Entregável"]').nth(0).fill(opts.milestoneTitle)
  await page.getByTestId('cp-mamount-0').fill(opts.milestoneAmount)
  await page.locator('textarea').nth(0).fill(opts.milestoneDesc)
  await page.getByTestId('cp-next-3').click()

  // Step 4: Budget / Deadline
  await expect(page.getByRole('heading', { name: /Orçamento/i })).toBeVisible({ timeout: 5_000 })
  await page.getByTestId('cp-deadline').fill(opts.deadline)
  await page.getByTestId('cp-publish').click()

  await expect(page.getByTestId('cp-published')).toBeVisible({ timeout: 15_000 })
  await page.locator('button:has-text("Voltar ao Painel")').click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 5_000 })
}

/**
 * Specialist finds project via /projects/browse search, clicks CANDIDATAR, and submits bid.
 * NOTE: bid-amount is readonly when project has milestones (auto-calculated from milestone total),
 * so we only fill proposal text and estimated duration.
 */
async function findAndBid(
  page: Parameters<typeof registerAndLogin>[0],
  title: string,
  bid: { proposal: string; duration: string },
) {
  await page.getByRole('button', { name: /PROJETOS/i }).first().click()
  await page.waitForURL(/\/projects\/browse/, { timeout: 5_000 })
  await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

  await page.locator('input[placeholder*="BUSCAR POR TÍTULO"]').fill(title)
  await expect(page.getByText(title)).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: /CANDIDATAR/i }).first().click()

  await expect(page).toHaveURL(/\/bidding\//, { timeout: 5_000 })
  await expect(page.getByText(title)).toBeVisible({ timeout: 5_000 })

  await page.locator('textarea').first().fill(bid.proposal)
  await page.getByTestId('bid-duration').fill(bid.duration)
  await page.getByRole('button', { name: /ENVIAR_PROPOSTA/i }).click()
  await expect(page.getByText(/PROPOSTA SUBMETIDA/i)).toBeVisible({ timeout: 10_000 })
}

/** Company accepts first bid via dashboard; app redirects to kanban (RN03) */
async function companyAcceptBid(
  page: Parameters<typeof registerAndLogin>[0],
  title: string,
) {
  await openProjectAction(page, title, /VER_PROPOSTAS/i)
  await expect(page).toHaveURL(/\/projects\/.*\/bids/, { timeout: 5_000 })
  await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

  await expect(page.getByRole('button', { name: /ACEITAR_PROPOSTA/i })).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: /ACEITAR_PROPOSTA/i }).first().click()

  await expect(page.getByText(/Aceitar Proposta/i)).toBeVisible({ timeout: 3_000 })
  await page.getByRole('button', { name: /CONFIRMAR_ACEITE/i }).click()

  // RN03: redirect to kanban
  await expect(page).toHaveURL(/\/kanban\//, { timeout: 10_000 })
  await expect(page.locator('main')).toBeVisible({ timeout: 5_000 })
}

/**
 * Specialist navigates to their project via the dashboard "Trabalhos em Execução" section,
 * starts the milestone, and submits the delivery.
 *
 * After bid.accepted the RabbitMQ event propagates asynchronously (project → IN_PROGRESS).
 * We reload the dashboard until the project card appears (up to ~25 s).
 */
async function specialistSubmitDelivery(
  page: Parameters<typeof registerAndLogin>[0],
  title: string,
  repo: string,
  notes: string,
) {
  await page.getByRole('button', { name: /ESPECIALISTA/i }).first().click()
  await page.waitForURL(/\/dashboard/, { timeout: 5_000 })
  await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

  for (let attempt = 0; attempt < 6; attempt++) {
    if (await page.locator('h3').filter({ hasText: title }).isVisible()) break
    await page.waitForTimeout(4000)
    await page.reload({ waitUntil: 'networkidle' })
  }
  await expect(page.locator('h3').filter({ hasText: title })).toBeVisible({ timeout: 5_000 })

  const card = page.locator('h3').filter({ hasText: title }).locator('..')
  await card.getByRole('button', { name: /ABRIR_KANBAN/i }).click()
  await expect(page).toHaveURL(/\/kanban\//, { timeout: 5_000 })
  await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

  // Start milestone
  const startBtn = page.getByRole('button', { name: /INICIAR TRABALHO/i })
  await expect(startBtn).toBeVisible({ timeout: 5_000 })
  await startBtn.click()

  // Submit delivery
  await expect(page.getByRole('button', { name: /SUBMETER ENTREGA/i })).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: /SUBMETER ENTREGA/i }).click()
  await expect(page.getByRole('heading', { name: 'Submeter Entrega' })).toBeVisible({ timeout: 3_000 })
  await page.locator('input[placeholder*="github.com"]').first().fill(repo)
  await page.locator('textarea[placeholder*="Descreva"]').first().fill(notes)
  await page.getByRole('button', { name: /DEPLOY_SUBMIT/i }).click()
  await expect(page.getByRole('heading', { name: 'Submeter Entrega' })).not.toBeVisible({ timeout: 10_000 })
}

// ─────────────────────────────────────────────────────────────────────────────
// Cenário 1: Fluxo Feliz Completo
// ─────────────────────────────────────────────────────────────────────────────

test.describe.serial('Jornada Completa — Fluxo Feliz', () => {
  const ts = Date.now()
  const PROJECT_TITLE = `Sistema de Gestão E2E ${ts}`

  const company = {
    name: `Happy Corp ${ts}`,
    email: `happy-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
  }
  const specialist = {
    name: `Happy Dev ${ts}`,
    email: `happy-dev-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'SPECIALIST' as const,
  }

  test('1. Empresa cria projeto via wizard de UI', async ({ page }) => {
    await registerAndLogin(page, company)
    await createProjectViaWizard(page, {
      title: PROJECT_TITLE,
      description: 'Plataforma de gestão com NestJS e PostgreSQL.',
      skill: 'NestJS',
      milestoneTitle: 'MVP',
      milestoneAmount: '8000',
      milestoneDesc: 'Entrega do MVP funcional.',
      deadline: '2027-12-31',
    })
    await expect(page.locator(`h3:has-text("${PROJECT_TITLE}")`)).toBeVisible({ timeout: 10_000 })
  })

  test('2. Especialista busca projeto via /projects/browse e submete proposta', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await findAndBid(page, PROJECT_TITLE, {
      proposal: 'Sólida experiência com NestJS — 4 projetos similares entregues com sucesso.',
      duration: '45',
    })
  })

  test('3. Empresa aceita proposta via dashboard e é redirecionada ao kanban (RN03)', async ({ page }) => {
    await registerAndLogin(page, company)
    await companyAcceptBid(page, PROJECT_TITLE)
    await expect(page.getByText(PROJECT_TITLE).first()).toBeVisible({ timeout: 5_000 })
  })

  test('4. Especialista encontra projeto no dashboard, inicia milestone e submete entrega', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await specialistSubmitDelivery(
      page,
      PROJECT_TITLE,
      'https://github.com/happy-dev/e2e-entrega',
      'MVP concluído conforme especificação.',
    )
    await expect(page.getByRole('button', { name: /SUBMETER ENTREGA/i })).not.toBeVisible({ timeout: 5_000 })
  })

  test('5. Empresa aprova milestone via dashboard → PAGO E FINALIZADO', async ({ page }) => {
    await registerAndLogin(page, company)
    await openProjectAction(page, PROJECT_TITLE, /ABRIR_KANBAN/i)
    await expect(page).toHaveURL(/\/kanban\//, { timeout: 5_000 })
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    const approveBtn = page.getByRole('button', { name: /APROVAR/i }).first()
    await expect(approveBtn).toBeVisible({ timeout: 5_000 })
    await approveBtn.click()

    await expect(page.getByText('Aprovar Milestone')).toBeVisible({ timeout: 3_000 })
    await expect(page.getByText(/Ação Irreversível/i)).toBeVisible()
    await page.getByTestId('ms-approve-confirm').click()

    await expect(page.getByText('Aprovar Milestone')).not.toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('PAGO E FINALIZADO')).toBeVisible({ timeout: 10_000 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Cenário 2: Milestone Rejeitada e Corrigida (RN04 retry)
// ─────────────────────────────────────────────────────────────────────────────

test.describe.serial('Jornada — Milestone Rejeitada e Corrigida', () => {
  const ts = Date.now()
  const PROJECT_TITLE = `Projeto Rejeição E2E ${ts}`

  const company = {
    name: `Reject Corp ${ts}`,
    email: `reject-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
    companyName: `Reject Corp Ltda ${ts}`,
  }
  const specialist = {
    name: `Reject Dev ${ts}`,
    email: `reject-dev-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'SPECIALIST' as const,
  }

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    const regRes = await page.request.post(`${API_URL}/auth/register`, { data: company })
    if (!regRes.ok()) throw new Error(`Registro empresa falhou: ${await regRes.text()}`)

    const companyToken = await loginWithRetry(page, company.email, company.password)

    const projRes = await page.request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: {
        title: PROJECT_TITLE,
        description: 'Teste de fluxo com rejeição e correção de milestone.',
        requirements: ['React'],
        budget: 10000,
        deadline: '2027-12-31',
      },
    })
    if (!projRes.ok()) throw new Error(`Criar projeto falhou: ${await projRes.text()}`)
    const projectId = (await projRes.json()).id

    const msRes = await page.request.post(`${API_URL}/projects/${projectId}/milestones`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: { title: 'Entrega Principal', description: 'A ser revisada e corrigida.', amount: 10000 },
    })
    if (!msRes.ok()) throw new Error(`Criar milestone falhou: ${await msRes.text()}`)

    const specRegRes = await page.request.post(`${API_URL}/auth/register`, { data: specialist })
    if (!specRegRes.ok()) throw new Error(`Registro especialista falhou: ${await specRegRes.text()}`)

    const specialistToken = await loginWithRetry(page, specialist.email, specialist.password)

    const bidRes = await page.request.post(`${API_URL}/bids/project/${projectId}`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: { proposal: 'Proposta para rejeição E2E.', proposedBudget: 9000, estimatedDuration: 30 },
    })
    if (!bidRes.ok()) throw new Error(`Submeter proposta falhou: ${await bidRes.text()}`)
    const bidId = (await bidRes.json()).id

    const acceptRes = await page.request.put(`${API_URL}/bids/${bidId}/accept`, {
      headers: { Authorization: `Bearer ${companyToken}` },
    })
    if (!acceptRes.ok()) throw new Error(`Aceitar proposta falhou: ${await acceptRes.text()}`)

    await ctx.close()
  })

  test('1. Especialista encontra projeto no dashboard, inicia e submete primeira entrega', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await specialistSubmitDelivery(
      page,
      PROJECT_TITLE,
      'https://github.com/reject-dev/primeira-entrega',
      'Primeira tentativa — aguardando revisão.',
    )
  })

  test('2. Empresa rejeita entrega via kanban com motivo', async ({ page }) => {
    await registerAndLogin(page, company)
    await openProjectAction(page, PROJECT_TITLE, /ABRIR_KANBAN/i)
    await expect(page).toHaveURL(/\/kanban\//, { timeout: 5_000 })
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    const rejectBtn = page.getByRole('button', { name: /REJEITAR/i }).first()
    await expect(rejectBtn).toBeVisible({ timeout: 5_000 })
    await rejectBtn.click()

    await expect(page.getByRole('heading', { name: 'Rejeitar Entrega' })).toBeVisible({ timeout: 3_000 })
    await page.getByTestId('ms-reject-reason').fill('Funcionalidade X não implementada conforme especificado.')
    await page.getByTestId('ms-reject-confirm').click()

    await expect(page.getByRole('heading', { name: 'Rejeitar Entrega' })).not.toBeVisible({ timeout: 10_000 })
  })

  test('3. Especialista volta ao dashboard, corrige e submete nova entrega', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await page.getByRole('button', { name: /ESPECIALISTA/i }).first().click()
    await page.waitForURL(/\/dashboard/, { timeout: 5_000 })
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Project still IN_PROGRESS — should appear in "Trabalhos em Execução"
    await expect(page.locator('h3').filter({ hasText: PROJECT_TITLE })).toBeVisible({ timeout: 10_000 })
    const card = page.locator('h3').filter({ hasText: PROJECT_TITLE }).locator('..')
    await card.getByRole('button', { name: /ABRIR_KANBAN/i }).click()
    await expect(page).toHaveURL(/\/kanban\//, { timeout: 5_000 })
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Milestone back to IN_PROGRESS after rejection
    await expect(page.getByRole('button', { name: /SUBMETER ENTREGA/i })).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: /SUBMETER ENTREGA/i }).click()

    await expect(page.getByRole('heading', { name: 'Submeter Entrega' })).toBeVisible({ timeout: 3_000 })
    await page.locator('input[placeholder*="github.com"]').first().fill('https://github.com/reject-dev/correcao-v2')
    await page.locator('textarea[placeholder*="Descreva"]').first().fill('Funcionalidade X implementada conforme solicitado na rejeição.')
    await page.getByRole('button', { name: /DEPLOY_SUBMIT/i }).click()
    await expect(page.getByRole('heading', { name: 'Submeter Entrega' })).not.toBeVisible({ timeout: 10_000 })
  })

  test('4. Empresa aprova entrega corrigida via dashboard → PAGO E FINALIZADO', async ({ page }) => {
    await registerAndLogin(page, company)
    await openProjectAction(page, PROJECT_TITLE, /ABRIR_KANBAN/i)
    await expect(page).toHaveURL(/\/kanban\//, { timeout: 5_000 })
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    const approveBtn = page.getByRole('button', { name: /APROVAR/i }).first()
    await expect(approveBtn).toBeVisible({ timeout: 5_000 })
    await approveBtn.click()

    await expect(page.getByText('Aprovar Milestone')).toBeVisible({ timeout: 3_000 })
    await page.getByTestId('ms-approve-confirm').click()

    await expect(page.getByText('Aprovar Milestone')).not.toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('PAGO E FINALIZADO')).toBeVisible({ timeout: 10_000 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Cenário 3: Empresa Cancela Projeto OPEN via Dashboard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Jornada — Empresa Cancela Projeto OPEN', () => {
  const ts = Date.now()
  const PROJECT_TITLE = `Projeto Cancelado E2E ${ts}`

  const company = {
    name: `Cancel Corp ${ts}`,
    email: `cancel-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
  }
  const specialist = {
    name: `Cancel Dev ${ts}`,
    email: `cancel-dev-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'SPECIALIST' as const,
  }

  test('empresa cria projeto via wizard, cancela via dashboard, projeto some da lista ativa', async ({ page }) => {
    await registerAndLogin(page, company)

    await createProjectViaWizard(page, {
      title: PROJECT_TITLE,
      description: 'Projeto que será cancelado para teste.',
      skill: 'Vue.js',
      milestoneTitle: 'Setup',
      milestoneAmount: '3000',
      milestoneDesc: 'Configuração inicial.',
      deadline: '2027-06-30',
    })

    await expect(page.locator(`h3:has-text("${PROJECT_TITLE}")`)).toBeVisible({ timeout: 10_000 })

    // Click the cancel (trash icon) button on this project's card
    const card = page.locator('h3').filter({ hasText: PROJECT_TITLE }).locator('..')
    await card.getByTitle('Cancelar projeto').click()

    // Confirmation modal — use heading role to avoid strict mode (modal h2 + confirm button both say "Cancelar Projeto")
    await expect(page.getByRole('heading', { name: 'Cancelar Projeto' })).toBeVisible({ timeout: 3_000 })
    await expect(page.getByText(`"${PROJECT_TITLE}"`)).toBeVisible()
    // Exact match: confirm button = "Cancelar Projeto" (capital P), trash icon title = "Cancelar projeto" (lowercase p)
    await page.getByRole('button', { name: 'Cancelar Projeto', exact: true }).click()

    // Modal closes — project removed from active list (filter=ALL hides CANCELLED)
    await expect(page.getByRole('heading', { name: 'Cancelar Projeto' })).not.toBeVisible({ timeout: 10_000 })
    await expect(page.locator(`h3:has-text("${PROJECT_TITLE}")`)).not.toBeVisible({ timeout: 5_000 })
  })

  test('especialista não vê projeto cancelado em /projects/browse', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await page.getByRole('button', { name: /PROJETOS/i }).first().click()
    await page.waitForURL(/\/projects\/browse/, { timeout: 5_000 })
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await page.locator('input[placeholder*="BUSCAR POR TÍTULO"]').fill(PROJECT_TITLE)

    await page.waitForTimeout(500)
    await expect(page.getByText(PROJECT_TITLE)).not.toBeVisible({ timeout: 5_000 })
  })
})
