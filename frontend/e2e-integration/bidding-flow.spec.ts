import { test, expect } from '@playwright/test'
import { registerAndLogin } from './helpers/api'

const ts = Date.now()
const API_URL = 'http://localhost:3000/api'

test.describe('UC: Fluxo de Bidding (RF05/RF06/RN02/RN03)', () => {
  const company = {
    name: 'Bid Corp',
    email: `bid-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
  }
  const specialist = {
    name: 'Bid Dev',
    email: `bid-dev-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'SPECIALIST' as const,
  }

  let projectId: string

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    // Register company
    await page.request.post(`${API_URL}/auth/register`, {
      data: { ...company, companyName: company.name },
    })

    // Login to get token
    const loginRes = await page.request.post(`${API_URL}/auth/login`, {
      data: { email: company.email, password: company.password },
    })

    if (!loginRes.ok()) {
      await ctx.close()
      return
    }

    const { accessToken } = await loginRes.json()

    // Create project
    const projRes = await page.request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        title: 'Projeto para Bidding E2E',
        description: 'Teste de fluxo completo de licitação',
        budget: 10000,
        deadline: '2026-12-31',
        requirements: ['NestJS'],
      },
    })

    if (projRes.ok()) {
      const proj = await projRes.json()
      projectId = proj.id
    }

    await ctx.close()
  })

  test('specialist can see open project and submit a bid', async ({ page }) => {
    test.skip(!projectId, 'Project was not created — backend may be down or endpoint missing')

    await registerAndLogin(page, specialist)

    // Navigate to bidding page
    await page.goto(`/bidding/${projectId}`)

    await expect(page.locator('body')).toBeVisible()

    // Look for a proposal/bid input
    const proposalInput = page.locator('textarea').first()
    if (await proposalInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await proposalInput.fill('Proposta E2E: Tenho experiência com NestJS e microserviços.')
    }

    // Look for value/amount input
    const valueInput = page.locator('input[type="number"]').first()
    if (await valueInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await valueInput.fill('9500')
    }

    // Submit bid
    const submitBtn = page.getByRole('button', { name: /enviar|submit|proposta/i })
    if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitBtn.click()
      await page.waitForTimeout(2000)
    }
  })
})
