import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

const mockProject = {
  id: 'test-project-id',
  title: 'Projeto Teste',
  description: 'desc',
  budget: 5000,
  deadline: '2026-12-31',
  status: 'OPEN',
  companyId: 'comp-1',
}

const mockBids = [
  {
    id: 'bid-1',
    projectId: 'test-project-id',
    specialistId: 'spec-1',
    specialistName: 'Dev Alpha',
    amount: 4500,
    durationDays: 30,
    proposalText: 'Tenho experiência com NestJS',
    status: 'PENDING',
    createdAt: '2026-01-01',
  },
  {
    id: 'bid-2',
    projectId: 'test-project-id',
    specialistId: 'spec-2',
    specialistName: 'Dev Beta',
    amount: 4800,
    durationDays: 25,
    proposalText: 'Especialista em microserviços',
    status: 'PENDING',
    createdAt: '2026-01-02',
  },
]

test.describe('Avaliar Propostas (RF06/RF07)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'company')
    // Register specific mocks AFTER loginAs (last registered wins)
    await page.route('**/api/projects/test-project-id', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProject) })
    })
    await page.route('**/api/bids/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockBids) })
    })
  })

  test('renders evaluation page with bids header', async ({ page }) => {
    await page.goto('/projects/test-project-id/bids')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  })

  test('shows bid cards', async ({ page }) => {
    await page.goto('/projects/test-project-id/bids')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Dev Alpha')).toBeVisible()
    await expect(page.getByText('Dev Beta')).toBeVisible()
  })

  test('expand/collapse bid proposal text', async ({ page }) => {
    await page.goto('/projects/test-project-id/bids')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    // Proposal text may be visible directly or behind an expand toggle
    const hasProposalText = await page.getByText('Tenho experiência com NestJS').isVisible({ timeout: 3000 }).catch(() => false)
    if (!hasProposalText) {
      // Try clicking a chevron/expand button
      const chevron = page.locator('[class*="cursor-pointer"]').first()
      if (await chevron.isVisible({ timeout: 2000 }).catch(() => false)) {
        await chevron.click()
      }
    }
    await expect(page.getByText('Tenho experiência com NestJS')).toBeVisible({ timeout: 5000 })
  })
})
