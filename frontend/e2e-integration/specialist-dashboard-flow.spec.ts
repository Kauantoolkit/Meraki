import { test, expect } from '@playwright/test'
import { registerAndLogin } from './helpers/api'

const API_URL = 'http://localhost:3000/api'

/**
 * UC: Dashboard do Especialista — RF05 (ver e candidatar-se a projetos)
 *
 * Uma empresa cria um projeto OPEN.
 * Verifica pela UI que:
 * - O projeto aparece na seção "Oportunidades" do dashboard do especialista
 * - O botão APPLY_BID() navega para a tela de submissão da proposta
 */
test.describe('UC: Especialista vê projetos abertos e acede ao bidding (RF05)', () => {
  const ts = Date.now()
  const company = {
    name: `Opportunity Corp ${ts}`,
    email: `opp-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
    companyName: `Opportunity Corp Ltda ${ts}`,
  }
  const specialist = {
    name: `Opportunity Dev ${ts}`,
    email: `opp-dev-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'SPECIALIST' as const,
  }

  const PROJECT_TITLE = `Oportunidade Visível E2E ${ts}`
  let projectId: string

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    // Empresa cria projeto OPEN via API
    await page.request.post(`${API_URL}/auth/register`, { data: company })
    const loginRes = await page.request.post(`${API_URL}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    if (!loginRes.ok()) throw new Error('Falha ao logar empresa')
    const companyToken = (await loginRes.json()).accessToken

    const projRes = await page.request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: {
        title: PROJECT_TITLE,
        description: 'Projeto publicado para teste de visibilidade no dashboard do especialista.',
        requirements: ['Flutter', 'Dart'],
        budget: 12000,
        deadline: '2027-12-31',
      },
    })
    if (!projRes.ok()) throw new Error('Falha ao criar projeto')
    projectId = (await projRes.json()).id

    // Regista especialista
    await page.request.post(`${API_URL}/auth/register`, { data: specialist })

    await ctx.close()
  })

  test('projeto OPEN aparece na seção Oportunidades do dashboard do especialista', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await page.goto('/dashboard', { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Oportunidades/i)).toBeVisible({ timeout: 5_000 })

    // O projeto criado pela empresa deve aparecer na lista
    await expect(page.getByText(PROJECT_TITLE)).toBeVisible({ timeout: 10_000 })
  })

  test('botão APPLY_BID() navega para a tela de submissão de proposta do projeto correto', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await page.goto('/dashboard', { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(PROJECT_TITLE)).toBeVisible({ timeout: 10_000 })

    // Clica no botão APPLY_BID do card deste projeto
    const projectCard = page.locator(`text=${PROJECT_TITLE}`).locator('..').locator('..')
    await projectCard.getByRole('button', { name: /APPLY_BID/i }).click()

    // Deve navegar para a tela de bidding com o projectId correto
    await expect(page).toHaveURL(new RegExp(`/bidding/${projectId}`), { timeout: 5_000 })

    // A tela de bidding exibe o título do projeto
    await expect(page.getByText(PROJECT_TITLE)).toBeVisible({ timeout: 5_000 })
  })
})
