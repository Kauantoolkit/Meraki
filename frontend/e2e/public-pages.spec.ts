import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('renders navbar with logo and auth buttons', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('text=Meraki').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /registar/i })).toBeVisible()
  })

  test('shows features grid', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Dashboard Empresa')).toBeVisible()
    await expect(page.locator('text=Kanban')).toBeVisible()
    await expect(page.locator('text=Bidding')).toBeVisible()
  })

  test('login button navigates to /login', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /login/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('register button navigates to /signup', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /registar/i }).click()
    await expect(page).toHaveURL(/\/signup/)
  })
})

test.describe('Login Page', () => {
  test('renders login form with email and password fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /inicializar/i })).toBeVisible()
  })

  test('has company/specialist tabs', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /empresa/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /especialista/i })).toBeVisible()
  })

  test('switching tabs changes placeholder', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.locator('input[type="email"]')

    await page.getByRole('button', { name: /empresa/i }).click()
    await expect(emailInput).toHaveAttribute('placeholder', /empresa/i)

    await page.getByRole('button', { name: /especialista/i }).click()
    await expect(emailInput).toHaveAttribute('placeholder', /especialista/i)
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('fake@test.com')
    await page.locator('input[type="password"]').fill('wrongpass')
    await page.getByRole('button', { name: /inicializar/i }).click()
    await expect(page.locator('text=Credenciais inválidas')).toBeVisible({ timeout: 5000 })
  })

  test('has link to password recovery', async ({ page }) => {
    await page.goto('/login')
    await page.locator('text=Esqueceu').click()
    await expect(page).toHaveURL(/\/password-recovery/)
  })
})

test.describe('Signup Page', () => {
  test('renders registration form', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('input[type="text"]').first()).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('has company/specialist type selector', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('button', { name: /empresa/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /especialista/i })).toBeVisible()
  })

  test('switching type changes name label', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('button', { name: /empresa/i }).click()
    await expect(page.locator('text=Nome da Empresa')).toBeVisible()

    await page.getByRole('button', { name: /especialista/i }).click()
    await expect(page.locator('text=Nome / Handle')).toBeVisible()
  })
})

test.describe('Protected Routes Redirect', () => {
  test('dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('kanban redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/kanban')
    await expect(page).toHaveURL(/\/login/)
  })

  test('financial redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/financial')
    await expect(page).toHaveURL(/\/login/)
  })
})
