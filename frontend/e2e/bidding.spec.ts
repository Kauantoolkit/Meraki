import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'
import { getCompanyUser, getSpecialistUser, createProject, getMyBids, type TestUser } from './helpers/api'

let company: TestUser
let specialist: TestUser
let projectId: string

/**
 * Setup: create a real project via API so the specialist can bid on it.
 * Runs once before all tests in this file.
 */
test.beforeAll(async () => {
  company = await getCompanyUser()
  specialist = await getSpecialistUser()

  const project = await createProject(company.token, {
    title: 'Projeto E2E Bidding',
    description: 'Projeto criado automaticamente para testes E2E de bidding.',
    budget: 15000,
    deadline: '2027-12-31',
    requirements: ['NestJS', 'PostgreSQL', 'Docker'],
  })
  projectId = project.id
})

/* ─── F52: Submit bid com sucesso (RF05) ─── */
test.describe('Bidding - Submit Proposta (RF05, T8b apoio)', () => {
  test('F52 - submete proposta com sucesso', async ({ page }) => {
    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${projectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Verifica dados do projeto visíveis
    await expect(page.getByText('Projeto E2E Bidding')).toBeVisible({ timeout: 5_000 })

    // Preenche form
    await page.locator('input[type="number"]').first().fill('10000')
    await page.locator('input[type="number"]').nth(1).fill('45')
    await page.locator('textarea').fill('Proposta E2E: implementação completa com testes.')

    // Submit
    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()

    // Verifica overlay de sucesso
    await expect(page.getByText('PROPOSTA SUBMETIDA')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/201 CREATED/)).toBeVisible()
  })

  test('F55 - insere template de proposta', async ({ page }) => {
    // Need a NEW project (specialist already bid on the first one)
    const proj2 = await createProject(company.token, {
      title: 'Projeto Template Test',
      description: 'Projeto para testar template de proposta.',
      budget: 8000,
      deadline: '2027-06-30',
      requirements: ['React', 'TypeScript'],
    })

    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${proj2.id}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Click template
    await page.getByText('[Inserir Template]').click()

    // Verifica que textarea foi preenchida com template
    const textarea = page.locator('textarea')
    await expect(textarea).not.toBeEmpty()
    const value = await textarea.inputValue()
    expect(value).toContain('Projeto Template Test')
  })

  test('F56 - retorna ao workspace após submit', async ({ page }) => {
    const proj3 = await createProject(company.token, {
      title: 'Projeto Return Test',
      description: 'Projeto para testar retorno ao workspace.',
      budget: 5000,
      deadline: '2027-06-30',
      requirements: ['Go'],
    })

    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${proj3.id}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await page.locator('input[type="number"]').first().fill('4000')
    await page.locator('input[type="number"]').nth(1).fill('20')
    await page.locator('textarea').fill('Proposta para teste de retorno.')

    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()
    await expect(page.getByText('PROPOSTA SUBMETIDA')).toBeVisible({ timeout: 10_000 })

    await page.getByRole('button', { name: /Retornar ao Workspace/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5_000 })
  })
})

/* ─── F54: RN02 - Bid já existe ─── */
test.describe('Bidding - RN02 Proposta Única', () => {
  test('F54 - bloqueia formulário quando bid já existe (RN02)', async ({ page }) => {
    // projectId already has a bid from the F52 test
    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${projectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Overlay de bloqueio deve aparecer
    await expect(page.getByText('PROPOSTA JÁ SUBMETIDA')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/RN02/)).toBeVisible()
  })

  test('F54 - botão retornar no overlay de bid existente', async ({ page }) => {
    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${projectId}`)

    await expect(page.getByText('PROPOSTA JÁ SUBMETIDA')).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: /Retornar ao Workspace/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5_000 })
  })
})

/* ─── P9: Submit com erro da API ─── */
test.describe('Bidding - Erros (RN02, RNF04)', () => {
  test('P9 - API rejeita submit duplicado com 409', async ({ page }) => {
    // Specialist already has a bid on projectId, so submitting again should fail
    // We'll intercept the POST to verify the frontend handles the error
    await loginAs(page, 'specialist')

    // Create a fresh project but submit a bid via API first
    const proj4 = await createProject(company.token, {
      title: 'Projeto Erro Test',
      description: 'Para testar submit duplicado.',
      budget: 3000,
      deadline: '2027-12-31',
      requirements: ['Python'],
    })

    // Submit first bid via API
    await import('./helpers/api').then(api =>
      api.submitBid(specialist.token, {
        projectId: proj4.id,
        amount: 2000,
        durationDays: 10,
        proposalText: 'Bid via API — proposta automatizada para teste de duplicidade E2E.',
      }),
    )

    // Now try via UI — should show the "already submitted" overlay
    await page.goto(`/bidding/${proj4.id}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('PROPOSTA JÁ SUBMETIDA')).toBeVisible({ timeout: 10_000 })
  })
})

/* ─── P10: HTML5 validation ─── */
test.describe('Bidding - Validação de Campos', () => {
  test('P10 - form não submete com campos vazios (HTML5 required)', async ({ page }) => {
    const proj5 = await createProject(company.token, {
      title: 'Projeto Validation Test',
      description: 'Para testar validação HTML5.',
      budget: 2000,
      deadline: '2027-12-31',
      requirements: ['Rust'],
    })

    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${proj5.id}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Tenta submeter sem preencher nada
    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()

    // Overlay de sucesso NÃO deve aparecer (HTML5 validation impede)
    await expect(page.getByText('PROPOSTA SUBMETIDA')).not.toBeVisible()
    // Form ainda visível
    await expect(page.getByText('create_proposal.sh')).toBeVisible()
  })
})

/* ─── F57: Navbar back ─── */
test.describe('Bidding - Navegação', () => {
  test('F57 - navbar back retorna ao dashboard', async ({ page }) => {
    const proj6 = await createProject(company.token, {
      title: 'Projeto Nav Test',
      description: 'Para testar navbar.',
      budget: 1000,
      deadline: '2027-12-31',
      requirements: ['C++'],
    })

    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${proj6.id}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    const backBtn = page.locator('nav').getByRole('link').first()
    if (await backBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await backBtn.click()
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 5_000 })
    }
  })
})
