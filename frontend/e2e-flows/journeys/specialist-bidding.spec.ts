import { test, expect } from '../recorder'
import { GATEWAY, makeCompany, makeSpecialist, registerAndLogin, injectAuth } from '../seed'

const auth = (t: string) => ({ headers: { Authorization: `Bearer ${t}` } })

test.describe('Jornada: Especialista descobre projeto e propõe (RF05)', () => {
  test('especialista vê oportunidade OPEN e submete proposta', async ({ page, request, rec }) => {
    // ── Pré-condição: empresa publica um projeto OPEN ──
    const company = makeCompany()
    const c = await registerAndLogin(request, company)
    const title = `Oportunidade Fluxo ${Date.now()}`
    const cr = await request.post(`${GATEWAY}/projects`, {
      ...auth(c.token),
      data: { title, description: 'projeto aberto para o especialista propor', budget: 9000, deadline: '2027-12-31', requirements: ['NestJS'] },
    })
    expect(cr.ok(), `criar projeto: ${cr.status()} ${await cr.text()}`).toBeTruthy()
    const P = await cr.json()

    // ── Especialista autentica ──
    const specialist = makeSpecialist()
    const s = await registerAndLogin(request, specialist)
    await injectAuth(page, s.token, s.user)

    // Etapa 1 — descoberta: o projeto OPEN aparece nas Oportunidades
    await page.getByRole('button', { name: /ESPECIALISTA/i }).first().click()
    await page.waitForURL(/\/dashboard/, { timeout: 5_000 })
    await expect(page.getByText('Terminal do Especialista')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 })
    await rec.shoot('dashboard-oportunidade')

    // Etapa 2 — abrir o terminal de bidding do projeto
    await page.goto(`/bidding/${P.id}`)
    await expect(page.getByTestId('bid-submit')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(title)).toBeVisible()
    await rec.shoot('bidding-form')

    // Etapa 3 — preencher e submeter a proposta
    await page.getByTestId('bid-amount').fill('7500')
    await page.getByTestId('bid-duration').fill('30')
    await page.getByTestId('bid-cover').fill('Proposta de fluxo automatizado: experiência sólida com NestJS e microsserviços para entregar este projeto.')
    await rec.shoot('bidding-preenchido')
    await page.getByTestId('bid-submit').click()

    // Etapa 4 — sucesso na UI
    await expect(page.getByTestId('bid-success')).toBeVisible({ timeout: 15_000 })
    await rec.shoot('bidding-sucesso')

    // Oráculo API: a proposta consta nas propostas do especialista
    const myBids = await (await request.get(`${GATEWAY}/bids/my-bids`, auth(s.token))).json()
    expect(JSON.stringify(myBids), 'a proposta deveria constar em /bids/my-bids').toContain(P.id)
  })

  test('RN02 — especialista não pode submeter segunda proposta ativa', async ({ page, request, rec }) => {
    const company = makeCompany()
    const c = await registerAndLogin(request, company)
    const title = `RN02 Fluxo ${Date.now()}`
    const P = await (await request.post(`${GATEWAY}/projects`, {
      ...auth(c.token),
      data: { title, description: 'projeto para validar a regra de proposta única', budget: 9000, deadline: '2027-12-31', requirements: ['NestJS'] },
    })).json()

    const s = await registerAndLogin(request, makeSpecialist())
    const payload = (txt: string, v: number) => ({ ...auth(s.token), data: { proposal: txt, proposedBudget: v, estimatedDuration: 30 } })

    // 1ª proposta — deve passar
    const first = await request.post(`${GATEWAY}/bids/project/${P.id}`, payload('Primeira proposta com experiência sólida em NestJS e microsserviços.', 8000))
    expect(first.ok(), `1ª proposta deveria passar: ${first.status()} ${await first.text()}`).toBeTruthy()

    // 2ª proposta — RN02 deve bloquear (4xx)
    const second = await request.post(`${GATEWAY}/bids/project/${P.id}`, payload('Segunda proposta — não deveria ser aceita pela RN02.', 8500))
    expect(second.ok(), 'RN02: a segunda proposta deveria ser rejeitada').toBeFalsy()
    expect(second.status(), 'RN02: esperado 4xx na segunda proposta').toBeGreaterThanOrEqual(400)

    // UI: ao revisitar o bidding, o formulário fica bloqueado pelo overlay de proposta existente
    await injectAuth(page, s.token, s.user)
    await page.goto(`/bidding/${P.id}`)
    await expect(page.getByText('PROPOSTA SUBMETIDA')).toBeVisible({ timeout: 15_000 })
    await rec.shoot('rn02-proposta-existente')
  })
})
