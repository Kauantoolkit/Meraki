import { Page } from '@playwright/test'

const API_URL = 'http://localhost:3000/api'

/**
 * Login com backoff exponencial para suportar o throttler (429) em contextos beforeAll.
 * Retorna o accessToken ou lança erro.
 */
export async function loginWithRetry(page: Page, email: string, password: string): Promise<string> {
  const body = await loginBodyWithRetry(page, email, password)
  return body.accessToken
}

/**
 * Igual a loginWithRetry mas retorna o body completo do login.
 * Útil quando precisamos de campos extra (user.id, companyId, etc.).
 */
export async function loginBodyWithRetry(page: Page, email: string, password: string): Promise<any> {
  let res: Awaited<ReturnType<typeof page.request.post>>
  for (let attempt = 0; attempt < 6; attempt++) {
    res = await page.request.post(`${API_URL}/auth/login`, { data: { email, password } })
    if (res.status() !== 429) break
    await new Promise(r => setTimeout(r, 3000 * (attempt + 1)))
  }
  if (!res!.ok()) throw new Error(`Login failed (${res!.status()}): ${await res!.text()}`)
  return res!.json()
}

/**
 * Regista o utilizador via API, depois faz login pela página de login real (UI).
 * Testa o fluxo completo — incluindo o correto armazenamento em sessionStorage.
 */
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
  // Registo via API (sem UI para registo nos testes de fluxo)
  const regPayload: any = { ...data }
  if (data.userType === 'COMPANY' && !data.companyName) {
    regPayload.companyName = data.name
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await page.request.post(`${API_URL}/auth/register`, { data: regPayload })
    if (res.status() !== 429) break
    await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
  }

  // Login pela UI — como um utilizador real; testa o fluxo de auth completo
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByTestId('login-email').fill(data.email)
  await page.getByTestId('login-password').fill(data.password)
  await page.getByTestId('login-submit').click()
  await page.waitForURL('**/dashboard', { timeout: 15_000 })
}

export const TEST_COMPANY = {
  name: 'E2E Company',
  email: `e2e-company-${Date.now()}@test.com`,
  password: 'Test1234!',
  userType: 'COMPANY' as const,
}

/**
 * Cria uma skill no catálogo via API usando a sessão da página já autenticada.
 * Gera 10 questões dummy para satisfazer o mínimo exigido.
 * Idempotente — se a skill já existe (409), ignora o erro.
 */
export async function createSkillInCatalog(page: Page, displayName: string): Promise<void> {
  const token = await page.evaluate(() => sessionStorage.getItem('meraki_token'))
  const questions = Array.from({ length: 10 }, (_, i) => ({
    text: `Questão ${i + 1} sobre ${displayName}?`,
    options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
    correctIndex: 0,
  }))
  const res = await page.request.post(`${API_URL}/skills`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { displayName, questions },
  })
  if (res.status() !== 201 && res.status() !== 409) {
    throw new Error(`Falha ao criar skill "${displayName}": ${res.status()} ${await res.text()}`)
  }
}

export const TEST_SPECIALIST = {
  name: 'E2E Specialist',
  email: `e2e-specialist-${Date.now()}@test.com`,
  password: 'Test1234!',
  userType: 'SPECIALIST' as const,
}
