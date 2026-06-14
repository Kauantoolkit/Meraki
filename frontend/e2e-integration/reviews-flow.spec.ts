import { test, expect } from '@playwright/test'
import { registerAndLogin, loginBodyWithRetry } from './helpers/api'

const API_URL = 'http://localhost:3000/api'

test.describe('UC: Avaliações Reais — empresa avalia especialista (POST /reviews)', () => {
  const ts = Date.now()
  const company = {
    name: 'Review Corp',
    email: `review-corp-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'COMPANY' as const,
    companyName: 'Review Corp Ltda',
  }
  const specialist = {
    name: 'Review Dev',
    email: `review-dev-${ts}@test.com`,
    password: 'Test1234!',
    userType: 'SPECIALIST' as const,
  }

  let companyToken: string
  let companyId: string
  let specialistUserId: string  // user.id — used for portfolio profile lookup
  let projectId: string

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    await page.request.post(`${API_URL}/auth/register`, { data: company })
    const companyBody = await loginBodyWithRetry(page, company.email, company.password)
    companyToken = companyBody.accessToken
    companyId = companyBody.user.companyId

    // Cria projeto para associar à review (backend exige projectId)
    const projRes = await page.request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: {
        title: 'Projeto Review E2E',
        description: 'Projeto para teste de avaliação.',
        requirements: ['TypeScript'],
        budget: 5000,
        deadline: '2027-12-31',
      },
    })
    projectId = (await projRes.json()).id

    await page.request.post(`${API_URL}/auth/register`, { data: specialist })
    const specBody = await loginBodyWithRetry(page, specialist.email, specialist.password)
    specialistUserId = specBody.user.id  // profile is stored/looked up by user.id, not specialistUserId

    // Aguarda o evento user.registered ser processado (portfolio-service cria o perfil via RabbitMQ)
    await page.waitForTimeout(2000)

    await ctx.close()
  })

  test('empresa posta avaliação via API e aparece no perfil público do especialista', async ({ page }) => {
    // Empresa posta a review via API
    const reviewRes = await page.request.post(`${API_URL}/reviews`, {
      headers: { Authorization: `Bearer ${companyToken}` },
      data: { specialistId: specialistUserId, projectId, reviewerId: companyId, rating: 5, comment: 'Excelente profissional, entregou no prazo e com qualidade.' },
    })
    expect(reviewRes.ok()).toBeTruthy()

    // Acede ao perfil do especialista como empresa logada
    await registerAndLogin(page, company)
    await page.goto(`/profile/specialist/${specialistUserId}`, { waitUntil: 'networkidle' })

    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Clica na aba Avaliações
    await page.getByRole('button', { name: /Avaliações/i }).click()

    // A review deve aparecer
    await expect(page.getByTestId('reviews-section')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('Excelente profissional, entregou no prazo e com qualidade.')).toBeVisible({ timeout: 5_000 })
  })

  test('aba Avaliações mostra mensagem vazia quando especialista não tem reviews', async ({ page }) => {
    // Cria um novo especialista sem avaliações
    const newSpec = {
      name: 'No Reviews Dev',
      email: `no-reviews-${ts}@test.com`,
      password: 'Test1234!',
      userType: 'SPECIALIST' as const,
    }
    await page.request.post(`${API_URL}/auth/register`, { data: newSpec })
    const loginBody = await loginBodyWithRetry(page, newSpec.email, newSpec.password)
    const newSpecId = loginBody.user.id

    // Aguarda o evento user.registered ser processado pelo portfolio-service (RabbitMQ)
    await page.waitForTimeout(3000)

    await registerAndLogin(page, company)
    await page.goto(`/profile/specialist/${newSpecId}`, { waitUntil: 'networkidle' })

    await page.getByRole('button', { name: /Avaliações/i }).click()

    await expect(page.getByText(/Nenhuma avaliação/i)).toBeVisible({ timeout: 5_000 })
  })

  test('GET /reviews/specialist/:id retorna array vazio para especialista sem reviews', async ({ request }) => {
    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email: company.email, password: company.password },
    })
    const token = (await login.json()).accessToken

    // Cria um especialista sem reviews
    const reg = await request.post(`${API_URL}/auth/register`, {
      data: {
        name: 'Empty Reviews',
        email: `empty-reviews-${ts}@test.com`,
        password: 'Test1234!',
        userType: 'SPECIALIST',
      },
    })
    const login2 = await request.post(`${API_URL}/auth/login`, {
      data: { email: `empty-reviews-${ts}@test.com`, password: 'Test1234!' },
    })
    const emptySpecId = (await login2.json()).user.id

    const res = await request.get(`${API_URL}/reviews/specialist/${emptySpecId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(Array.isArray(body)).toBeTruthy()
    expect(body.length).toBe(0)
  })
})
