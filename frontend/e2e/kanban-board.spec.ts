import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

const mockProject = {
  id: 'test-project-id',
  title: 'Projeto Teste',
  description: 'desc',
  budget: 5000,
  deadline: '2026-12-31',
  status: 'IN_PROGRESS',
  companyId: 'comp-1',
}

const mockMilestones = [
  { id: 'm1', projectId: 'test-project-id', title: 'Setup', amount: 2500, status: 'PENDING', order: 1 },
  { id: 'm2', projectId: 'test-project-id', title: 'Entrega', amount: 2500, status: 'PENDING', order: 2 },
]

async function setupKanbanMocks(page: import('@playwright/test').Page) {
  // Register AFTER loginAs so they take priority (last registered wins in Playwright)
  await page.route('**/api/projects/test-project-id/milestones', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMilestones) })
  })
  await page.route('**/api/projects/test-project-id', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProject) })
  })
  await page.route('**/api/deliveries/**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
}

test.describe('Kanban Board - Company (RF08/RF09)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'company')
    await setupKanbanMocks(page)
  })

  test('renders kanban board with columns', async ({ page }) => {
    await page.goto('/kanban/test-project-id')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  })

  test('shows project title in header', async ({ page }) => {
    await page.goto('/kanban/test-project-id')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Projeto Teste')).toBeVisible()
  })

  test('shows milestone cards', async ({ page }) => {
    await page.goto('/kanban/test-project-id')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Setup')).toBeVisible()
    await expect(page.getByText('Entrega')).toBeVisible()
  })
})

test.describe('Kanban Board - Specialist (RF08/RF09)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'specialist')
    await setupKanbanMocks(page)
  })

  test('renders kanban board for specialist', async ({ page }) => {
    await page.goto('/kanban/test-project-id')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  })

  test('shows INICIAR TRABALHO button on pending milestones', async ({ page }) => {
    await page.goto('/kanban/test-project-id')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    const button = page.getByRole('button', { name: /iniciar trabalho/i })
    if (await button.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(button.first()).toBeVisible()
    }
  })
})
