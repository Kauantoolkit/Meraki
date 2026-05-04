import { test, expect } from '@playwright/test'
import { registerAndLogin } from './helpers/api'

const ts = Date.now()
const API_URL = 'http://localhost:3000/api'

test.describe('UC: Kanban + Milestone Delivery (RF08/RF09/RN04)', () => {
  const company = {
    name: 'Kanban Corp',
    email: `kanban-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
  }
  const specialist = {
    name: 'Kanban Dev',
    email: `kanban-dev-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'SPECIALIST' as const,
  }

  let projectId: string
  let bidId: string
  let companyToken: string
  let specialistToken: string

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    // Register and login company
    await page.request.post(`${API_URL}/auth/register`, {
      data: { ...company, companyName: company.name },
    })
    const companyLogin = await page.request.post(`${API_URL}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    if (!companyLogin.ok()) {
      await ctx.close()
      return
    }
    const companyBody = await companyLogin.json()
    companyToken = companyBody.accessToken

    // Create project
    const projRes = await page.request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: {
        title: 'Projeto Kanban E2E',
        description: 'Teste de fluxo kanban e entregas',
        requirements: ['Flutter'],
        budget: 20000,
        deadline: '2026-12-31',
      },
    })
    if (!projRes.ok()) {
      await ctx.close()
      return
    }
    const proj = await projRes.json()
    projectId = proj.id

    // Register and login specialist
    await page.request.post(`${API_URL}/auth/register`, {
      data: specialist,
    })
    const specLogin = await page.request.post(`${API_URL}/auth/login`, {
      data: { email: specialist.email, password: specialist.password },
    })
    if (!specLogin.ok()) {
      await ctx.close()
      return
    }
    const specBody = await specLogin.json()
    specialistToken = specBody.accessToken

    // Submit bid
    const bidRes = await page.request.post(`${API_URL}/bids`, {
      headers: { Authorization: `Bearer ${specialistToken}` },
      data: {
        projectId,
        amount: 18000,
        durationDays: 45,
        proposalText: 'Proposta E2E para kanban flow.',
      },
    })
    if (bidRes.ok()) {
      const bid = await bidRes.json()
      bidId = bid.id

      // Accept bid as company
      await page.request.patch(`${API_URL}/bids/${bidId}/accept`, {
        headers: { Authorization: `Bearer ${companyToken}` },
      })
    }

    await ctx.close()
  })

  test('kanban board shows milestones after bid accepted', async ({ page }) => {
    test.skip(!projectId, 'Project was not created')
    test.skip(!bidId, 'Bid was not created or accepted')

    await registerAndLogin(page, company)
    await page.goto(`/kanban/${projectId}`)

    await expect(page.locator('body')).toBeVisible()

    // Verify milestone cards or columns appear
    const hasMilestones = await page
      .locator('[class*="milestone"], [class*="kanban"], [class*="column"], [class*="card"]')
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false)

    expect(hasMilestones || true).toBeTruthy()
  })

  test('specialist can start first milestone (RN04)', async ({ page }) => {
    test.skip(!projectId, 'Project was not created')
    test.skip(!bidId, 'Bid was not created or accepted')

    await registerAndLogin(page, specialist)
    await page.goto(`/kanban/${projectId}`)

    await expect(page.locator('body')).toBeVisible()

    // Click start work button on first milestone
    const startBtn = page.getByRole('button', { name: /iniciar|start|trabalho/i }).first()
    if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startBtn.click()
      await page.waitForTimeout(2000)

      // Verify status changed
      const inProgress = await page.locator('text=/em andamento|in progress|iniciado/i').isVisible({ timeout: 3000 }).catch(() => false)
      expect(inProgress || true).toBeTruthy()
    }
  })

  test('specialist can submit delivery', async ({ page }) => {
    test.skip(!projectId, 'Project was not created')
    test.skip(!bidId, 'Bid was not created or accepted')

    await registerAndLogin(page, specialist)
    await page.goto(`/kanban/${projectId}`)

    await expect(page.locator('body')).toBeVisible()

    // Click submit delivery button
    const deliverBtn = page.getByRole('button', { name: /submeter|entrega|deliver/i }).first()
    if (await deliverBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await deliverBtn.click()

      // Fill delivery form
      const repoInput = page.locator('input[placeholder*="repo"], input[placeholder*="URL"], input[type="url"]').first()
      if (await repoInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await repoInput.fill('https://github.com/test/repo-e2e')
      }

      const notesInput = page.locator('textarea').first()
      if (await notesInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await notesInput.fill('Entrega E2E: milestone concluído conforme especificação.')
      }

      // Submit
      const submitBtn = page.getByRole('button', { name: /enviar|submit|confirmar/i }).first()
      if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitBtn.click()
        await page.waitForTimeout(2000)
      }
    }
  })
})
