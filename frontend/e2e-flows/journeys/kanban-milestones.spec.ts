import { test, expect } from '../recorder'
import { GATEWAY, makeCompany, makeSpecialist, registerAndLogin, injectAuth } from '../seed'

const auth = (t: string) => ({ headers: { Authorization: `Bearer ${t}` } })

test.describe('Jornada: Kanban — milestones sequenciais e histórico (RN04/RN07)', () => {
  test('M1 iniciável e M2 bloqueada; iniciar M1; RN04 e histórico (RN07)', async ({ page, request, rec }) => {
    // Empresa cria projeto + 2 milestones
    const company = makeCompany()
    const c = await registerAndLogin(request, company)
    const title = `Kanban Fluxo ${Date.now()}`
    const P = await (await request.post(`${GATEWAY}/projects`, {
      ...auth(c.token),
      data: { title, description: 'projeto para kanban e milestones sequenciais', budget: 10000, deadline: '2027-12-31', requirements: ['NestJS'] },
    })).json()
    const m1 = await (await request.post(`${GATEWAY}/projects/${P.id}/milestones`, {
      ...auth(c.token), data: { title: 'Milestone 1 — Base', description: 'primeira entrega', amount: 5000 },
    })).json()
    const m2 = await (await request.post(`${GATEWAY}/projects/${P.id}/milestones`, {
      ...auth(c.token), data: { title: 'Milestone 2 — Integração', description: 'segunda entrega', amount: 5000 },
    })).json()

    // Especialista abre o Kanban
    const s = await registerAndLogin(request, makeSpecialist())
    await injectAuth(page, s.token, s.user)
    await page.goto(`/kanban/${P.id}`)

    // Etapa 1 — RN04 visual: M1 iniciável, M2 bloqueada
    await expect(page.getByTestId(`ms-start-${m1.id}`)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId(`ms-blocked-${m2.id}`)).toBeVisible()
    await rec.shoot('rn04-m1-iniciavel-m2-bloqueada')

    // Etapa 2 — iniciar M1 pela UI → IN_PROGRESS (passa a mostrar SUBMETER); M2 segue bloqueada
    await page.getByTestId(`ms-start-${m1.id}`).click()
    await expect(page.getByTestId(`ms-submit-${m1.id}`)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId(`ms-blocked-${m2.id}`)).toBeVisible()
    await rec.shoot('m1-em-progresso')

    // Etapa 3 — RN04 oráculo API: iniciar M2 antes de M1 aprovada deve falhar
    const startM2 = await request.put(`${GATEWAY}/milestones/${m2.id}/start`, auth(s.token))
    expect(startM2.status(), 'RN04: iniciar M2 antes de M1 aprovada deve ser bloqueado (4xx)').toBeGreaterThanOrEqual(400)

    // Etapa 4 — RN07: histórico via gateway (como o front consome) contém os eventos
    const history = await (await request.get(`${GATEWAY}/projects/${P.id}/history`, auth(c.token))).json()
    expect(JSON.stringify(history), 'RN07: histórico via gateway deve conter PROJECT_CREATED').toContain('PROJECT_CREATED')
    await expect(page.getByText('Project_History')).toBeVisible()
    // Painel agora consome o histórico real do backend → mostra o evento PROJECT_CREATED
    await expect(page.getByText(/PROJECT_CREATED/).first()).toBeVisible({ timeout: 10_000 })
    await rec.shoot('historico-rn07')
  })
})
