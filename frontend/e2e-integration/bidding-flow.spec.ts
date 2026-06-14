import { test, expect } from '@playwright/test'
import { registerAndLogin } from './helpers/api'

const API_URL = 'http://localhost:3000/api'

test.describe('UC: Fluxo de Bidding (RF05/RN02)', () => {
  const ts = Date.now()
  const company = {
    name: 'Bid Corp',
    email: `bid-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
    companyName: 'Bid Corp Ltda',
  }
  const specialist = {
    name: 'Bid Dev',
    email: `bid-dev-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'SPECIALIST' as const,
  }

  let projectId: string
  let companyToken: string

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    // Registra e faz login da empresa
    await page.request.post(`${API_URL}/auth/register`, { data: company })
    const loginRes = await page.request.post(`${API_URL}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    if (!loginRes.ok()) throw new Error('Falha ao logar empresa no beforeAll')
    companyToken = (await loginRes.json()).accessToken

    // Cria projeto (setup — o que está sendo testado é o bid, não a criação)
    const projRes = await page.request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: {
        title: 'Projeto para Bidding E2E',
        description: 'Teste de fluxo completo de submissão de proposta.',
        budget: 10000,
        deadline: '2027-12-31',
        requirements: ['NestJS'],
      },
    })
    if (!projRes.ok()) throw new Error('Falha ao criar projeto no beforeAll')
    projectId = (await projRes.json()).id

    await ctx.close()
  })

  test('especialista preenche e submete proposta via UI com sucesso', async ({ page }) => {
    await registerAndLogin(page, specialist)
    await page.goto(`/bidding/${projectId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Preenche o formulário de proposta
    await page.locator('textarea').first().fill(
      'Tenho ampla experiência com NestJS e microserviços, já tendo implementado 3 projetos similares.',
    )
    await page.locator('input[type="number"]').nth(0).fill('9500')
    await page.locator('input[type="number"]').nth(1).fill('30')

    // Submete
    await page.getByRole('button', { name: /ENVIAR_PROPOSTA/i }).click()

    // Frontend chama o backend e exibe overlay de sucesso
    await expect(page.getByText(/PROPOSTA SUBMETIDA/i)).toBeVisible({ timeout: 10_000 })
  })

  test('especialista não pode submeter segunda proposta ao mesmo projeto (RN02)', async ({ page }) => {
    // O teste anterior já submeteu — agora verifica que o formulário está bloqueado
    await registerAndLogin(page, specialist)
    await page.goto(`/bidding/${projectId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Overlay de "já submetida" deve aparecer automaticamente
    await expect(page.getByText(/PROPOSTA SUBMETIDA/i)).toBeVisible({ timeout: 5_000 })
  })
})
