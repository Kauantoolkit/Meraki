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
    await page.goto('/financial')
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Ganhos (Specialist)', () => {
  test('renders earnings page', async ({ page }) => {
    await loginAs(page, 'specialist')
    await page.goto('/earnings')
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Portfolio (Specialist)', () => {
  test('renders portfolio page', async ({ page }) => {
    await loginAs(page, 'specialist')
    await page.goto('/portfolio')
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Inbox', () => {
  test('renders inbox page', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/inbox')
    // Inbox uses div layout — verify chat UI renders via placeholder
    await expect(page.locator('input[placeholder*="Procurar contacto"]')).toBeVisible()
  })
})

test.describe('Eventos/Notificacoes', () => {
  test('renders events page', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/events')
    await expect(page.locator('main')).toBeVisible()
  })

  test('/notifications redirects to /events', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/notifications')
    await expect(page).toHaveURL(/\/events/)
  })
})

test.describe('Settings', () => {
  test('renders settings page', async ({ page }) => {
    await loginAs(page, 'company')
    await page.goto('/settings')
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Privacy', () => {
  test('renders privacy page without auth', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('body')).toBeVisible()
  })
})
