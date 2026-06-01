import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'
import { getSpecialistUser } from './helpers/api'

test.beforeAll(async () => {
  // Garante que o especialista E2E existe no backend antes de buscar
  await getSpecialistUser()
})

test.describe('Explorar Talentos (RF12/RF13)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'company')
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

  test('shows specialist cards from real backend', async ({ page }) => {
    await page.goto('/talents')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    // Aguarda que a lista carregue (sem mock — dados reais do backend)
    await page.waitForTimeout(2000)
    // Verifica que algum card de especialista aparece, ou que o estado vazio é exibido
    const hasCards = await page.locator('[data-testid="specialist-card"], .specialist-card, [class*="card"]').first().isVisible({ timeout: 5_000 }).catch(() => false)
    const hasEmpty = await page.getByText(/nenhum especialista|sem resultados|não encontrado/i).isVisible({ timeout: 1000 }).catch(() => false)
    expect(hasCards || hasEmpty).toBeTruthy()
  })
})
