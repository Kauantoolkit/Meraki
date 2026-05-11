# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bidding.spec.ts >> Bidding - Submit Proposta (RF05, T8b apoio) >> F55 - insere template de proposta
- Location: e2e\bidding.spec.ts:50:3

# Error details

```
Error: expect(locator).not.toBeEmpty() failed

Locator:  locator('textarea')
Expected: not empty
Received: empty
Timeout:  5000ms

Call log:
  - Expect "not toBeEmpty" with timeout 5000ms
  - waiting for locator('textarea')
    9 × locator resolved to <textarea required="" placeholder="Apresente a sua proposta técnica..." class="editor-textarea w-full pl-10 pr-2 py-2 bg-transparent text-sm font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none h-64"></textarea>
      - unexpected value "empty"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - button [ref=e8] [cursor=pointer]:
          - img [ref=e9]
        - generic [ref=e12] [cursor=pointer]:
          - img [ref=e14]
          - generic [ref=e17]: Meraki
        - generic [ref=e19]: MERAKI // BIDDING_TERMINAL
      - generic [ref=e20]:
        - button "ESPECIALISTA" [ref=e21] [cursor=pointer]
        - button "PORTFÓLIO" [ref=e22] [cursor=pointer]
        - button "KANBAN" [ref=e23] [cursor=pointer]
        - button "INBOX" [ref=e24] [cursor=pointer]
        - button "GANHOS" [ref=e25] [cursor=pointer]
        - button "EVENTOS" [ref=e26] [cursor=pointer]
        - button "SUPORTE" [ref=e27] [cursor=pointer]
        - button "SETTINGS" [ref=e28] [cursor=pointer]
      - generic [ref=e32] [cursor=pointer]:
        - generic [ref=e33]:
          - paragraph [ref=e34]: Dev E2E
          - paragraph [ref=e35]: Especialista
        - img [ref=e37]
  - main [ref=e40]:
    - generic [ref=e41]:
      - generic [ref=e43]:
        - generic [ref=e46]:
          - generic [ref=e47]: "REF:"
          - generic [ref=e48]: "STATUS: OPEN"
        - generic [ref=e50]:
          - img [ref=e52]
          - generic [ref=e56]:
            - paragraph [ref=e57]: Cliente
            - paragraph [ref=e58]: Empresa
        - heading [level=1]
        - paragraph
        - generic [ref=e59]:
          - generic [ref=e60]:
            - generic [ref=e61]:
              - img [ref=e62]
              - paragraph [ref=e67]: Orçamento Máximo
            - paragraph [ref=e68]: —
          - generic [ref=e69]:
            - generic [ref=e70]:
              - img [ref=e71]
              - paragraph [ref=e75]: Data Limite
            - paragraph [ref=e76]: —
      - generic [ref=e78]:
        - generic [ref=e80]:
          - img [ref=e81]
          - generic [ref=e86]: create_proposal.sh
        - generic [ref=e91]:
          - generic [ref=e92]:
            - generic [ref=e93]:
              - generic [ref=e94]: const proposedBudget =
              - generic [ref=e95]:
                - generic:
                  - generic: R$
                - spinbutton [ref=e96]
              - paragraph [ref=e97]: // Taxa de plataforma será retida no pagamento.
            - generic [ref=e98]:
              - generic [ref=e99]: let estimatedDays =
              - generic [ref=e100]:
                - spinbutton [ref=e101]
                - generic:
                  - generic: DIAS
          - generic [ref=e102]:
            - generic [ref=e103]:
              - generic [ref=e104]: "function writeCoverLetter() {"
              - button "[Inserir Template]" [active] [ref=e105] [cursor=pointer]
            - generic [ref=e106]:
              - generic [ref=e107]:
                - generic [ref=e108]: "1"
                - generic [ref=e109]: "2"
                - generic [ref=e110]: "3"
                - generic [ref=e111]: "4"
                - generic [ref=e112]: "5"
                - generic [ref=e113]: "6"
                - generic [ref=e114]: "7"
                - generic [ref=e115]: "8"
              - textbox "Apresente a sua proposta técnica..." [ref=e116]
            - generic [ref=e117]: "}"
          - generic [ref=e118]:
            - generic [ref=e119]:
              - img [ref=e120]
              - generic [ref=e122]: A proposta ficará invisível para concorrentes.
            - button "EXECUTE_SUBMIT()" [ref=e123] [cursor=pointer]:
              - img [ref=e124]
              - generic [ref=e127]: EXECUTE_SUBMIT()
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import { loginAs } from './helpers/auth'
  3   | import { getCompanyUser, getSpecialistUser, createProject, getMyBids, type TestUser } from './helpers/api'
  4   | 
  5   | let company: TestUser
  6   | let specialist: TestUser
  7   | let projectId: string
  8   | 
  9   | /**
  10  |  * Setup: create a real project via API so the specialist can bid on it.
  11  |  * Runs once before all tests in this file.
  12  |  */
  13  | test.beforeAll(async () => {
  14  |   company = await getCompanyUser()
  15  |   specialist = await getSpecialistUser()
  16  | 
  17  |   const project = await createProject(company.token, {
  18  |     title: 'Projeto E2E Bidding',
  19  |     description: 'Projeto criado automaticamente para testes E2E de bidding.',
  20  |     budget: 15000,
  21  |     deadline: '2027-12-31',
  22  |     requirements: ['NestJS', 'PostgreSQL', 'Docker'],
  23  |   })
  24  |   projectId = project.id
  25  | })
  26  | 
  27  | /* ─── F52: Submit bid com sucesso (RF05) ─── */
  28  | test.describe('Bidding - Submit Proposta (RF05, T8b apoio)', () => {
  29  |   test('F52 - submete proposta com sucesso', async ({ page }) => {
  30  |     await loginAs(page, 'specialist')
  31  |     await page.goto(`/bidding/${projectId}`)
  32  |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  33  | 
  34  |     // Verifica dados do projeto visíveis
  35  |     await expect(page.getByText('Projeto E2E Bidding')).toBeVisible({ timeout: 5_000 })
  36  | 
  37  |     // Preenche form
  38  |     await page.locator('input[type="number"]').first().fill('10000')
  39  |     await page.locator('input[type="number"]').nth(1).fill('45')
  40  |     await page.locator('textarea').fill('Proposta E2E: implementação completa com testes.')
  41  | 
  42  |     // Submit
  43  |     await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()
  44  | 
  45  |     // Verifica overlay de sucesso
  46  |     await expect(page.getByText('PROPOSTA SUBMETIDA')).toBeVisible({ timeout: 10_000 })
  47  |     await expect(page.getByText(/201 CREATED/)).toBeVisible()
  48  |   })
  49  | 
  50  |   test('F55 - insere template de proposta', async ({ page }) => {
  51  |     // Need a NEW project (specialist already bid on the first one)
  52  |     const proj2 = await createProject(company.token, {
  53  |       title: 'Projeto Template Test',
  54  |       description: 'Projeto para testar template de proposta.',
  55  |       budget: 8000,
  56  |       deadline: '2027-06-30',
  57  |       requirements: ['React', 'TypeScript'],
  58  |     })
  59  | 
  60  |     await loginAs(page, 'specialist')
  61  |     await page.goto(`/bidding/${proj2.id}`)
  62  |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  63  | 
  64  |     // Click template
  65  |     await page.getByText('[Inserir Template]').click()
  66  | 
  67  |     // Verifica que textarea foi preenchida com template
  68  |     const textarea = page.locator('textarea')
> 69  |     await expect(textarea).not.toBeEmpty()
      |                                ^ Error: expect(locator).not.toBeEmpty() failed
  70  |     const value = await textarea.inputValue()
  71  |     expect(value).toContain('Projeto Template Test')
  72  |   })
  73  | 
  74  |   test('F56 - retorna ao workspace após submit', async ({ page }) => {
  75  |     const proj3 = await createProject(company.token, {
  76  |       title: 'Projeto Return Test',
  77  |       description: 'Projeto para testar retorno ao workspace.',
  78  |       budget: 5000,
  79  |       deadline: '2027-06-30',
  80  |       requirements: ['Go'],
  81  |     })
  82  | 
  83  |     await loginAs(page, 'specialist')
  84  |     await page.goto(`/bidding/${proj3.id}`)
  85  |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  86  | 
  87  |     await page.locator('input[type="number"]').first().fill('4000')
  88  |     await page.locator('input[type="number"]').nth(1).fill('20')
  89  |     await page.locator('textarea').fill('Proposta para teste de retorno.')
  90  | 
  91  |     await page.getByRole('button', { name: /EXECUTE_SUBMIT/i }).click()
  92  |     await expect(page.getByText('PROPOSTA SUBMETIDA')).toBeVisible({ timeout: 10_000 })
  93  | 
  94  |     await page.getByRole('button', { name: /Retornar ao Workspace/i }).click()
  95  |     await expect(page).toHaveURL(/\/dashboard/, { timeout: 5_000 })
  96  |   })
  97  | })
  98  | 
  99  | /* ─── F54: RN02 - Bid já existe ─── */
  100 | test.describe('Bidding - RN02 Proposta Única', () => {
  101 |   test('F54 - bloqueia formulário quando bid já existe (RN02)', async ({ page }) => {
  102 |     // projectId already has a bid from the F52 test
  103 |     await loginAs(page, 'specialist')
  104 |     await page.goto(`/bidding/${projectId}`)
  105 |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  106 | 
  107 |     // Overlay de bloqueio deve aparecer
  108 |     await expect(page.getByText('PROPOSTA JÁ SUBMETIDA')).toBeVisible({ timeout: 10_000 })
  109 |     await expect(page.getByText(/RN02/)).toBeVisible()
  110 |   })
  111 | 
  112 |   test('F54 - botão retornar no overlay de bid existente', async ({ page }) => {
  113 |     await loginAs(page, 'specialist')
  114 |     await page.goto(`/bidding/${projectId}`)
  115 | 
  116 |     await expect(page.getByText('PROPOSTA JÁ SUBMETIDA')).toBeVisible({ timeout: 10_000 })
  117 |     await page.getByRole('button', { name: /Retornar ao Workspace/i }).click()
  118 |     await expect(page).toHaveURL(/\/dashboard/, { timeout: 5_000 })
  119 |   })
  120 | })
  121 | 
  122 | /* ─── P9: Submit com erro da API ─── */
  123 | test.describe('Bidding - Erros (RN02, RNF04)', () => {
  124 |   test('P9 - API rejeita submit duplicado com 409', async ({ page }) => {
  125 |     // Specialist already has a bid on projectId, so submitting again should fail
  126 |     // We'll intercept the POST to verify the frontend handles the error
  127 |     await loginAs(page, 'specialist')
  128 | 
  129 |     // Create a fresh project but submit a bid via API first
  130 |     const proj4 = await createProject(company.token, {
  131 |       title: 'Projeto Erro Test',
  132 |       description: 'Para testar submit duplicado.',
  133 |       budget: 3000,
  134 |       deadline: '2027-12-31',
  135 |       requirements: ['Python'],
  136 |     })
  137 | 
  138 |     // Submit first bid via API
  139 |     await import('./helpers/api').then(api =>
  140 |       api.submitBid(specialist.token, {
  141 |         projectId: proj4.id,
  142 |         amount: 2000,
  143 |         durationDays: 10,
  144 |         proposalText: 'Bid via API',
  145 |       }),
  146 |     )
  147 | 
  148 |     // Now try via UI — should show the "already submitted" overlay
  149 |     await page.goto(`/bidding/${proj4.id}`)
  150 |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  151 |     await expect(page.getByText('PROPOSTA JÁ SUBMETIDA')).toBeVisible({ timeout: 10_000 })
  152 |   })
  153 | })
  154 | 
  155 | /* ─── P10: HTML5 validation ─── */
  156 | test.describe('Bidding - Validação de Campos', () => {
  157 |   test('P10 - form não submete com campos vazios (HTML5 required)', async ({ page }) => {
  158 |     const proj5 = await createProject(company.token, {
  159 |       title: 'Projeto Validation Test',
  160 |       description: 'Para testar validação HTML5.',
  161 |       budget: 2000,
  162 |       deadline: '2027-12-31',
  163 |       requirements: ['Rust'],
  164 |     })
  165 | 
  166 |     await loginAs(page, 'specialist')
  167 |     await page.goto(`/bidding/${proj5.id}`)
  168 |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  169 | 
```