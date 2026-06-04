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
    await page.goto('/dashboard')
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
})
