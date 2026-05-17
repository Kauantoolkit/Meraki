# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: financial-payments.spec.ts >> Ganhos Especialista (RF10, T10b) >> F87-extrato - exibe extrato detalhado
- Location: e2e\financial-payments.spec.ts:89:3

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
        - button "ESPECIALISTA" [ref=e15] [cursor=pointer]
        - button "PORTFÓLIO" [ref=e16] [cursor=pointer]
        - button "KANBAN" [ref=e17] [cursor=pointer]
        - button "INBOX" [ref=e18] [cursor=pointer]
        - button "GANHOS" [ref=e19] [cursor=pointer]
        - button "EVENTOS" [ref=e20] [cursor=pointer]
        - button "SUPORTE" [ref=e21] [cursor=pointer]
        - button "SETTINGS" [ref=e22] [cursor=pointer]
      - generic [ref=e26] [cursor=pointer]:
        - generic [ref=e27]:
          - paragraph [ref=e28]: Dev E2E
          - paragraph [ref=e29]: Especialista
        - img [ref=e31]
  - main [ref=e34]:
    - generic [ref=e35]:
      - generic [ref=e36]:
        - generic [ref=e39]: Wallet // Online
        - heading "Dashboard de Ganhos" [level=1] [ref=e40]
        - paragraph [ref=e41]: Visão analítica de fluxo de caixa e saldos disponíveis.
      - button "Solicitar Saque" [ref=e42] [cursor=pointer]:
        - text: Solicitar Saque
        - img [ref=e43]
    - generic [ref=e45]:
      - generic [ref=e46]:
        - generic [ref=e48]:
          - generic [ref=e49]: Saldo Disponível
          - img [ref=e50]
        - text: R$ 0,00
        - paragraph [ref=e53]: + Último release hoje
      - generic [ref=e54]:
        - generic [ref=e55]:
          - generic [ref=e56]: Em Escrow (Seguro)
          - img [ref=e57]
        - text: R$ 0,00
        - paragraph [ref=e60]: A aguardar entrega (Milestones)
      - generic [ref=e61]:
        - generic [ref=e62]:
          - generic [ref=e63]: Ganhos Totais (Ano)
          - img [ref=e64]
        - text: R$ 0,00
        - paragraph [ref=e67]: Total taxas deduzidas
    - generic [ref=e68]:
      - generic [ref=e69]:
        - img [ref=e70]
        - heading "Extrato Detalhado" [level=2] [ref=e73]
      - generic [ref=e74]:
        - generic [ref=e75]: Data/Hora
        - generic [ref=e76]: Transação ID
        - generic [ref=e77]: Descrição
        - generic [ref=e78]: Valor Líquido
        - generic [ref=e79]: Estado
      - generic [ref=e80]: Nenhum pagamento recebido ainda.
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
  51  |     expect(hasHeader || isEmpty).toBeTruthy()
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
> 99  |     expect(hasTransactions || isEmpty).toBeTruthy()
      |                                        ^ Error: expect(received).toBeTruthy()
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
  152 |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  153 | 
  154 |     // Project title or milestones should be visible
  155 |     await expect(page.getByText('Projeto Kanban E2E')).toBeVisible({ timeout: 5_000 })
  156 |   })
  157 | 
  158 |   test('F66 - specialist vê milestones no kanban', async ({ page }) => {
  159 |     await loginAs(page, 'specialist')
  160 |     await page.goto(`/kanban/${kanbanProjectId}`)
  161 |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  162 | 
  163 |     // At least one milestone should be visible
  164 |     await expect(page.getByText('Setup Inicial')).toBeVisible({ timeout: 5_000 })
  165 |   })
  166 | 
  167 |   test('F69 - RN04: milestone bloqueada quando anterior pendente', async ({ page }) => {
  168 |     await loginAs(page, 'specialist')
  169 |     await page.goto(`/kanban/${kanbanProjectId}`)
  170 |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  171 | 
  172 |     // Check for BLOQUEADA button (milestone 2 or 3 should be blocked)
  173 |     const blockedBtn = page.getByRole('button', { name: /BLOQUEADA/i })
  174 |     if (await blockedBtn.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
  175 |       await expect(blockedBtn.first()).toBeDisabled()
  176 |     }
  177 |   })
  178 | })
  179 | 
  180 | /* ═══════════════════════════════════════════
  181 |    KANBAN - Fluxo completo de milestone (RF09, RN04, RN05)
  182 |    ═══════════════════════════════════════════ */
  183 | test.describe('Kanban - Milestone Workflow', () => {
  184 |   let workflowProjectId: string
  185 | 
  186 |   test.beforeAll(async () => {
  187 |     const project = await createProject(company.token, {
  188 |       title: 'Projeto Workflow E2E',
  189 |       description: 'Para testar fluxo completo de milestone.',
  190 |       budget: 6000,
  191 |       deadline: '2027-12-31',
  192 |       requirements: ['Go', 'Docker'],
  193 |       milestones: [
  194 |         { title: 'Fase Alpha', description: 'Primeira fase', amount: 3000 },
  195 |         { title: 'Fase Beta', description: 'Segunda fase', amount: 3000 },
  196 |       ],
  197 |     })
  198 |     workflowProjectId = project.id
  199 | 
```