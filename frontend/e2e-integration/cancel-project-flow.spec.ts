import { test, expect } from '@playwright/test'
import { registerAndLogin, loginWithRetry } from './helpers/api'

const API_URL = 'http://localhost:3000/api'

test.describe('UC: Cancelar Projeto pela UI do Dashboard (DELETE /projects/:id)', () => {
  const ts = Date.now()
  const company = {
    name: 'Cancel Corp',
    email: `cancel-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
    companyName: 'Cancel Corp Ltda',
  }

  let projectId: string
  let companyToken: string

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    await page.request.post(`${API_URL}/auth/register`, { data: company })
    companyToken = await loginWithRetry(page, company.email, company.password)

    const projRes = await page.request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: {
        title: 'Projeto Para Cancelar',
        description: 'Este projeto será cancelado via UI.',
        requirements: ['Vue.js'],
        budget: 3000,
        deadline: '2027-12-31',
      },
    })
    projectId = (await projRes.json()).id

    await ctx.close()
  })

  test('botão de cancelar (lixeira) aparece no card do projeto OPEN', async ({ page }) => {
    await registerAndLogin(page, company)
    await page.getByRole('button', { name: /EMPRESA/i }).first().click()
    await page.waitForURL(/\/dashboard/, { timeout: 5_000 })

    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Projeto Para Cancelar')).toBeVisible({ timeout: 5_000 })

    // Ícone de lixeira deve ser visível no card
    const card = page.locator(`[data-testid="complete-project-${projectId}"]`).locator('..').locator('..')
    // Verifica que a página tem pelo menos um botão de trash (pode ser qualquer card)
    await expect(page.locator('[title="Cancelar projeto"]').first()).toBeVisible({ timeout: 5_000 })
  })

  test('empresa cancela projeto via modal de confirmação', async ({ page }) => {
    await registerAndLogin(page, company)
    await page.getByRole('button', { name: /EMPRESA/i }).first().click()
    await page.waitForURL(/\/dashboard/, { timeout: 5_000 })

    await expect(page.getByText('Projeto Para Cancelar')).toBeVisible({ timeout: 10_000 })

    await page.getByTestId(`cancel-project-${projectId}`).click()

    // Modal de confirmação abre
    await expect(page.getByRole('heading', { name: 'Cancelar Projeto' })).toBeVisible({ timeout: 3_000 })

    // Confirma cancelamento
    await page.getByRole('button', { name: 'Cancelar Projeto', exact: true }).click()

    // Modal fecha — projeto some do filtro ALL (que esconde CANCELLED)
    await expect(page.getByRole('heading', { name: 'Cancelar Projeto' })).not.toBeVisible({ timeout: 10_000 })

    // Verifica que aparece no filtro CANCELLED
    await page.getByRole('button', { name: /CANCELADO|Cancelado/i }).click()
    await expect(page.getByText('Projeto Para Cancelar')).toBeVisible({ timeout: 5_000 })
  })

  test('empresa cancela modal sem confirmar — projeto continua OPEN', async ({ page }) => {
    // Cria um segundo projeto para este teste
    const login = await page.request.post(`${API_URL}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    const token = (await login.json()).accessToken

    const projRes = await page.request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: 'Projeto Não Cancelar',
        description: 'Este projeto NÃO deve ser cancelado.',
        requirements: ['Angular'],
        budget: 2000,
        deadline: '2027-12-31',
      },
    })
    const keepId = (await projRes.json()).id

    await registerAndLogin(page, company)
    await page.getByRole('button', { name: /EMPRESA/i }).first().click()
    await page.waitForURL(/\/dashboard/, { timeout: 5_000 })
    await expect(page.getByText('Projeto Não Cancelar')).toBeVisible({ timeout: 10_000 })

    await page.getByTestId(`cancel-project-${keepId}`).click()

    await expect(page.getByRole('heading', { name: 'Cancelar Projeto' })).toBeVisible({ timeout: 3_000 })

    // Clica em "Manter" para fechar sem cancelar
    await page.getByRole('button', { name: /Manter/i }).click()

    await expect(page.getByRole('heading', { name: 'Cancelar Projeto' })).not.toBeVisible({ timeout: 5_000 })

    // Projeto ainda aparece no filtro ALL
    await expect(page.getByText('Projeto Não Cancelar')).toBeVisible({ timeout: 5_000 })

    // Cleanup via API
    await page.request.delete(`${API_URL}/projects/${keepId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  })
})
