import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

const mockSpecialistProfile = {
  id: 'test-id',
  userId: 'u1',
  name: 'Dev Alpha',
  type: 'specialist',
  bio: 'NestJS expert',
  skills: ['NestJS', 'Docker'],
  rating: 4.8,
  completedProjects: 12,
}

const mockCompanyProfile = {
  id: 'test-id',
  name: 'Empresa Alpha',
  type: 'company',
  description: 'Startup de tecnologia',
  sector: 'Tecnologia',
}

test.describe('Perfil Publico (RF12/RF13)', () => {
  test('renders specialist profile page', async ({ page }) => {
    await loginAs(page, 'company')
    // Register AFTER loginAs so they take priority
    await page.route('**/api/portfolio/specialist/test-id', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSpecialistProfile) })
    })
    await page.goto('/profile/specialist/test-id')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  })

  test('renders company profile page', async ({ page }) => {
    await loginAs(page, 'company')
    await page.route('**/api/companies/test-id', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCompanyProfile) })
    })
    await page.route('**/api/users/test-id', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCompanyProfile) })
    })
    await page.goto('/profile/company/test-id')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  })
})
