import { test, expect } from '@playwright/test'
import { GATEWAY, makeCompany, makeSpecialist, registerAndLogin } from '../seed'

const auth = (t: string) => ({ headers: { Authorization: `Bearer ${t}` } })
// "o roteiro inteiro do Bee Movie": 50 mil caracteres
const HUGE = 'a'.repeat(50_000)

test.describe('Validação de limites de entrada — backend rejeita texto gigante', () => {
  test('projeto: título gigante → 400', async ({ request }) => {
    const c = await registerAndLogin(request, makeCompany())
    const r = await request.post(`${GATEWAY}/projects`, {
      ...auth(c.token),
      data: { title: HUGE, description: 'descrição válida do projeto', budget: 5000, deadline: '2027-12-31', requirements: ['NestJS'] },
    })
    expect(r.status(), `título gigante deveria dar 400, veio ${r.status()}`).toBe(400)
  })

  test('projeto: descrição gigante → 400', async ({ request }) => {
    const c = await registerAndLogin(request, makeCompany())
    const r = await request.post(`${GATEWAY}/projects`, {
      ...auth(c.token),
      data: { title: 'Projeto de Teste de Limite', description: HUGE, budget: 5000, deadline: '2027-12-31', requirements: ['NestJS'] },
    })
    expect(r.status(), `descrição gigante deveria dar 400, veio ${r.status()}`).toBe(400)
  })

  test('perfil: bio gigante → 400', async ({ request }) => {
    const s = await registerAndLogin(request, makeSpecialist())
    const r = await request.patch(`${GATEWAY}/portfolio/me`, { ...auth(s.token), data: { bio: HUGE } })
    expect(r.status(), `bio gigante deveria dar 400, veio ${r.status()}`).toBe(400)
  })

  test('cadastro: nome gigante → 400', async ({ request }) => {
    const r = await request.post(`${GATEWAY}/auth/register`, {
      data: { name: HUGE, email: `huge-${Date.now()}@meraki.test`, password: 'Test1234!', userType: 'COMPANY', companyName: 'X' },
    })
    expect(r.status(), `nome gigante deveria dar 400, veio ${r.status()}`).toBe(400)
  })

  test('sanidade: payload normal continua passando (201)', async ({ request }) => {
    const c = await registerAndLogin(request, makeCompany())
    const r = await request.post(`${GATEWAY}/projects`, {
      ...auth(c.token),
      data: { title: 'Projeto Tamanho Normal', description: 'Uma descrição perfeitamente razoável.', budget: 5000, deadline: '2027-12-31', requirements: ['NestJS'] },
    })
    expect(r.status(), `payload normal deveria dar 201, veio ${r.status()}`).toBe(201)
  })
})
