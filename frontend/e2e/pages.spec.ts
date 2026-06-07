import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Create Project (Company)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'company')
  })

  test('renders create project form', async ({ page }) => {
    await page.goto('/projects/new')
    await expect(page.locator('input').first()).toBeVisible()
  })
})

test.describe('Kanban Page', () => {
  test('renders kanban for company user', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/kanban')
    await expect(page.locator('main')).toBeVisible()
  })

  test('renders kanban for specialist user', async ({ page }) => {
    await loginAs(page, 'specialist')
    await page.goto('/kanban')
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Financeiro (Company)', () => {
  test('renders financial page', async ({ page }) => {
    await loginAs(page, 'company')
    await page.getByRole('link', { name: /FINANCEIRO/i }).first().click()
    await page.waitForURL(/\/financial/, { timeout: 5_000 })
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Ganhos (Specialist)', () => {
  test('renders earnings page', async ({ page }) => {
    await loginAs(page, 'specialist')
    await page.getByRole('link', { name: /GANHOS/i }).first().click()
    await page.waitForURL(/\/earnings/, { timeout: 5_000 })
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Portfolio (Specialist)', () => {
  test('renders portfolio page', async ({ page }) => {
    await loginAs(page, 'specialist')
    await page.getByRole('link', { name: /PORTFÓLIO/i }).first().click()
    await page.waitForURL(/\/portfolio/, { timeout: 5_000 })
    await expect(page.locator('main')).toBeVisible()
  })
})
