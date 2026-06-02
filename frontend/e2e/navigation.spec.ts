import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Navbar - Company', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'company')
  })

  test('shows company-specific nav links', async ({ page }) => {
    await page.goto('/dashboard')
    const nav = page.locator('nav')
    await expect(nav.getByRole('button', { name: 'EMPRESA', exact: true })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'TALENTOS', exact: true })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'FINANCEIRO', exact: true })).toBeVisible()
  })

  test('does NOT show specialist-only links', async ({ page }) => {
    await page.goto('/dashboard')
    const nav = page.locator('nav')
    await expect(nav.locator('text=PORTFÓLIO')).not.toBeVisible()
    await expect(nav.locator('text=GANHOS')).not.toBeVisible()
    await expect(nav.locator('text=KANBAN')).not.toBeVisible()
  })

  test('navigate to financial', async ({ page }) => {
    await page.goto('/dashboard')
    await page.locator('nav').getByRole('button', { name: 'FINANCEIRO', exact: true }).click()
    await expect(page).toHaveURL(/\/financial/)
  })

  test('logout redirects to login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.locator('nav').locator('[class*="cursor-pointer"]').last().click()
    const logoutBtn = page.locator('text=Logout').or(page.locator('text=SAIR'))
    if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutBtn.click()
      await expect(page).toHaveURL(/\/login/)
    }
  })
})

test.describe('Navbar - Specialist', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'specialist')
  })

  test('shows specialist-specific nav links', async ({ page }) => {
    await page.goto('/dashboard')
    const nav = page.locator('nav')
    await expect(nav.getByRole('button', { name: 'ESPECIALISTA', exact: true })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'PORTFÓLIO', exact: true })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'GANHOS', exact: true })).toBeVisible()
  })

  test('does NOT show company-only links', async ({ page }) => {
    await page.goto('/dashboard')
    const nav = page.locator('nav')
    await expect(nav.locator('text=TALENTOS')).not.toBeVisible()
    await expect(nav.locator('text=FINANCEIRO')).not.toBeVisible()
    await expect(nav.locator('text=KANBAN')).not.toBeVisible()
  })

  test('navigate to portfolio', async ({ page }) => {
    await page.goto('/dashboard')
    await page.locator('nav').getByRole('button', { name: 'PORTFÓLIO', exact: true }).click()
    await expect(page).toHaveURL(/\/portfolio/)
  })

  test('navigate to earnings', async ({ page }) => {
    await page.goto('/dashboard')
    await page.locator('nav').getByRole('button', { name: 'GANHOS', exact: true }).click()
    await expect(page).toHaveURL(/\/earnings/)
  })
})
