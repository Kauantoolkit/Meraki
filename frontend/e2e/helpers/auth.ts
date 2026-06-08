import { Page } from '@playwright/test'
import { getCompanyUser, getCompany2User, getSpecialistUser, getSpecialist2User, type TestUser } from './api'

type Role = 'company' | 'company2' | 'specialist' | 'specialist2'

const PASSWORDS: Record<Role, string> = {
  company:     'Test@12345',
  company2:    'Test@12345',
  specialist:  'Test@12345',
  specialist2: 'Test@12345',
}

/**
 * Login via the real login UI — fills the form, submits, waits for dashboard.
 * Ensures the auth flow itself is tested on every call.
 */
export async function loginAs(page: Page, role: Role): Promise<TestUser> {
  let testUser: TestUser
  if (role === 'company')          testUser = await getCompanyUser()
  else if (role === 'company2')    testUser = await getCompany2User()
  else if (role === 'specialist2') testUser = await getSpecialist2User()
  else                             testUser = await getSpecialistUser()

  for (let attempt = 0; attempt < 4; attempt++) {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.getByTestId('login-email').fill(testUser.user.email)
    await page.getByTestId('login-password').fill(PASSWORDS[role])
    await page.getByTestId('login-submit').click()
    try {
      await page.waitForURL('**/dashboard', { timeout: 15_000 })
      break
    } catch {
      if (attempt === 3) throw new Error(`loginAs(${role}): failed to reach /dashboard after 4 attempts`)
      await new Promise(r => setTimeout(r, 3000 * (attempt + 1)))
    }
  }

  return testUser
}
