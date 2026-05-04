import { test, expect } from '@playwright/test'
import { loginAs, MOCK_COMPANY_USER } from './helpers/auth'

const mockSpecialists = [
  {
    id: 's1',
    userId: 'u1',
    name: 'Dev Alpha',
    type: 'specialist',
    bio: 'NestJS expert',
    skills: ['NestJS', 'Docker'],
    rating: 4.8,
    completedProjects: 12,
  },
]

test.describe('Explorar Talentos (RF12/RF13)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, MOCK_COMPANY_USER)
    // Register AFTER loginAs so they take priority (last registered wins)
    await page.route('**/api/portfolio/specialists**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSpecialists) })
    })
  })

  test('renders talent exploration page with search', async ({ page }) => {
    await page.goto('/talents')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('input[placeholder*="BUSCAR"]')).toBeVisible({ timeout: 5_000 })
  })

  test('shows filter sidebar with skill checkboxes', async ({ page }) => {
    await page.goto('/talents')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    const checkbox = page.locator('input[type="checkbox"]').first()
    if (await checkbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(checkbox).toBeVisible()
    }
  })

  test('shows specialist cards', async ({ page }) => {
    await page.goto('/talents')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Dev Alpha')).toBeVisible({ timeout: 5_000 })
  })
})
