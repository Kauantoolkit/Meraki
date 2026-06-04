import { test, expect } from '../recorder'
import { GATEWAY, makeCompany, makeSpecialist, registerAndLogin, injectAuth } from '../seed'

const auth = (t: string) => ({ headers: { Authorization: `Bearer ${t}` } })

test.describe('Jornada: Entrega de milestone (RF08/RF09) — submeter e aprovar', () => {
  test('especialista submete entrega e empresa aprova (M1 → APPROVED)', async ({ page, request, rec }) => {
    const c = await registerAndLogin(request, makeCompany())
    const title = `Entrega Fluxo ${Date.now()}`
    const P = await (await request.post(`${GATEWAY}/projects`, {
      ...auth(c.token),
      data: { title, description: 'projeto para o fluxo de entrega de milestone', budget: 6000, deadline: '2027-12-31', requirements: ['NestJS'] },
    })).json()
    const m1 = await (await request.post(`${GATEWAY}/projects/${P.id}/milestones`, {
      ...auth(c.token), data: { title: 'Entrega Única', description: 'entrega do projeto', amount: 6000 },
    })).json()

    const s = await registerAndLogin(request, makeSpecialist())

    // ── Especialista: iniciar + submeter entrega ──
    await injectAuth(page, s.token, s.user)
    await page.goto(`/kanban/${P.id}`)
    await page.getByTestId(`ms-start-${m1.id}`).click()
    await expect(page.getByTestId(`ms-submit-${m1.id}`)).toBeVisible({ timeout: 15_000 })
    await rec.shoot('m1-iniciada')

    await page.getByTestId(`ms-submit-${m1.id}`).click()
    await page.getByTestId('ms-submit-repo').fill('https://github.com/meraki/entrega-fluxo')
    await page.getByTestId('ms-submit-notes').fill('Entrega completa com testes automatizados e documentação.')
    await rec.shoot('submit-modal')
    await page.getByTestId('ms-submit-confirm').click()
    await expect(page.getByTestId(`ms-submit-${m1.id}`)).toBeHidden({ timeout: 15_000 })
    await rec.shoot('m1-submetida')

    // Oráculo API: M1 deve estar SUBMITTED
    await expect.poll(async () => {
      const ms = await (await request.get(`${GATEWAY}/projects/${P.id}/milestones`, auth(c.token))).json()
      return ms.find((m: any) => m.id === m1.id)?.status
    }, { timeout: 15_000, message: 'M1 deveria ficar SUBMITTED após submeter entrega' }).toBe('SUBMITTED')

    // ── Empresa: aprovar + pagar ──
    await injectAuth(page, c.token, c.user)
    await page.goto(`/kanban/${P.id}`)
    await expect(page.getByTestId(`ms-approve-${m1.id}`)).toBeVisible({ timeout: 15_000 })
    await rec.shoot('aprovar-disponivel')
    await page.getByTestId(`ms-approve-${m1.id}`).click()
    await page.getByTestId('ms-approve-confirm').click()
    await rec.shoot('m1-aprovada')

    // Oráculo API: M1 deve ficar APPROVED
    await expect.poll(async () => {
      const ms = await (await request.get(`${GATEWAY}/projects/${P.id}/milestones`, auth(c.token))).json()
      return ms.find((m: any) => m.id === m1.id)?.status
    }, { timeout: 15_000, message: 'M1 deveria ficar APPROVED após aprovação' }).toBe('APPROVED')
  })
})
