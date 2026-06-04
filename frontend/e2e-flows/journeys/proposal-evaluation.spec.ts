import { test, expect } from '../recorder'
import { GATEWAY, makeCompany, makeSpecialist, registerAndLogin, injectAuth } from '../seed'

const auth = (t: string) => ({ headers: { Authorization: `Bearer ${t}` } })

async function submitBid(request: any, token: string, projectId: string, amount: number) {
  const res = await request.post(`${GATEWAY}/bids/project/${projectId}`, {
    ...auth(token),
    data: {
      proposal: 'Proposta com experiência sólida em NestJS, microsserviços e entrega ágil deste escopo.',
      proposedBudget: amount,
      estimatedDuration: 30,
    },
  })
  expect(res.ok(), `submit bid: ${res.status()} ${await res.text()}`).toBeTruthy()
  return res.json()
}

test.describe('Jornada: Avaliar propostas e selecionar vencedor (RF06/RF07/RN03)', () => {
  test('empresa vê 2 propostas, aceita 1 e a outra é rejeitada automaticamente (RN03)', async ({ page, request, rec }) => {
    // ── Empresa publica projeto ──
    const company = makeCompany()
    const c = await registerAndLogin(request, company)
    const title = `Avaliacao Fluxo ${Date.now()}`
    const P = await (await request.post(`${GATEWAY}/projects`, {
      ...auth(c.token),
      data: { title, description: 'projeto para avaliar e escolher um vencedor', budget: 10000, deadline: '2027-12-31', requirements: ['NestJS'] },
    })).json()

    // ── Dois especialistas submetem proposta ──
    const s1 = await registerAndLogin(request, makeSpecialist('spec-a'))
    const s2 = await registerAndLogin(request, makeSpecialist('spec-b'))
    const bid1 = await submitBid(request, s1.token, P.id, 9000)
    const bid2 = await submitBid(request, s2.token, P.id, 9500)

    // ── Empresa abre a tela de avaliação ──
    await injectAuth(page, c.token, c.user)
    await page.goto(`/projects/${P.id}/bids`)
    await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId(`accept-${bid1.id}`)).toBeVisible()
    await expect(page.getByTestId(`accept-${bid2.id}`)).toBeVisible()
    await rec.shoot('duas-propostas-pendentes')

    // ── Aceita a primeira proposta (ação irreversível) ──
    await page.getByTestId(`accept-${bid1.id}`).click()
    await page.getByTestId('confirm-action').click()

    // UI: aceitar leva ao Kanban do projeto
    await expect(page).toHaveURL(new RegExp(`/kanban/${P.id}`), { timeout: 15_000 })
    await rec.shoot('kanban-apos-aceite')

    // Oráculo API (RN03): a aceita fica ACCEPTED e a outra vira REJECTED
    const after = await (await request.get(`${GATEWAY}/bids/project/${P.id}`, auth(c.token))).json()
    const b1 = (after as any[]).find(b => b.id === bid1.id)
    const b2 = (after as any[]).find(b => b.id === bid2.id)
    expect(b1?.status, 'a proposta aceita deve ficar ACCEPTED').toBe('ACCEPTED')
    expect(b2?.status, 'RN03: a outra proposta deve ser rejeitada automaticamente').toBe('REJECTED')
  })
})
