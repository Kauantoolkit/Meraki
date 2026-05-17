# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: financial-payments.spec.ts >> Financeiro - Company View (RF10, T10b) >> F85-ledger - exibe livro-razão de transações
- Location: e2e\financial-payments.spec.ts:41:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e8] [cursor=pointer]:
        - img [ref=e10]
        - generic [ref=e13]: Meraki
      - generic [ref=e14]:
        - button "EMPRESA" [ref=e15] [cursor=pointer]
        - button "TALENTOS" [ref=e16] [cursor=pointer]
        - button "KANBAN" [ref=e17] [cursor=pointer]
        - button "INBOX" [ref=e18] [cursor=pointer]
        - button "FINANCEIRO" [ref=e19] [cursor=pointer]
        - button "EVENTOS" [ref=e20] [cursor=pointer]
        - button "SUPORTE" [ref=e21] [cursor=pointer]
        - button "SETTINGS" [ref=e22] [cursor=pointer]
        - button "ADMIN" [ref=e23] [cursor=pointer]
      - generic [ref=e27] [cursor=pointer]:
        - generic [ref=e28]:
          - paragraph [ref=e29]: Empresa E2E
          - paragraph [ref=e30]: Empresa
        - img [ref=e32]
  - main [ref=e36]:
    - generic [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e41]: Payment Service // Online
        - heading "Gestão de Fundo de Garantia" [level=1] [ref=e42]
        - paragraph [ref=e43]: Controlo de depósitos de Escrow e a liberação de pagamentos por Milestone.
      - generic [ref=e44]:
        - button "Exportar CSV" [ref=e45] [cursor=pointer]:
          - img [ref=e46]
          - text: Exportar CSV
        - button "APORTAR FUNDOS" [ref=e49] [cursor=pointer]
    - generic [ref=e50]:
      - generic [ref=e51]:
        - generic [ref=e53]:
          - generic [ref=e54]: Saldo Retido (Escrow)
          - img [ref=e55]
        - text: R$ 0,00
        - paragraph [ref=e58]: Em custódia pelo sistema
      - generic [ref=e59]:
        - generic [ref=e60]:
          - generic [ref=e61]: Total Liberado (Fund)
          - img [ref=e62]
        - text: R$ 0,00
        - paragraph [ref=e65]: Milestones aprovados
      - generic [ref=e66]:
        - generic [ref=e67]:
          - generic [ref=e68]: Aguardando Utilização
          - img [ref=e69]
        - text: R$ 0,00
        - paragraph [ref=e72]: A aguardar milestone
    - generic [ref=e73]:
      - generic [ref=e75]:
        - generic [ref=e76]:
          - generic [ref=e77]:
            - img [ref=e78]
            - heading "Livro-Razão de Transações" [level=2] [ref=e81]
          - button "Filtrar" [ref=e82] [cursor=pointer]:
            - img [ref=e83]
            - text: Filtrar
        - generic [ref=e85]: Nenhuma transação registada.
      - generic [ref=e87]:
        - heading "Ações Pendentes" [level=2] [ref=e90]
        - generic [ref=e91]:
          - generic [ref=e92]:
            - img [ref=e93]
            - paragraph [ref=e96]: Nenhuma ação pendente
            - paragraph [ref=e97]: Todas as milestones estão em dia.
          - generic [ref=e98]:
            - generic [ref=e100]: PRÉ-VISUALIZAÇÃO
            - paragraph [ref=e101]: "Autorizar Pagamento: Módulo de Rastreamento"
            - generic [ref=e102]:
              - generic [ref=e103]:
                - generic [ref=e104]: "Especialista:"
                - generic [ref=e105]: Kauan Silva
              - generic [ref=e106]:
                - generic [ref=e107]: "Valor:"
                - generic [ref=e108]: R$ 8.000,00
              - generic [ref=e109]:
                - generic [ref=e110]: "Taxa (M1):"
                - generic [ref=e111]: R$ 400,00
            - button "APROVAR RELEASE" [disabled] [ref=e112]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import { loginAs } from './helpers/auth'
  3   | import {
  4   |   getCompanyUser,
  5   |   getSpecialistUser,
  6   |   createProject,
  7   |   getMilestones,
  8   |   startMilestone,
  9   |   submitDelivery,
  10  |   approveMilestone,
  11  |   submitBid,
  12  |   apiRequest,
  13  |   type TestUser,
  14  | } from './helpers/api'
  15  | 
  16  | let company: TestUser
  17  | let specialist: TestUser
  18  | 
  19  | test.beforeAll(async () => {
  20  |   company = await getCompanyUser()
  21  |   specialist = await getSpecialistUser()
  22  | })
  23  | 
  24  | /* ═══════════════════════════════════════════
  25  |    FINANCEIRO - Empresa (T10b, RF10, RN05)
  26  |    ═══════════════════════════════════════════ */
  27  | test.describe('Financeiro - Company View (RF10, T10b)', () => {
  28  |   test('F85-render - renderiza página financeira', async ({ page }) => {
  29  |     await loginAs(page, 'company')
  30  |     await page.goto('/financial')
  31  |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  32  | 
  33  |     // Header
  34  |     await expect(page.getByText('Gestão de Fundo de Garantia')).toBeVisible({ timeout: 5_000 })
  35  | 
  36  |     // Stats cards
  37  |     await expect(page.getByText('Saldo Retido (Escrow)')).toBeVisible()
  38  |     await expect(page.getByText('Total Liberado (Fund)')).toBeVisible()
  39  |   })
  40  | 
  41  |   test('F85-ledger - exibe livro-razão de transações', async ({ page }) => {
  42  |     await loginAs(page, 'company')
  43  |     await page.goto('/financial')
  44  |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  45  | 
  46  |     await expect(page.getByText(/Livro-Razão de Transações/i)).toBeVisible()
  47  | 
  48  |     // Pode ter transações (com header TX_ID) ou estar vazio
  49  |     const hasHeader = await page.getByText('TX_ID').isVisible({ timeout: 2_000 }).catch(() => false)
  50  |     const isEmpty = await page.getByText(/Nenhuma transação registada/i).isVisible({ timeout: 2_000 }).catch(() => false)
> 51  |     expect(hasHeader || isEmpty).toBeTruthy()
      |                                  ^ Error: expect(received).toBeTruthy()
  52  |   })
  53  | 
  54  |   test('F85-buttons - botões de exportar e aportar visíveis', async ({ page }) => {
  55  |     await loginAs(page, 'company')
  56  |     await page.goto('/financial')
  57  |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  58  | 
  59  |     await expect(page.getByText('Exportar CSV')).toBeVisible()
  60  |     await expect(page.getByText('APORTAR FUNDOS')).toBeVisible()
  61  |   })
  62  | 
  63  |   test('F85-pending - exibe seção ações pendentes', async ({ page }) => {
  64  |     await loginAs(page, 'company')
  65  |     await page.goto('/financial')
  66  |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  67  | 
  68  |     await expect(page.getByText('Ações Pendentes')).toBeVisible()
  69  |   })
  70  | })
  71  | 
  72  | /* ═══════════════════════════════════════════
  73  |    GANHOS ESPECIALISTA (T10b, RF10)
  74  |    ═══════════════════════════════════════════ */
  75  | test.describe('Ganhos Especialista (RF10, T10b)', () => {
  76  |   test('F87-render - renderiza dashboard de ganhos', async ({ page }) => {
  77  |     await loginAs(page, 'specialist')
  78  |     await page.goto('/earnings')
  79  |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  80  | 
  81  |     await expect(page.getByText('Dashboard de Ganhos')).toBeVisible({ timeout: 5_000 })
  82  | 
  83  |     // Stats cards
  84  |     await expect(page.getByText('Saldo Disponível')).toBeVisible()
  85  |     await expect(page.getByText('Em Escrow (Seguro)')).toBeVisible()
  86  |     await expect(page.getByText('Ganhos Totais (Ano)')).toBeVisible()
  87  |   })
  88  | 
  89  |   test('F87-extrato - exibe extrato detalhado', async ({ page }) => {
  90  |     await loginAs(page, 'specialist')
  91  |     await page.goto('/earnings')
  92  |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  93  | 
  94  |     await expect(page.getByText('Extrato Detalhado')).toBeVisible()
  95  | 
  96  |     // Pode ter transações reais ou estar vazio
  97  |     const hasTransactions = await page.getByText('RELEASED').isVisible({ timeout: 2_000 }).catch(() => false)
  98  |     const isEmpty = await page.getByText(/Nenhum pagamento recebido/i).isVisible({ timeout: 2_000 }).catch(() => false)
  99  |     expect(hasTransactions || isEmpty).toBeTruthy()
  100 |   })
  101 | 
  102 |   test('F87-saque - botão solicitar saque visível', async ({ page }) => {
  103 |     await loginAs(page, 'specialist')
  104 |     await page.goto('/earnings')
  105 |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  106 | 
  107 |     await expect(page.getByText('Solicitar Saque')).toBeVisible()
  108 |   })
  109 | })
  110 | 
  111 | /* ═══════════════════════════════════════════
  112 |    KANBAN - Board básico (T10b, RF08, RF09, RN04)
  113 |    ═══════════════════════════════════════════ */
  114 | test.describe('Kanban - Board Rendering', () => {
  115 |   let kanbanProjectId: string
  116 | 
  117 |   test.beforeAll(async () => {
  118 |     // Create project with milestones for Kanban tests
  119 |     const project = await createProject(company.token, {
  120 |       title: 'Projeto Kanban E2E',
  121 |       description: 'Projeto com milestones para testar Kanban.',
  122 |       budget: 9000,
  123 |       deadline: '2027-12-31',
  124 |       requirements: ['NestJS', 'React'],
  125 |       milestones: [
  126 |         { title: 'Setup Inicial', description: 'Configuração do ambiente', amount: 3000 },
  127 |         { title: 'Core Features', description: 'Desenvolvimento principal', amount: 3000 },
  128 |         { title: 'Testes Finais', description: 'Testes e deploy', amount: 3000 },
  129 |       ],
  130 |     })
  131 |     kanbanProjectId = project.id
  132 | 
  133 |     // Assign specialist: submit + accept bid
  134 |     const bid = await submitBid(specialist.token, {
  135 |       projectId: kanbanProjectId,
  136 |       amount: 8000,
  137 |       durationDays: 60,
  138 |       proposalText: 'Proposta para Kanban E2E test.',
  139 |     })
  140 |     await apiRequest(`/bids/${bid.id}/accept`, { method: 'PUT', token: company.token })
  141 |   })
  142 | 
  143 |   test('F65 - redirect para dashboard quando sem projectId', async ({ page }) => {
  144 |     await loginAs(page, 'company')
  145 |     await page.goto('/kanban')
  146 |     await expect(page).toHaveURL(/\/dashboard/, { timeout: 5_000 })
  147 |   })
  148 | 
  149 |   test('F68 - board carrega com milestones do projeto', async ({ page }) => {
  150 |     await loginAs(page, 'company')
  151 |     await page.goto(`/kanban/${kanbanProjectId}`)
```