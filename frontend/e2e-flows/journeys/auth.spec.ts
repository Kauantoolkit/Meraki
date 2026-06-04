import { test } from '../recorder'
import { walk, type FlowContext } from '../graph'
import { authGraph } from '../flows/auth.flow'
import { makeCompany, registerAndLogin } from '../seed'

test.describe('Jornada: Autenticação (RF01/RF02)', () => {
  test('empresa se cadastra e chega no dashboard', async ({ page, request, rec }) => {
    const ctx: FlowContext = { page, request, rec, store: {} }
    await page.goto('/login')
    await walk(ctx, authGraph, ['login', 'signup', 'dashboard-empresa'])
  })

  test('empresa existente faz login pela UI', async ({ page, request, rec }) => {
    const ctx: FlowContext = { page, request, rec, store: {} }
    const company = makeCompany()
    await registerAndLogin(request, company) // semeia a conta no backend real
    ctx.store.company = company
    await page.goto('/login')
    await walk(ctx, authGraph, ['login', 'dashboard-empresa'])
  })

  test('credenciais inválidas mostram erro', async ({ page, request, rec }) => {
    const ctx: FlowContext = { page, request, rec, store: {} }
    await page.goto('/login')
    await walk(ctx, authGraph, ['login', 'erro-login'])
  })
})
