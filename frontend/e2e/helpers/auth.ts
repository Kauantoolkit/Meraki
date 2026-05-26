import { Page } from '@playwright/test'
import { getCompanyUser, getCompany2User, getSpecialistUser, getSpecialist2User, type TestUser } from './api'

type Role = 'company' | 'company2' | 'specialist' | 'specialist2'

/**
 * Login with a real backend JWT.
 * Calls the API, gets a real token, sets it in localStorage, then navigates.
 */
export async function loginAs(page: Page, role: Role): Promise<TestUser> {
  let testUser: TestUser
  if (role === 'company')     testUser = await getCompanyUser()
  else if (role === 'company2') testUser = await getCompany2User()
  else if (role === 'specialist2') testUser = await getSpecialist2User()
  else testUser = await getSpecialistUser()

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
