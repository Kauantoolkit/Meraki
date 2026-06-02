import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Dashboard Empresa', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'company')
  })

  test('renders company dashboard with navbar and title', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('text=Meus Projetos')).toBeVisible()
    await expect(page.getByRole('button', { name: /deploy projeto/i })).toBeVisible()
  })

  test('shows stats cards', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('main')).toBeVisible()
  })

  test('new project button navigates to /projects/new', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /deploy projeto/i }).click()
    await expect(page).toHaveURL(/\/projects\/new/)
  })
})

test.describe('Dashboard Especialista', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'specialist')
  })

  test('renders specialist dashboard with title', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('text=Terminal do Especialista')).toBeVisible()
  })

  test('shows open opportunities section', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText(/Oportunidades/i)).toBeVisible()
  })
})
