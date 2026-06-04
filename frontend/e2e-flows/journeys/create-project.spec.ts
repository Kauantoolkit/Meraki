import { test, expect } from '../recorder'
import { walk, type FlowContext } from '../graph'
import { createProjectGraph } from '../flows/create-project.flow'
import { GATEWAY, makeCompany, registerAndLogin, injectAuth } from '../seed'

test.describe('Jornada: Criar Projeto (RF03)', () => {
  test('empresa cria projeto pelos 4 passos e o vê publicado + listado', async ({ page, request, rec }) => {
    const ctx: FlowContext = { page, request, rec, store: {} }

    // Pré-condição: empresa autenticada (semeada via API real)
    const company = makeCompany()
    const { token, user } = await registerAndLogin(request, company)
    await injectAuth(page, token, user)

    // Wizard pela UI real
    await page.goto('/projects/new')
    await walk(ctx, createProjectGraph, ['cp-base', 'cp-stack', 'cp-milestones', 'cp-orcamento', 'cp-publicado'])

    // Oráculo extra: o projeto criado aparece na listagem da empresa (cobre o "aparece no dashboard")
    const res = await request.get(`${GATEWAY}/projects`, { headers: { Authorization: `Bearer ${token}` } })
    expect(res.ok(), `GET /projects falhou: ${res.status()}`).toBeTruthy()
    const body = await res.json()
    const items = body.data ?? body
    expect(JSON.stringify(items)).toContain(ctx.store.projectTitle)
  })
})
