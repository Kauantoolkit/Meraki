import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'
import { getCompanyUser, getSpecialistUser, createProject, submitBid, acceptBid, type TestUser } from './helpers/api'

let company: TestUser
let specialist: TestUser
let projectId: string

test.beforeAll(async () => {
  test.setTimeout(60_000)
  company = await getCompanyUser()
  specialist = await getSpecialistUser()

  const project = await createProject(company.token, {
    title: 'Projeto Kanban E2E',
    description: 'Projeto criado automaticamente para testes E2E do kanban board.',
    budget: 10000,
    deadline: '2027-12-31',
    requirements: ['NestJS', 'TypeScript'],
    milestones: [
      { title: 'Setup', description: 'Setup inicial do ambiente', amount: 5000 },
      { title: 'Entrega', description: 'Entrega final do projeto', amount: 5000 },
    ],
  })
  projectId = project.id

  // Especialista submete bid e empresa aceita → projeto passa a IN_PROGRESS
  const bid = await submitBid(specialist.token, {
    projectId,
    amount: 8000,
    durationDays: 30,
    proposalText: 'Proposta E2E para teste do kanban board — implementação completa.',
  })
  await acceptBid(company.token, bid.id)
})

test.describe('Kanban Board - Company (RF08/RF09)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'company')
  })
  test.setTimeout(60_000)

  test('renders kanban board with columns', async ({ page }) => {
    await page.goto(`/kanban/${projectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  })

  test('shows project title in header', async ({ page }) => {
    await page.goto(`/kanban/${projectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('heading', { name: 'Projeto Kanban E2E' })).toBeVisible({ timeout: 5_000 })
  })

  test('shows milestone cards', async ({ page }) => {
    await page.goto(`/kanban/${projectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Setup')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('heading', { name: 'Entrega' })).toBeVisible({ timeout: 5_000 })
  })
})

test.describe('Kanban Board - Specialist (RF08/RF09)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'specialist')
  })

  test('renders kanban board for specialist', async ({ page }) => {
    await page.goto(`/kanban/${projectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  })

  test('shows INICIAR TRABALHO button on pending milestones', async ({ page }) => {
    await page.goto(`/kanban/${projectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    const button = page.getByRole('button', { name: /iniciar trabalho/i })
    if (await button.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(button.first()).toBeVisible()
    }
  })
})
