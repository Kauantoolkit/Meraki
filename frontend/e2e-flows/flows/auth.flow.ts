import { expect } from '../recorder'
import type { FlowGraph } from '../graph'

const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e4)}`

/**
 * Grafo de Autenticação.
 * Telas: login, signup, dashboard-empresa, erro-login.
 * Acíclico — cada jornada é um caminho que prova um caso de uso (RF01/RF02).
 */
export const authGraph: FlowGraph = {
  nodes: {
    login: {
      id: 'login',
      assert: async ({ page }) => {
        await expect(page.getByTestId('login-submit')).toBeVisible()
      },
    },
    signup: {
      id: 'signup',
      assert: async ({ page }) => {
        await expect(page.getByTestId('signup-submit')).toBeVisible()
      },
    },
    'dashboard-empresa': {
      id: 'dashboard-empresa',
      assert: async ({ page }) => {
        await expect(page.getByText('Meus Projetos')).toBeVisible({ timeout: 15_000 })
      },
    },
    'erro-login': {
      id: 'erro-login',
      assert: async ({ page }) => {
        await expect(page.getByTestId('login-error')).toContainText(/inválid/i)
      },
    },
  },
  edges: [
    {
      from: 'login',
      to: 'signup',
      label: 'abrir-tela-de-cadastro',
      action: async ({ page }) => {
        await page.getByRole('button', { name: /solicitar registro/i }).click()
      },
    },
    {
      from: 'signup',
      to: 'dashboard-empresa',
      label: 'cadastrar-empresa',
      action: async ({ page, store }) => {
        const email = `flow-signup-${uniq()}@meraki.test`
        store.company = { name: 'Flow Corp', email, password: 'Test1234!' }
        await page.getByTestId('signup-type-company').click()
        await page.getByTestId('signup-name').fill(store.company.name)
        await page.getByTestId('signup-email').fill(email)
        await page.getByTestId('signup-password').fill(store.company.password)
        await page.getByTestId('signup-submit').click()
      },
    },
    {
      from: 'login',
      to: 'dashboard-empresa',
      label: 'login-empresa',
      action: async ({ page, store }) => {
        await page.getByTestId('login-email').fill(store.company.email)
        await page.getByTestId('login-password').fill(store.company.password)
        await page.getByTestId('login-submit').click()
      },
    },
    {
      from: 'login',
      to: 'erro-login',
      label: 'login-credenciais-invalidas',
      action: async ({ page }) => {
        await page.getByTestId('login-email').fill(`naoexiste-${uniq()}@meraki.test`)
        await page.getByTestId('login-password').fill('SenhaErrada123!')
        await page.getByTestId('login-submit').click()
      },
    },
  ],
}
