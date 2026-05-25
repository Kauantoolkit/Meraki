import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'
import {
  getCompanyUser,
  getCompany2User,
  getSpecialistUser,
  getSpecialist2User,
  createProject,
  submitBid,
  type TestUser,
} from './helpers/api'

let company: TestUser
let company2: TestUser
let specialist: TestUser
let specialist2: TestUser

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

test.beforeAll(async () => {
  test.setTimeout(90_000)
  company    = await getCompanyUser()
  await sleep(2000)
  company2   = await getCompany2User()
  await sleep(2000)
  specialist  = await getSpecialistUser()
  await sleep(2000)
  specialist2 = await getSpecialist2User()
}, 90_000)

// ─── helpers ─────────────────────────────────────────────────────────────────

async function makeProject(token: string, title: string) {
  return createProject(token, {
    title,
    description: 'Projeto criado para testes E2E de avaliação de propostas.',
    budget: 10000,
    deadline: '2027-12-31',
    requirements: ['NestJS', 'TypeScript'],
  })
}

const PROPOSAL = (n: number) =>
  `Proposta número ${n} para o projeto — especialista com vasta experiência.`

// ─── Testes ──────────────────────────────────────────────────────────────────

test.describe('Avaliar Propostas — listagem (RF06)', () => {
  test('AP01 - empresa vê lista de propostas com dados reais do backend', async ({ page }) => {
    const proj = await makeProject(company.token, 'Projeto AP01 Listagem')
    await submitBid(specialist.token, {
      projectId: proj.id, amount: 7000, durationDays: 30, proposalText: PROPOSAL(1),
    })
    await submitBid(specialist2.token, {
      projectId: proj.id, amount: 8500, durationDays: 25, proposalText: PROPOSAL(2),
    })

    await loginAs(page, 'company')
    await page.goto(`/projects/${proj.id}/bids`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Título do projeto carregado do backend
    await expect(page.getByText('Projeto AP01 Listagem')).toBeVisible({ timeout: 5_000 })

    // Contagem de propostas pendentes na barra de stats
    await expect(page.getByText('2 pendentes')).toBeVisible({ timeout: 5_000 })

    // Botões de ação presentes para propostas PENDING
    await expect(page.getByRole('button', { name: /ACEITAR_BID/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /REJEITAR/i }).first()).toBeVisible()
  })

  test('AP02 - projeto sem propostas mostra estado vazio', async ({ page }) => {
    const proj = await makeProject(company.token, 'Projeto AP02 Sem Propostas')

    await loginAs(page, 'company')
    await page.goto(`/projects/${proj.id}/bids`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await expect(page.getByText(/Nenhuma proposta recebida/i)).toBeVisible({ timeout: 5_000 })
  })

  test('AP03 - texto da proposta expande e recolhe ao clicar', async ({ page }) => {
    const proj = await makeProject(company.token, 'Projeto AP03 Expand')
    await submitBid(specialist.token, {
      projectId: proj.id, amount: 5000, durationDays: 20,
      proposalText: 'Texto único para teste de expand recolhe proposta aqui.',
    })

    await loginAs(page, 'company')
    await page.goto(`/projects/${proj.id}/bids`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // O parágrafo .whitespace-pre-wrap só existe quando isExpanded === true
    const expandedParagraph = page.locator('.whitespace-pre-wrap').first()

    // Inicialmente recolhido — parágrafo expandido não existe
    await expect(expandedParagraph).not.toBeVisible()

    // Clica para expandir
    await page.getByText('Texto da Proposta').first().click()
    await expect(expandedParagraph).toBeVisible({ timeout: 5_000 })

    // Clica para recolher
    await page.getByText('Texto da Proposta').first().click()
    await expect(expandedParagraph).not.toBeVisible()
  })
})

test.describe('Avaliar Propostas — rejeição manual (RF07)', () => {
  test('AP04 - empresa rejeita proposta via modal e bid mostra REJEITADO', async ({ page }) => {
    const proj = await makeProject(company.token, 'Projeto AP04 Rejeitar')
    await submitBid(specialist.token, {
      projectId: proj.id, amount: 6000, durationDays: 30, proposalText: PROPOSAL(4),
    })

    await loginAs(page, 'company')
    await page.goto(`/projects/${proj.id}/bids`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Clica em Rejeitar → modal aparece
    await page.getByRole('button', { name: /REJEITAR/i }).first().click()
    await expect(page.getByText('Confirmar Rejeição')).toBeVisible({ timeout: 5_000 })

    // Confirma no modal
    await page.getByRole('button', { name: /CONFIRMAR_REJEIÇÃO/i }).click()

    // Bid recarregada do backend mostra status REJECTED
    await expect(page.getByText('REJEITADO', { exact: true })).toBeVisible({ timeout: 10_000 })

    // Botões de ação somem da bid rejeitada
    await expect(page.getByRole('button', { name: /REJEITAR/i })).not.toBeVisible()
    await expect(page.getByRole('button', { name: /ACEITAR_BID/i })).not.toBeVisible()
  })

  test('AP05 - cancelar modal de rejeição mantém bid PENDING', async ({ page }) => {
    const proj = await makeProject(company.token, 'Projeto AP05 Cancelar Modal')
    await submitBid(specialist.token, {
      projectId: proj.id, amount: 4000, durationDays: 15, proposalText: PROPOSAL(5),
    })

    await loginAs(page, 'company')
    await page.goto(`/projects/${proj.id}/bids`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: /REJEITAR/i }).first().click()
    await expect(page.getByText('Confirmar Rejeição')).toBeVisible({ timeout: 5_000 })

    // Cancela
    await page.getByRole('button', { name: /CANCELAR/i }).click()

    // Bid continua AGUARDANDO
    await expect(page.getByText('AGUARDANDO')).toBeVisible()
    await expect(page.getByText('Confirmar Rejeição')).not.toBeVisible()
  })
})

test.describe('Avaliar Propostas — aceitação e RN03 (RF06, RN03)', () => {
  test('AP06 - empresa aceita proposta via modal e é redirecionada ao kanban', async ({ page }) => {
    const proj = await makeProject(company.token, 'Projeto AP06 Aceitar')
    await submitBid(specialist.token, {
      projectId: proj.id, amount: 9000, durationDays: 45, proposalText: PROPOSAL(6),
    })

    await loginAs(page, 'company')
    await page.goto(`/projects/${proj.id}/bids`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Clica em Aceitar → modal aparece com aviso RN03
    await page.getByRole('button', { name: /ACEITAR_BID/i }).first().click()
    await expect(page.getByText(/Ação Irreversível/i).first()).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText(/Ação Irreversível \(RN03\)/i)).toBeVisible()

    // Confirma
    await page.getByRole('button', { name: /CONFIRMAR_ACEITE/i }).click()

    // Redireciona para o kanban após 1200ms
    await expect(page).toHaveURL(new RegExp(`/kanban/${proj.id}`), { timeout: 10_000 })
  })

  test('AP07 - RN03: aceitar uma bid rejeita automaticamente as demais (backend + UI)', async ({ page }) => {
    const proj = await makeProject(company.token, 'Projeto AP07 RN03')
    await submitBid(specialist.token, {
      projectId: proj.id, amount: 7000, durationDays: 30, proposalText: PROPOSAL(7),
    })
    await submitBid(specialist2.token, {
      projectId: proj.id, amount: 8000, durationDays: 35, proposalText: PROPOSAL(7),
    })

    await loginAs(page, 'company')
    await page.goto(`/projects/${proj.id}/bids`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Aceita a primeira bid
    await page.getByRole('button', { name: /ACEITAR_BID/i }).first().click()
    await expect(page.getByText(/Ação Irreversível/i)).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: /CONFIRMAR_ACEITE/i }).click()

    // Aguarda redirect e volta para a página de bids
    await expect(page).toHaveURL(new RegExp(`/kanban/${proj.id}`), { timeout: 10_000 })
    await page.goto(`/projects/${proj.id}/bids`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Uma bid ACEITE + banner de especialista selecionado
    await expect(page.getByText('ESPECIALISTA SELECIONADO')).toBeVisible({ timeout: 5_000 })

    // A outra bid foi rejeitada automaticamente pelo backend (RN03)
    await expect(page.getByText('REJEITADO', { exact: true })).toBeVisible({ timeout: 5_000 })

    // Não há mais botões de ação
    await expect(page.getByRole('button', { name: /ACEITAR_BID/i })).not.toBeVisible()
    await expect(page.getByRole('button', { name: /REJEITAR/i })).not.toBeVisible()
  })

  test('AP08 - após aceite, mensagem "já foi selecionado" bloqueia demais ações', async ({ page }) => {
    const proj = await makeProject(company.token, 'Projeto AP08 Bloqueio')
    // Duas bids para testar o bloqueio
    await submitBid(specialist.token, {
      projectId: proj.id, amount: 5000, durationDays: 20, proposalText: PROPOSAL(8),
    })
    await submitBid(specialist2.token, {
      projectId: proj.id, amount: 6000, durationDays: 25, proposalText: PROPOSAL(8),
    })

    await loginAs(page, 'company')
    await page.goto(`/projects/${proj.id}/bids`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Aceita primeira bid
    await page.getByRole('button', { name: /ACEITAR_BID/i }).first().click()
    await page.getByRole('button', { name: /CONFIRMAR_ACEITE/i }).click()
    await expect(page).toHaveURL(new RegExp(`/kanban/${proj.id}`), { timeout: 10_000 })

    // Volta para a página — a bid pendente restante (se existir) mostra "já selecionado"
    await page.goto(`/projects/${proj.id}/bids`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('ESPECIALISTA SELECIONADO')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('button', { name: /ACEITAR_BID/i })).not.toBeVisible()
  })
})

test.describe('Avaliar Propostas — controlo de acesso (Segurança)', () => {
  test('AP09 - empresa diferente é redirecionada ao tentar ver propostas de projeto alheio', async ({ page }) => {
    const proj = await makeProject(company.token, 'Projeto AP09 Acesso Alheio')
    await submitBid(specialist.token, {
      projectId: proj.id, amount: 5000, durationDays: 30, proposalText: PROPOSAL(9),
    })

    // Company2 (dona de outro projeto) tenta ver as bids de company
    await loginAs(page, 'company2')
    await page.goto(`/projects/${proj.id}/bids`)

    // Deve ser redirecionada para o dashboard, nunca carrega a página de propostas
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 })
  })

  test('AP10 - especialista é redirecionado ao tentar aceder /projects/:id/bids', async ({ page }) => {
    const proj = await makeProject(company.token, 'Projeto AP10 Acesso Especialista')

    await loginAs(page, 'specialist')
    await page.goto(`/projects/${proj.id}/bids`)

    // Especialista não tem papel COMPANY — deve ser redirecionado
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 })
  })
})
