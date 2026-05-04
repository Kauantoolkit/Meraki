import { test, expect } from '@playwright/test'

const API_URL = 'http://localhost:3000/api'
const ts = Date.now()

test.describe('UC: Cadastro e Login (RF01/RF02)', () => {
  const companyEmail = `e2e-company-${ts}@test.com`
  const specialistEmail = `e2e-spec-${ts}@test.com`
  const password = 'Test1234!'

  test('company can register and land on dashboard empresa', async ({ page }) => {
    await page.goto('/signup')

    // Select company type
    await page.getByRole('button', { name: /empresa/i }).first().click()

    // Fill form
    await page.locator('input[type="text"]').first().fill('E2E Corp')
    await page.locator('input[type="email"]').fill(companyEmail)
    await page.locator('input[type="password"]').fill(password)

    // Submit
    await page.getByRole('button', { name: /criar conta/i }).click()

    // Should land on company dashboard
    await expect(page.locator('text=Meus Projetos')).toBeVisible({ timeout: 15_000 })
  })

  test('company can logout and login again', async ({ page }) => {
    // First register via API
    await page.request.post(`${API_URL}/auth/register`, {
      data: { name: 'Login Corp', email: `login-corp-${ts}@test.com`, password, userType: 'COMPANY', companyName: 'Login Corp' },
    })

    await page.goto('/login')
    await page.getByRole('button', { name: /empresa/i }).first().click()
    await page.locator('input[type="email"]').fill(`login-corp-${ts}@test.com`)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { name: /inicializar/i }).click()

    await expect(page.locator('text=Meus Projetos')).toBeVisible({ timeout: 15_000 })
  })

  test('specialist can register and land on dashboard especialista', async ({ page }) => {
    await page.goto('/signup')

    // Select specialist type
    await page.getByRole('button', { name: /especialista/i }).first().click()

    // Fill form
    await page.locator('input[type="text"]').first().fill('E2E Dev')
    await page.locator('input[type="email"]').fill(specialistEmail)
    await page.locator('input[type="password"]').fill(password)

    // Submit
    await page.getByRole('button', { name: /criar conta/i }).click()

    // Should land on specialist dashboard
    await expect(page.locator('text=Terminal do Especialista')).toBeVisible({ timeout: 15_000 })
  })

  test('login with wrong credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('nonexistent@test.com')
    await page.locator('input[type="password"]').fill('WrongPass123!')
    await page.getByRole('button', { name: /inicializar/i }).click()

    await expect(page.locator('text=Credenciais inválidas')).toBeVisible({ timeout: 5000 })
  })
})
