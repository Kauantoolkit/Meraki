import { type APIRequestContext, type Page, expect } from '@playwright/test'

/** Backend real, via gateway. */
export const GATEWAY = 'http://localhost:3000/api'

export interface Actor {
  name: string
  email: string
  password: string
  userType: 'COMPANY' | 'SPECIALIST'
  companyName?: string
}

const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e4)}`

export function makeCompany(prefix = 'flow-company'): Actor {
  const name = 'Flow Corp'
  return { name, companyName: name, email: `${prefix}-${uniq()}@meraki.test`, password: 'Test1234!', userType: 'COMPANY' }
}

export function makeSpecialist(prefix = 'flow-specialist'): Actor {
  return { name: 'Flow Dev', email: `${prefix}-${uniq()}@meraki.test`, password: 'Test1234!', userType: 'SPECIALIST' }
}

/** Mapeia o user do backend para o shape que o front guarda no localStorage. */
function toFrontUser(raw: any) {
  return { ...raw, type: raw.userType === 'COMPANY' ? 'company' : 'specialist' }
}

/** Registra (idempotente) e faz login via API, com retry de throttler (429). Devolve token + user. */
export async function registerAndLogin(request: APIRequestContext, actor: Actor) {
  await request
    .post(`${GATEWAY}/auth/register`, {
      data: {
        name: actor.name,
        email: actor.email,
        password: actor.password,
        userType: actor.userType,
        ...(actor.userType === 'COMPANY' ? { companyName: actor.companyName ?? actor.name } : {}),
      },
    })
    .catch(() => {})

  let res = await request.post(`${GATEWAY}/auth/login`, { data: { email: actor.email, password: actor.password } })
  for (let attempt = 0; attempt < 5 && res.status() === 429; attempt++) {
    await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)))
    res = await request.post(`${GATEWAY}/auth/login`, { data: { email: actor.email, password: actor.password } })
  }
  expect(res.ok(), `Login falhou (${res.status()}): ${await res.text()}`).toBeTruthy()

  const body = await res.json()
  return { token: body.accessToken as string, user: toFrontUser(body.user), raw: body }
}

/** Injeta a sessão no navegador (mesmo esquema do AuthContext: meraki_token / meraki_user). */
export async function injectAuth(page: Page, token: string, user: object) {
  await page.goto('/')
  await page.evaluate(
    ({ t, u }) => {
      localStorage.setItem('meraki_token', t)
      localStorage.setItem('meraki_user', JSON.stringify(u))
    },
    { t: token, u: user },
  )
}
