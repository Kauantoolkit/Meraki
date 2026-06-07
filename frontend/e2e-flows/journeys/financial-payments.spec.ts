import { test, expect } from '../recorder'
import { GATEWAY, makeCompany, makeSpecialist, registerAndLogin, injectAuth } from '../seed'

const auth = (t: string) => ({ headers: { Authorization: `Bearer ${t}` } })

test.describe('Jornada: Financeiro/pagamentos (RF10) — escrow após aprovação', () => {
  test('aprovar milestone libera pagamento (RELEASED) com taxa de 10%', async ({ page, request, rec }) => {
    const c = await registerAndLogin(request, makeCompany())
    const s = await registerAndLogin(request, makeSpecialist())
    const title = `Financeiro Fluxo ${Date.now()}`
    const P = await (await request.post(`${GATEWAY}/projects`, {
      ...auth(c.token), data: { title, description: 'projeto para fluxo financeiro e escrow', budget: 6000, deadline: '2027-12-31', requirements: ['NestJS'] },
    })).json()
    const m1 = await (await request.post(`${GATEWAY}/projects/${P.id}/milestones`, {
      ...auth(c.token), data: { title: 'Entrega Paga', description: 'entrega', amount: 6000 },
    })).json()

    // Lifecycle via API (papéis corretos): iniciar → submeter → aprovar
    expect((await request.put(`${GATEWAY}/milestones/${m1.id}/start`, auth(s.token))).ok()).toBeTruthy()
    expect((await request.post(`${GATEWAY}/milestones/${m1.id}/submit`, { ...auth(s.token), data: { projectId: P.id, deliveryNotes: 'entrega', deliveredFiles: [] } })).ok()).toBeTruthy()
    expect((await request.put(`${GATEWAY}/milestones/${m1.id}/approve`, { ...auth(c.token), data: { amount: 6000 } })).ok()).toBeTruthy()

    // Oráculo: o escrow é liberado (evento assíncrono) → RELEASED
    await expect.poll(async () => {
      const pays = await (await request.get(`${GATEWAY}/payments/project/${P.id}`, auth(c.token))).json()
      return (Array.isArray(pays) ? pays : []).find((p: any) => p.milestoneId === m1.id)?.status
    }, { timeout: 15_000, message: 'pagamento deveria ficar RELEASED após aprovação' }).toBe('RELEASED')

    const pays = await (await request.get(`${GATEWAY}/payments/project/${P.id}`, auth(c.token))).json()
    const pay = pays.find((p: any) => p.milestoneId === m1.id)
    expect(Number(pay.platformFee), 'taxa de plataforma de 10% sobre 6000').toBe(600)
    expect(Number(pay.specialistAmount), 'líquido do especialista (6000 - 10%)').toBe(5400)

    // UI renderiza sem 5xx (o recorder falha em qualquer 5xx do backend)
    await injectAuth(page, s.token, s.user)
    await page.goto('/')
    await page.getByRole('link', { name: /GANHOS/i }).first().click()
    await page.waitForURL(/\/earnings/, { timeout: 5_000 })
    await rec.shoot('ganhos-especialista')
    await injectAuth(page, c.token, c.user)
    await page.goto('/')
    await page.getByRole('link', { name: /FINANCEIRO/i }).first().click()
    await page.waitForURL(/\/financial/, { timeout: 5_000 })
    await rec.shoot('financeiro-empresa')
  })
})
