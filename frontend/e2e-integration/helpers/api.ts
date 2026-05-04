import { Page } from '@playwright/test'

const API_URL = 'http://localhost:3000/api'

/** Register a user via API and inject auth into the browser */
export async function registerAndLogin(
  page: Page,
  data: {
    name: string
    email: string
    password: string
    userType: 'COMPANY' | 'SPECIALIST'
    companyName?: string
  },
) {
  // Try register first
  const regPayload: any = { ...data }
  if (data.userType === 'COMPANY' && !data.companyName) {
    regPayload.companyName = data.name
  }
  await page.request.post(`${API_URL}/auth/register`, { data: regPayload }).catch(() => {})

  // Always login (register may or may not return token)
  const loginRes = await page.request.post(`${API_URL}/auth/login`, {
    data: { email: data.email, password: data.password },
  })
  if (!loginRes.ok()) throw new Error(`Failed to login: ${await loginRes.text()}`)

  const body = await loginRes.json()
  const user = {
    ...body.user,
    type: body.user.userType === 'COMPANY' ? 'company' : 'specialist',
  }

  await page.goto('/')
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('meraki_token', token)
      localStorage.setItem('meraki_user', JSON.stringify(user))
    },
    { token: body.accessToken, user },
  )

  return body
}

export const TEST_COMPANY = {
  name: 'E2E Company',
  email: `e2e-company-${Date.now()}@test.com`,
  password: 'Test1234!',
  userType: 'COMPANY' as const,
}

export const TEST_SPECIALIST = {
  name: 'E2E Specialist',
  email: `e2e-specialist-${Date.now()}@test.com`,
  password: 'Test1234!',
  userType: 'SPECIALIST' as const,
}
