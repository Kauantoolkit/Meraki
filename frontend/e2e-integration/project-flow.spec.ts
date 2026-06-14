import { test, expect } from '@playwright/test'
import { registerAndLogin } from './helpers/api'

const PROJECT_TITLE = 'Sistema de Agendamento E2E'

test.describe('UC: Criar Projeto (RF03)', () => {
  test('company preenche o formulário e cria projeto com milestones via UI', async ({ page }) => {
    const company = {
      name: 'E2E Company',
      email: `e2e-company-${Date.now()}@test.com`,
      password: 'Test1234!',
      userType: 'COMPANY' as const,
    }
    await registerAndLogin(page, company)
    await page.goto('/projects/new', { waitUntil: 'networkidle' })

    // ── Step 1: Configuração Base ────────────────────────────────────────────
    await expect(page.locator('text=Título do Projeto')).toBeVisible({ timeout: 10_000 })

    await page.locator('input[type="text"]').first().fill(PROJECT_TITLE)
    await page.locator('textarea').first().fill('Sistema para gestão de consultas com NestJS e PostgreSQL.')

    await page.getByTestId('cp-next-1').click()

    // ── Step 2: Stack & Requisitos ───────────────────────────────────────────
    await expect(page.locator('text=Adicionar Tecnologia')).toBeVisible({ timeout: 5_000 })
    // Adiciona ao menos uma tecnologia (obrigatório)
    await page.getByTestId('cp-skill-input').fill('NestJS')
    await page.getByTestId('cp-skill-add').click()

    await page.getByTestId('cp-next-2').click()

    // ── Step 3: Milestones ───────────────────────────────────────────────────
    await expect(page.locator('input[placeholder="Nome do Entregável"]').first()).toBeVisible({ timeout: 5_000 })

    await page.locator('input[placeholder="Nome do Entregável"]').nth(0).fill('Módulo de autenticação')
    await page.getByTestId('cp-mamount-0').fill('2000')
    await page.locator('textarea').nth(0).fill('Implementar login e registro de usuários.')

    await page.locator('input[placeholder="Nome do Entregável"]').nth(1).fill('Módulo de agendamento')
    await page.getByTestId('cp-mamount-1').fill('3000')
    await page.locator('textarea').nth(1).fill('CRUD de consultas com regras de conflito de horário.')

    await page.getByTestId('cp-next-3').click()

    // ── Step 4: Orçamento & Prazo ────────────────────────────────────────────
    await expect(page.getByRole('heading', { name: /Orçamento/i })).toBeVisible({ timeout: 5_000 })
    await page.getByTestId('cp-deadline').fill('2027-12-31')

    await page.getByTestId('cp-publish').click()

    // Aguarda publicação
    await expect(page.getByTestId('cp-published')).toBeVisible({ timeout: 15_000 })
  })

  test('projeto aparece no dashboard após criação', async ({ page }) => {
    const company = {
      name: 'E2E Company Dashboard',
      email: `e2e-company-dash-${Date.now()}@test.com`,
      password: 'Test1234!',
      userType: 'COMPANY' as const,
    }
    await registerAndLogin(page, company)
    await page.goto('/projects/new', { waitUntil: 'networkidle' })

    // Step 1
    await expect(page.locator('text=Título do Projeto')).toBeVisible({ timeout: 10_000 })
    await page.locator('input[type="text"]').first().fill(PROJECT_TITLE)
    await page.locator('textarea').first().fill('Descrição do projeto de teste para dashboard.')
    await page.getByTestId('cp-next-1').click()

    // Step 2 — adiciona tecnologia
    await expect(page.locator('text=Adicionar Tecnologia')).toBeVisible({ timeout: 5_000 })
    await page.getByTestId('cp-skill-input').fill('React')
    await page.getByTestId('cp-skill-add').click()
    await page.getByTestId('cp-next-2').click()

    // Step 3 — 1 milestone
    await expect(page.locator('input[placeholder="Nome do Entregável"]').first()).toBeVisible({ timeout: 5_000 })
    await page.locator('input[placeholder="Nome do Entregável"]').nth(0).fill('Entrega única')
    await page.getByTestId('cp-mamount-0').fill('8000')
    await page.locator('textarea').nth(0).fill('Entrega completa do sistema.')
    await page.getByTestId('cp-next-3').click()

    // Step 4
    await expect(page.getByRole('heading', { name: /Orçamento/i })).toBeVisible({ timeout: 5_000 })
    await page.getByTestId('cp-deadline').fill('2027-06-30')
    await page.getByTestId('cp-publish').click()

    await expect(page.getByTestId('cp-published')).toBeVisible({ timeout: 15_000 })

    // Volta ao dashboard e verifica que o projeto aparece
    await page.locator('button:has-text("Voltar ao Painel")').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5_000 })
    await expect(page.locator(`text=${PROJECT_TITLE}`)).toBeVisible({ timeout: 10_000 })
  })
})
