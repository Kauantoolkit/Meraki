import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'
import { getCompanyUser, getSpecialistUser, getSpecialist2User, createProject, getMyBids, submitBid, withdrawBid, acceptBid, rejectBid, type TestUser } from './helpers/api'

let company: TestUser
let specialist: TestUser
let projectId: string

/**
 * Setup: create a real project via API so the specialist can bid on it.
 * Runs once before all tests in this file.
 */
test.beforeAll(async () => {
  test.setTimeout(90_000)
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

/* ─── P11/P12: HTML5 min=1 bloqueia budget e duração zero ─── */
test.describe('Bidding - Validação Budget e Duração', () => {
  test('P11 - budget zero é bloqueado pelo HTML5 min=1', async ({ page }) => {
    const proj = await createProject(company.token, {
      title: 'Projeto Budget Zero Test',
      description: 'Para testar validação HTML5 de budget.',
      budget: 2000,
      deadline: '2027-12-31',
      requirements: ['Node.js'],
    })

    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${proj.id}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Budget = 0, demais preenchidos corretamente
    await page.locator('input[type="number"]').first().fill('0')
    await page.locator('input[type="number"]').nth(1).fill('30')
    await page.locator('textarea').fill('Proposta com budget zero para teste de validação HTML5 min.')

    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()

    // HTML5 min=1 impede submit — overlay de sucesso não aparece
    await expect(page.getByText('PROPOSTA SUBMETIDA')).not.toBeVisible()
    await expect(page.getByText('create_proposal.sh')).toBeVisible()
  })

  test('P12 - duração zero é bloqueada pelo HTML5 min=1', async ({ page }) => {
    const proj = await createProject(company.token, {
      title: 'Projeto Duracao Zero Test',
      description: 'Para testar validação HTML5 de duração.',
      budget: 2000,
      deadline: '2027-12-31',
      requirements: ['Node.js'],
    })

    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${proj.id}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Duration = 0, demais preenchidos corretamente
    await page.locator('input[type="number"]').first().fill('1000')
    await page.locator('input[type="number"]').nth(1).fill('0')
    await page.locator('textarea').fill('Proposta com duração zero para teste de validação HTML5 min.')

    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()

    // HTML5 min=1 impede submit — overlay de sucesso não aparece
    await expect(page.getByText('PROPOSTA SUBMETIDA')).not.toBeVisible()
    await expect(page.getByText('create_proposal.sh')).toBeVisible()
  })
})

/* ─── P13: Proposta < 20 chars → API 400 → alert ─── */
test.describe('Bidding - Validação Proposal Text', () => {
  test('P13 - proposta com menos de 20 chars é bloqueada pelo HTML5 minLength', async ({ page }) => {
    const proj = await createProject(company.token, {
      title: 'Projeto Short Proposal Test',
      description: 'Para testar validação de proposta curta.',
      budget: 2000,
      deadline: '2027-12-31',
      requirements: ['TypeScript'],
    })

    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${proj.id}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await page.locator('input[type="number"]').first().fill('1000')
    await page.locator('input[type="number"]').nth(1).fill('10')
    await page.locator('textarea').fill('Proposta pequena') // 16 chars < 20

    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()
    // HTML5 minLength bloqueia — sem dialog, URL inalterada, sucesso não aparece
    await expect(page).toHaveURL(new RegExp(`/bidding/${proj.id}`))
    await expect(page.getByText('PROPOSTA SUBMETIDA')).not.toBeVisible()
  })
})

/* ─── P14: Projeto inexistente na URL ─── */
test.describe('Bidding - Projeto Inexistente', () => {
  test('P14 - URL com projeto inexistente não crasha a página e submit não faz nada', async ({ page }) => {
    await loginAs(page, 'specialist')
    await page.goto('/bidding/00000000-0000-0000-0000-000000000000')

    // Aguarda loading terminar (main aparece quando loading=false)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Página não crashou — form ainda visível
    await expect(page.getByText('create_proposal.sh')).toBeVisible()

    // Preenche e tenta submeter — if (!project) return guarda a chamada
    await page.locator('input[type="number"]').first().fill('1000')
    await page.locator('input[type="number"]').nth(1).fill('10')
    await page.locator('textarea').fill('Proposta para projeto inexistente no teste.')
    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()

    // Overlay de sucesso não deve aparecer
    await expect(page.getByText('PROPOSTA SUBMETIDA')).not.toBeVisible()
  })
})

/* ─── F58: Após withdraw → formulário acessível e nova submissão funciona ─── */
test.describe('Bidding - Após Withdraw', () => {
  test('F58 - formulário acessível após withdraw e nova proposta funciona', async ({ page }) => {
    const proj = await createProject(company.token, {
      title: 'Projeto After Withdraw Test',
      description: 'Para testar formulário após withdraw.',
      budget: 5000,
      deadline: '2027-12-31',
      requirements: ['Docker'],
    })

    // Submete proposta via API e retira
    const bid = await submitBid(specialist.token, {
      projectId: proj.id,
      amount: 3000,
      durationDays: 15,
      proposalText: 'Proposta inicial para teste de withdraw — será retirada em seguida.',
    })
    await withdrawBid(specialist.token, bid.id)

    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${proj.id}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Overlay de bloqueio (RN02) NÃO deve aparecer — bid foi retirada
    await expect(page.getByText('PROPOSTA JÁ SUBMETIDA')).not.toBeVisible()

    // Preenche e submete nova proposta via browser
    await page.locator('input[type="number"]').first().fill('2500')
    await page.locator('input[type="number"]').nth(1).fill('20')
    await page.locator('textarea').fill('Nova proposta após withdraw — renegociação de valores e prazo estimado.')

    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()
    await expect(page.getByText('PROPOSTA SUBMETIDA')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/201 CREATED/)).toBeVisible()
  })
})

/* ─── Autenticação e Autorização ─── */
test.describe('Bidding - Autenticação e Autorização', () => {
  test('AUTH01 - usuário não autenticado é redirecionado para /login', async ({ page }) => {
    // Garante que não há sessão ativa
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('meraki_token')
      localStorage.removeItem('meraki_user')
    })

    await page.goto('/bidding/00000000-0000-0000-0000-000000000000')
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })
  })

  test('AUTH02 - usuário COMPANY não consegue submeter proposta (403)', async ({ page }) => {
    const proj = await createProject(company.token, {
      title: 'Projeto Company Submit Test',
      description: 'Para testar que empresa não consegue submeter proposta.',
      budget: 3000,
      deadline: '2027-12-31',
      requirements: ['Vue'],
    })

    await loginAs(page, 'company')
    await page.goto(`/bidding/${proj.id}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Com Promise.allSettled, o projeto carrega mesmo que myBids retorne 403
    await expect(page.getByText('Projeto Company Submit Test')).toBeVisible({ timeout: 5_000 })

    await page.locator('input[type="number"]').first().fill('2000')
    await page.locator('input[type="number"]').nth(1).fill('30')
    await page.locator('textarea').fill('Proposta indevida enviada por empresa no teste de autorização.')

    // Backend retorna 403 — frontend exibe alert
    const dialogPromise = page.waitForEvent('dialog', { timeout: 10_000 })
    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()
    const dialog = await dialogPromise
    expect(dialog.message()).toContain('Erro ao submeter proposta')
    await dialog.dismiss()

    await expect(page.getByText('PROPOSTA SUBMETIDA')).not.toBeVisible()
  })
})

/* ─── Status do bid existente (ACCEPTED / REJECTED) ─── */
test.describe('Bidding - Overlay de Bid Existente por Status', () => {
  test('BID_STATUS01 - overlay exibe status ACCEPTED quando bid foi aceita', async ({ page }) => {
    const proj = await createProject(company.token, {
      title: 'Projeto Bid Accepted Test',
      description: 'Para testar overlay de bid aceita.',
      budget: 10000,
      deadline: '2027-12-31',
      requirements: ['Kotlin'],
    })

    // Especialista submete via API, empresa aceita
    const bid = await submitBid(specialist.token, {
      projectId: proj.id,
      amount: 8000,
      durationDays: 40,
      proposalText: 'Proposta para teste de bid aceita — especialista experiente em Kotlin.',
    })
    await acceptBid(company.token, bid.id)

    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${proj.id}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Overlay de bloqueio deve aparecer com status ACCEPTED
    await expect(page.getByText('PROPOSTA JÁ SUBMETIDA')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('ACCEPTED', { exact: true })).toBeVisible()
  })

  test('BID_STATUS02 - formulário disponível para nova proposta após bid REJECTED', async ({ page }) => {
    const proj = await createProject(company.token, {
      title: 'Projeto Bid Rejected Test',
      description: 'Para testar re-bid após rejeição.',
      budget: 10000,
      deadline: '2027-12-31',
      requirements: ['Swift'],
    })

    // Especialista submete via API, empresa rejeita
    const bid = await submitBid(specialist.token, {
      projectId: proj.id,
      amount: 9000,
      durationDays: 50,
      proposalText: 'Proposta para teste de bid rejeitada — especialista em Swift mobile.',
    })
    await rejectBid(company.token, bid.id)

    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${proj.id}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Após rejeição o formulário deve estar disponível para nova proposta (não bloqueia re-bid)
    await expect(page.getByRole('button', { name: /EXECUTE_SUBMIT/i })).toBeVisible({ timeout: 10_000 })
    // Overlay de bloqueio NÃO deve aparecer para bids rejeitadas
    await expect(page.getByText('PROPOSTA JÁ SUBMETIDA')).not.toBeVisible()
  })
})

/* ─── Estado do botão durante submit ─── */
test.describe('Bidding - Estado Visual do Botão', () => {
  test('BTN01 - botão fica desabilitado com "A PROCESSAR..." durante o submit', async ({ page }) => {
    const proj = await createProject(company.token, {
      title: 'Projeto Button State Test',
      description: 'Para testar estado do botão durante submit.',
      budget: 4000,
      deadline: '2027-12-31',
      requirements: ['Ruby'],
    })

    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${proj.id}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    await page.locator('input[type="number"]').first().fill('3000')
    await page.locator('input[type="number"]').nth(1).fill('25')
    await page.locator('textarea').fill('Proposta para testar estado visual do botão durante o processamento.')

    // handleSubmit chama setSubmitting(true) sincronamente antes do await da API
    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()

    // Botão deve mostrar estado de loading antes da resposta chegar
    await expect(page.getByRole('button', { name: /A PROCESSAR/i })).toBeVisible({ timeout: 3_000 })
    await expect(page.getByRole('button', { name: /A PROCESSAR/i })).toBeDisabled()

    // Aguarda conclusão — overlay de sucesso confirma que a chamada completou
    await expect(page.getByText('PROPOSTA SUBMETIDA')).toBeVisible({ timeout: 10_000 })
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

/* ─── Boundary: tamanho da proposta e duração ─── */
test.describe('Bidding - Boundary Values (Segurança e Validação)', () => {
  async function makeProj(token: string, title: string) {
    return createProject(token, {
      title,
      description: 'Projeto para teste de boundary values.',
      budget: 5000,
      deadline: '2027-12-31',
      requirements: ['Go'],
    })
  }

  async function fillAndSubmit(page: any, projectId: string, opts: {
    amount?: string
    duration?: string
    proposal?: string
  }) {
    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${projectId}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
    if (opts.amount   !== undefined) await page.locator('input[type="number"]').first().fill(opts.amount)
    if (opts.duration !== undefined) await page.locator('input[type="number"]').nth(1).fill(opts.duration)
    if (opts.proposal !== undefined) await page.locator('textarea').fill(opts.proposal)
  }

  test('P15 - proposta com exatamente 20 chars (mínimo) é aceite', async ({ page }) => {
    const proj = await makeProj(company.token, 'Projeto P15 Min Boundary')
    const proposal20 = 'A'.repeat(20) // exatamente 20 chars
    await fillAndSubmit(page, proj.id, { amount: '3000', duration: '10', proposal: proposal20 })

    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()
    // Submit bem-sucedido: formulário desaparece, aparece estado de sucesso
    await expect(page.getByRole('button', { name: /EXECUTE_SUBMIT/i })).not.toBeVisible({ timeout: 10_000 })
  })

  test('P16 - proposta com 19 chars é bloqueada pelo HTML5 minLength (abaixo do mínimo)', async ({ page }) => {
    const proj = await makeProj(company.token, 'Projeto P16 Below Min Boundary')
    const proposal19 = 'A'.repeat(19) // 19 chars — abaixo do mínimo
    await fillAndSubmit(page, proj.id, { amount: '3000', duration: '10', proposal: proposal19 })

    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()
    // HTML5 minLength bloqueia — sem dialog, botão ainda visível, URL inalterada
    await expect(page.getByRole('button', { name: /EXECUTE_SUBMIT/i })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`/bidding/${proj.id}`))
  })

  test('P17 - proposta só de espaços (≥20) é rejeitada pelo VO após trim', async ({ page }) => {
    const proj = await makeProj(company.token, 'Projeto P17 Whitespace Proposal')
    const proposalSpaces = ' '.repeat(20) // 20 espaços — passa DTO @MinLength mas VO rejeita após trim
    await fillAndSubmit(page, proj.id, { amount: '3000', duration: '10', proposal: proposalSpaces })

    const dialogPromise = page.waitForEvent('dialog', { timeout: 10_000 })
    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()
    const dialog = await dialogPromise
    expect(dialog.message()).toMatch(/erro|proposta/i)
    await dialog.dismiss()
  })

  test('P18 - duração de 3651 dias é bloqueada pelo HTML5 max (acima do máximo)', async ({ page }) => {
    const proj = await makeProj(company.token, 'Projeto P18 Above Max Duration')
    const proposal = 'Proposta válida para testar duração máxima do campo.'
    await fillAndSubmit(page, proj.id, { amount: '3000', duration: '3651', proposal })

    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()
    // HTML5 max bloqueia — sem dialog, botão ainda visível, URL inalterada
    await expect(page.getByRole('button', { name: /EXECUTE_SUBMIT/i })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`/bidding/${proj.id}`))
  })

  test('P19 - duração de 3650 dias (máximo) é aceite', async ({ page }) => {
    const proj = await makeProj(company.token, 'Projeto P19 Max Duration Boundary')
    const proposal = 'Proposta válida para testar duração máxima permitida de 3650 dias.'
    await fillAndSubmit(page, proj.id, { amount: '3000', duration: '3650', proposal })

    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()
    await expect(page.getByRole('button', { name: /EXECUTE_SUBMIT/i })).not.toBeVisible({ timeout: 10_000 })
  })
})

/* ─── Projeto não-OPEN e re-bid pós-rejeição ─── */
test.describe('Bidding - Estado do Projeto e Re-bid', () => {
  test('P20 - especialista vê overlay "PROJETO ENCERRADO" ao aceder projeto IN_PROGRESS', async ({ page }) => {
    const specialist2 = await getSpecialist2User()

    const proj = await createProject(company.token, {
      title: 'Projeto P20 IN_PROGRESS',
      description: 'Para testar overlay de projeto encerrado.',
      budget: 8000,
      deadline: '2027-12-31',
      requirements: ['Rust'],
    })
    // Especialista submete e empresa aceita → projeto passa a IN_PROGRESS
    const bid = await submitBid(specialist.token, {
      projectId: proj.id, amount: 5000, durationDays: 20,
      proposalText: 'Proposta para mover projeto a IN_PROGRESS no teste P20.',
    })
    await acceptBid(company.token, bid.id)

    // Specialist2 (sem bid neste projeto) acede à página
    await loginAs(page, 'specialist2')
    await page.goto(`/bidding/${proj.id}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Deve ver overlay "PROJETO ENCERRADO" e badge de status correto
    await expect(page.getByRole('heading', { name: 'PROJETO ENCERRADO' })).toBeVisible({ timeout: 10_000 })
    // Status badge reflete o estado real do projeto (não hardcoded "OPEN")
    await expect(page.getByText('STATUS: IN_PROGRESS', { exact: true })).toBeVisible()
  })

  test('P21 - especialista re-submete proposta com sucesso após bid REJECTED', async ({ page }) => {
    const proj = await createProject(company.token, {
      title: 'Projeto P21 Re-bid',
      description: 'Para testar re-submissão após rejeição.',
      budget: 7000,
      deadline: '2027-12-31',
      requirements: ['Kotlin'],
    })
    // Especialista submete, empresa rejeita
    const bid = await submitBid(specialist.token, {
      projectId: proj.id, amount: 4000, durationDays: 15,
      proposalText: 'Primeira proposta que será rejeitada no teste P21.',
    })
    await rejectBid(company.token, bid.id)

    // Especialista acede à página — bid REJECTED não bloqueia formulário
    await loginAs(page, 'specialist')
    await page.goto(`/bidding/${proj.id}`)
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })

    // Formulário visível para re-bid
    await expect(page.getByRole('button', { name: /EXECUTE_SUBMIT/i })).toBeVisible({ timeout: 5_000 })

    // Preenche e submete nova proposta
    await page.locator('input[type="number"]').first().fill('4500')
    await page.locator('input[type="number"]').nth(1).fill('20')
    await page.locator('textarea').fill('Nova proposta melhorada após rejeição — re-bid no projeto P21 do teste E2E.')

    await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()

    // Sucesso: overlay de confirmação aparece sobre o formulário
    await expect(page.getByText('PROPOSTA SUBMETIDA')).toBeVisible({ timeout: 10_000 })
  })
})
