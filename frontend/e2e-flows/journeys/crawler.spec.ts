import { test, expect } from '../recorder'
import { makeCompany, makeSpecialist, registerAndLogin, injectAuth } from '../seed'

/**
 * Rede de segurança (crawler raso): visita as rotas sem parâmetro como cada ator
 * e confia no `recorder` para falhar em QUALQUER 5xx do backend — pega telas órfãs
 * que as jornadas curadas não cobrem.
 */
const PUBLIC = ['/login', '/signup']
const PROTECTED = ['/dashboard', '/projects/new', '/financial', '/earnings', '/talents', '/portfolio', '/projects/browse']

const slug = (r: string) => r.replace(/\//g, '-').replace(/^-/, '')

async function sweep(page: any, rec: any, routes: string[], prefix: string) {
  for (const route of routes) {
    await page.goto(route)
    await page.waitForLoadState('networkidle').catch(() => {})
    await expect(page.locator('body')).toBeVisible()
    await rec.shoot(`${prefix}-${slug(route)}`)
  }
}

test.describe('Crawler de segurança — páginas carregam sem 5xx', () => {
  test('rotas públicas', async ({ page, rec }) => {
    await sweep(page, rec, PUBLIC, 'pub')
  })

  test('rotas protegidas — empresa', async ({ page, request, rec }) => {
    const c = await registerAndLogin(request, makeCompany())
    await injectAuth(page, c.token, c.user)
    await sweep(page, rec, PROTECTED, 'emp')
  })

  test('rotas protegidas — especialista', async ({ page, request, rec }) => {
    const s = await registerAndLogin(request, makeSpecialist())
    await injectAuth(page, s.token, s.user)
    await sweep(page, rec, PROTECTED, 'esp')
  })
})
