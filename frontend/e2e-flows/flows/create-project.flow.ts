import { expect } from '../recorder'
import type { FlowGraph } from '../graph'

/**
 * Grafo de Criação de Projeto (RF03), wizard de 4 passos:
 * base → stack → milestones → orçamento → publicado.
 * Dirige a UI real; o POST /projects + POST /projects/:id/milestones acontecem no backend real.
 */
export const createProjectGraph: FlowGraph = {
  nodes: {
    'cp-base': {
      id: 'cp-base',
      assert: async ({ page }) => {
        await expect(page.getByTestId('cp-title')).toBeVisible()
      },
    },
    'cp-stack': {
      id: 'cp-stack',
      assert: async ({ page }) => {
        await expect(page.getByTestId('cp-skill-input')).toBeVisible()
      },
    },
    'cp-milestones': {
      id: 'cp-milestones',
      assert: async ({ page }) => {
        await expect(page.getByTestId('cp-mtitle-0')).toBeVisible()
      },
    },
    'cp-orcamento': {
      id: 'cp-orcamento',
      assert: async ({ page }) => {
        await expect(page.getByTestId('cp-budget')).toBeVisible()
      },
    },
    'cp-publicado': {
      id: 'cp-publicado',
      assert: async ({ page }) => {
        await expect(page.getByTestId('cp-published')).toBeVisible({ timeout: 15_000 })
      },
    },
  },
  edges: [
    {
      from: 'cp-base',
      to: 'cp-stack',
      label: 'preencher-base',
      action: async ({ page, store }) => {
        store.projectTitle = `Projeto de Fluxo Meraki ${Date.now()}`
        await page.getByTestId('cp-title').fill(store.projectTitle)
        await page.getByTestId('cp-description').fill('Descrição detalhada do projeto de teste de fluxo automatizado ponta a ponta.')
        await page.getByTestId('cp-next-1').click()
      },
    },
    {
      from: 'cp-stack',
      to: 'cp-milestones',
      label: 'confirmar-stack',
      action: async ({ page }) => {
        // o usuário precisa adicionar pelo menos uma tecnologia (não há mais default)
        await page.getByTestId('cp-skill-input').fill('NestJS')
        await page.getByTestId('cp-skill-add').click()
        await page.getByTestId('cp-next-2').click()
      },
    },
    {
      from: 'cp-milestones',
      to: 'cp-orcamento',
      label: 'definir-milestone',
      action: async ({ page, store }) => {
        store.milestoneAmount = 9000
        await page.getByTestId('cp-mtitle-0').fill('Setup e arquitetura base')
        await page.getByTestId('cp-mamount-0').fill(String(store.milestoneAmount))
        await page.getByTestId('cp-next-3').click()
      },
    },
    {
      from: 'cp-orcamento',
      to: 'cp-publicado',
      label: 'publicar-projeto',
      action: async ({ page, store }) => {
        await page.getByTestId('cp-budget').fill(String(store.milestoneAmount))
        await page.getByTestId('cp-deadline').fill('2027-12-31')
        await page.getByTestId('cp-publish').click()
      },
    },
  ],
}
