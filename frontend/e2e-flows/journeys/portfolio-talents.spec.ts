import { test, expect } from '../recorder'
import { GATEWAY, makeCompany, makeSpecialist, registerAndLogin, injectAuth } from '../seed'

const auth = (t: string) => ({ headers: { Authorization: `Bearer ${t}` } })

test.describe('Jornada: Portfolio, perfis e talentos (RF12/RF13)', () => {
  test('endpoints de portfolio respondem (200) e telas renderizam sem 5xx', async ({ page, request, rec }) => {
    const s = await registerAndLogin(request, makeSpecialist())
    const c = await registerAndLogin(request, makeCompany())

    // Oráculo API: portfolio responde 200 (antes do fix de entities: 500)
    const specialists = await request.get(`${GATEWAY}/portfolio/specialists`, auth(c.token))
    expect(specialists.ok(), `GET /portfolio/specialists: ${specialists.status()} ${await specialists.text()}`).toBeTruthy()
    const myProfile = await request.get(`${GATEWAY}/portfolio/me`, auth(s.token))
    expect(myProfile.ok(), `GET /portfolio/me: ${myProfile.status()} ${await myProfile.text()}`).toBeTruthy()

    // UI: empresa explora talentos (o recorder falha em qualquer 5xx que a página disparar)
    await injectAuth(page, c.token, c.user)
    await page.goto('/')
    await page.getByRole('link', { name: /TALENTOS/i }).first().click()
    await page.waitForURL(/\/talents/, { timeout: 5_000 })
    await page.waitForLoadState('networkidle').catch(() => {})
    await expect(page.locator('body')).toBeVisible()
    await rec.shoot('explorar-talentos')

    // UI: especialista vê o próprio portfolio
    await injectAuth(page, s.token, s.user)
    await page.goto('/')
    await page.getByRole('link', { name: /PORTFÓLIO/i }).first().click()
    await page.waitForURL(/\/portfolio/, { timeout: 5_000 })
    await page.waitForLoadState('networkidle').catch(() => {})
    await expect(page.locator('body')).toBeVisible()
    await rec.shoot('portfolio-especialista')
  })
})
