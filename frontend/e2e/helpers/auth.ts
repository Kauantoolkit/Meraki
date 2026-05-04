import { Page } from '@playwright/test'

export const MOCK_COMPANY_USER = {
  id: 'test-company-id',
  name: 'Empresa Teste',
  email: 'empresa@test.com',
  userType: 'COMPANY' as const,
  companyId: 'comp-1',
  type: 'company' as const,
}

export const MOCK_SPECIALIST_USER = {
  id: 'test-specialist-id',
  name: 'Dev Teste',
  email: 'dev@test.com',
  userType: 'SPECIALIST' as const,
  specialistId: 'spec-1',
  type: 'specialist' as const,
}

export async function loginAs(page: Page, user: typeof MOCK_COMPANY_USER | typeof MOCK_SPECIALIST_USER) {
  // Mock backend API calls to prevent 401 from invalidating our fake auth
  await page.route('http://localhost:3000/api/**', (route) => {
    const url = route.request().url()
    if (url.includes('/projects')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0 }) })
    }
    if (url.includes('/auth/me')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(user) })
    }
    if (url.includes('/bids') || url.includes('/payments') || url.includes('/milestones')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })

  await page.goto('/')
  await page.evaluate((u) => {
    localStorage.setItem('meraki_token', 'fake-jwt-token-for-testing')
    localStorage.setItem('meraki_user', JSON.stringify(u))
  }, user)
}
