import { Page } from '@playwright/test'
import { getCompanyUser, getSpecialistUser, type TestUser } from './api'

/**
 * Login with a real backend JWT.
 * Calls the API, gets a real token, sets it in localStorage, then navigates.
 */
export async function loginAs(page: Page, role: 'company' | 'specialist'): Promise<TestUser> {
  const testUser = role === 'company' ? await getCompanyUser() : await getSpecialistUser()

  // Navigate to root first so we have a page context for localStorage
  await page.goto('/')

  // Set real JWT + user in localStorage (same keys the frontend uses)
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('meraki_token', token)
      localStorage.setItem('meraki_user', JSON.stringify(user))
    },
    { token: testUser.token, user: testUser.user },
  )

  return testUser
}
