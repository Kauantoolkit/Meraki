import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'
import { getCompanyUser, getSpecialistUser } from './helpers/api'

test.describe('Perfil Publico (RF12/RF13)', () => {
  test.setTimeout(120_000)
  test('renders specialist profile page', async ({ page }) => {
    const specialist = await getSpecialistUser()
    const specialistId = specialist.user.specialistId
    await loginAs(page, 'company')
    await page.goto(`/profile/specialist/${specialistId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  })

  test('renders company profile page', async ({ page }) => {
    const company = await getCompanyUser()
    const companyId = company.user.companyId
    await loginAs(page, 'company')
    await page.goto(`/profile/company/${companyId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 40_000 })
  })
})
