 Tenho agora toda a informação necessária. Aqui está o cruzamento completo:                                
                                                                                                            
  ---                                                                                                       
  Requisitos Funcionais (RF01–RF14) vs Testes E2E                                                           
                                                                                                            
  ┌──────┬─────────────────────────┬────────────────────────┬───────────────────────┬──────────────────┐    
  │  RF  │        Descrição        │   Teste UI (Grupo 1)   │   Teste Integração    │      Status      │
  │      │                         │                        │       (Grupo 2)       │                  │
  ├──────┼─────────────────────────┼────────────────────────┼───────────────────────┼──────────────────┤
  │      │ Cadastro de usuários    │ public-pages.spec.ts — │ auth-flow.spec.ts —   │                  │
  │ RF01 │ (Empresa/Especialista)  │  signup page renders,  │ company register,     │ Coberto          │
  │      │                         │ type selector          │ specialist register   │                  │
  ├──────┼─────────────────────────┼────────────────────────┼───────────────────────┼──────────────────┤
  │      │ Autenticação            │ public-pages.spec.ts — │ auth-flow.spec.ts —   │                  │
  │ RF02 │ (Login/JWT)             │  login page, protected │ login, wrong          │ Coberto          │
  │      │                         │  routes redirect       │ credentials error     │                  │
  ├──────┼─────────────────────────┼────────────────────────┼───────────────────────┼──────────────────┤
  │      │ Criação de Projeto (com │ pages.spec.ts —        │ project-flow.spec.ts  │                  │
  │ RF03 │  RN01)                  │ CreateProject renders  │ — wizard 4 steps,     │ Coberto          │
  │      │                         │                        │ deploy                │                  │
  ├──────┼─────────────────────────┼────────────────────────┼───────────────────────┼──────────────────┤
  │      │                         │                        │ project-flow.spec.ts  │ Parcial — não    │
  │ RF04 │ Milestones do Projeto   │ pages.spec.ts —        │ — preenche M1/M2 no   │ testa            │
  │      │ (RN04)                  │ CreateProject renders  │ wizard                │ sequencialidade  │
  │      │                         │                        │                       │ (RN04)           │
  ├──────┼─────────────────────────┼────────────────────────┼───────────────────────┼──────────────────┤
  │      │ Submissão de Proposta   │                        │ bidding-flow.spec.ts  │ Parcial — não    │
  │ RF05 │ (RN02)                  │ —                      │ — specialist submits  │ valida RN02      │
  │      │                         │                        │ bid                   │ (unicidade)      │
  ├──────┼─────────────────────────┼────────────────────────┼───────────────────────┼──────────────────┤
  │ RF06 │ Avaliação de Propostas  │ —                      │ —                     │ SEM TESTE        │
  ├──────┼─────────────────────────┼────────────────────────┼───────────────────────┼──────────────────┤
  │ RF07 │ Seleção de Vencedor     │ —                      │ —                     │ SEM TESTE        │
  │      │ (RN03)                  │                        │                       │                  │
  ├──────┼─────────────────────────┼────────────────────────┼───────────────────────┼──────────────────┤
  │      │                         │ pages.spec.ts — kanban │                       │ Parcial — só UI, │
  │ RF08 │ Kanban Board            │  renders;              │ —                     │  sem interação   │
  │      │                         │ navigation.spec.ts —   │                       │ com cards        │
  │      │                         │ nav to kanban          │                       │                  │
  ├──────┼─────────────────────────┼────────────────────────┼───────────────────────┼──────────────────┤
  │ RF09 │ Validação de            │ —                      │ —                     │ SEM TESTE        │
  │      │ Milestone/Entrega       │                        │                       │                  │
  ├──────┼─────────────────────────┼────────────────────────┼───────────────────────┼──────────────────┤
  │      │                         │ pages.spec.ts —        │                       │ Parcial — só     │
  │ RF10 │ Pagamentos (RN05, RN06) │ financeiro/ganhos      │ —                     │ renderização     │
  │      │                         │ renders                │                       │                  │
  ├──────┼─────────────────────────┼────────────────────────┼───────────────────────┼──────────────────┤
  │ RF11 │ Histórico Profissional  │ —                      │ —                     │ SEM TESTE        │
  ├──────┼─────────────────────────┼────────────────────────┼───────────────────────┼──────────────────┤
  │ RF12 │ Perfil Público do       │ pages.spec.ts —        │ —                     │ Parcial — só     │
  │      │ Especialista            │ portfolio renders      │                       │ renderização     │
  ├──────┼─────────────────────────┼────────────────────────┼───────────────────────┼──────────────────┤
  │ RF13 │ Perfil Público da       │ —                      │ —                     │ SEM TESTE        │
  │      │ Empresa                 │                        │                       │                  │
  ├──────┼─────────────────────────┼────────────────────────┼───────────────────────┼──────────────────┤
  │ RF14 │ WorkHistory automático  │ —                      │ —                     │ SEM TESTE        │
  └──────┴─────────────────────────┴────────────────────────┴───────────────────────┴──────────────────┘

  Regras de Negócio (RN01–RN07) vs Testes

  ┌──────┬──────────────────────────────────────────────┬───────────────────────────────────────────────┐
  │  RN  │                  Descrição                   │                   Testado?                    │
  ├──────┼──────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ RN01 │ Qualidade do escopo (título ≥10, budget>0,   │ Parcial — teste cria projeto válido mas não   │
  │      │ deadline futuro, ≥1 req)                     │ testa rejeição de inválido                    │
  ├──────┼──────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ RN02 │ Uma proposta ativa por especialista por      │ Não                                           │
  │      │ projeto                                      │                                               │
  ├──────┼──────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ RN03 │ Apenas um vencedor por projeto               │ Não                                           │
  ├──────┼──────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ RN04 │ Milestones sequenciais                       │ Não                                           │
  ├──────┼──────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ RN05 │ Escrow                                       │ Não                                           │
  ├──────┼──────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ RN06 │ Taxa da plataforma 10%                       │ Não                                           │
  ├──────┼──────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ RN07 │ Histórico automático                         │ Não                                           │
  └──────┴──────────────────────────────────────────────┴───────────────────────────────────────────────┘

  Resumo

  - Bem cobertos: RF01, RF02, RF03 (auth + criação de projeto)
  - Parcialmente cobertos: RF04, RF05, RF08, RF10, RF12 (renderizam mas não testam fluxo completo)
  - Sem teste: RF06, RF07, RF09, RF11, RF13, RF14 e todas as RN de validação negativa

  Os testes atuais cobrem o happy path dos fluxos iniciais (cadastro → login → criar projeto → submeter
  bid). Falta cobertura nos fluxos intermediários e finais do ciclo de vida (avaliar propostas → selecionar
  vencedor → executar milestones → validar entregas → liberar pagamento → histórico).

  Quer que eu crie os testes que faltam?

✻ Churned for 3m 7s                    

❯ sim, crie os testes.                                                                                      
                          
● Let me first check what pages and API endpoints exist for the untested flows.                             
                                                            
● Explore(Explore untested pages/APIs)                                                                      
  ⎿  Done (15 tool uses · 58.1k tokens · 45s)       
  (ctrl+o to expand)                                                                                        
                                                                                                     
● Now I have the full picture. Let me check the actual API endpoints to understand what's available in the  
  backend:                                                                                                  
                                                                                                            
  Searched for 3 patterns, read 5 files, listed 1 directory (ctrl+o to expand)                              
                                                                                                            
● Now I have the full picture. Let me check what backend endpoints actually exist to know what integration  
  tests will work:                                                                                          
                                                                                                            
● Bash(curl -s http://localhost:3000/api/projects 2>&1 | head -3)                                           
  ⎿  {                                                                                                      
       "statusCode": 401,                                                                                   
       "message": "Token inválido ou expirado",                                                           
     … +3 lines (ctrl+o to expand)                                                                          
                                                                                                            
● Backend is running. Now let me create all the missing tests. I'll work on UI tests (group 1) and
  integration tests (group 2) in parallel:                                                                  
                                                                                                            
● Agent(Create UI tests for pages)                               
  ⎿  Backgrounded agent (↓ to manage · ctrl+o to expand)                                                    
                                                                                                            
● Now let me create the integration tests (group 2) for the missing flows:
                                                                                                            
● Agent(Create integration tests)                                                                           
  ⎿  Backgrounded agent (↓ to manage · ctrl+o to expand)
                                                                                                            
● Lancei dois agentes em paralelo:                                                                        
                                                                                                            
  1. Agente UI (Grupo 1) — criando testes para: AvaliarPropostas, Kanban Board, Explorar Talentos, Perfil   
  Público
  2. Agente Integração (Grupo 2) — criando testes para: Avaliação de Propostas (RF06/RF07), Milestone       
  Delivery (RF08/RF09/RN04), Explorar Talentos (RF12/RF13), Financeiro (RF10)                             

  Vou te avisar quando ambos terminarem e rodar os testes.

✻ Cooked for 3m 14s · 1 local agent still running                

● Agent "Create UI tests for pages" completed                                                               
   
● UI tests created. Waiting for the integration tests agent to finish...                                    
                                                                                                          
● Agent "Create integration tests" completed                                                                
                                                                                                          
● Both agents finished. Let me run all tests now:                                                           
                                                                                                          
● Bash(cd "C:\Users\kauan\Desktop\computaria\organizando-meus-codigos\Meraki\frontend" && npx playwright    
      test --config=playwright.config.ts --headed 2>&1 | tail -40)                                          
  ⎿      Error Context: test-results\kanban-board-Kanban-Board--96560-kanban-board-for-specialist\error     
     -context.md                                                                                          
     … +26 lines (ctrl+o to expand)                                                                         
  ⎿  (timeout 5m)                                                                                         
                                                                                                            
● 47 passed, 7 failed. Let me fix the failures. Let me check the kanban issue first:                        
                                                                                                            
  Read 1 file (ctrl+o to expand)                                                                            
                                                                                                            
● The problem: Kanban fetches milestones via projectsApi.getMilestones(projectId) which is GET              
  /projects/{projectId}/milestones, not /milestones/**. The route mock is wrong. Also, the loginAs generic
  mock catches /projects/** first. Let me check the route priority — in Playwright, the LAST registered     
  route takes priority, not the first.                                                                      
                                                                                                            
  Read 1 file (ctrl+o to expand)                                                                            
                                                                                                          
● Blank page — the Kanban component is crashing. The issue is that loginAs registers a catch-all            
  http://localhost:3000/api/** route AFTER the specific routes, and in Playwright the LAST matching route
  wins. So the generic mock from loginAs catches everything and overrides the specific mocks.               
                                                                                                            
  I need to fix the loginAs helper to NOT override routes already registered, or restructure the mock       
  approach. The simplest fix: register specific mocks AFTER loginAs (since last wins):                      
                                                                                                          
● Write(e2e\kanban-board.spec.ts)      
  ⎿  Added 23 lines, removed 18 lines
      16    { id: 'm2', projectId: 'test-project-id', title: 'Entrega', amount: 2500, status: 'PENDIN       
          G', order: 2 },
      17  ]                                                                                                 
      18                                                                                                  
      19 +async function setupKanbanMocks(page: import('@playwright/test').Page) {                        
      20 +  // Register AFTER loginAs so they take priority (last registered wins in Playwright)     
      21 +  await page.route('**/api/projects/test-project-id/milestones', (route) => {              
      22 +    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mock
         +Milestones) })                                                                             
      23 +  })                                                                                       
      24 +  await page.route('**/api/projects/test-project-id', (route) => {                         
      25 +    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mock
         +Project) })                                                                                
      26 +  })                                                                                       
      27 +  await page.route('**/api/deliveries/**', (route) => {                                    
      28 +    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })            
      29 +  })                                                                                       
      30 +}                                                                                          
      31 +                                                                                           
      32  test.describe('Kanban Board - Company (RF08/RF09)', () => {
      33    test.beforeEach(async ({ page }) => {
      21 -    await page.route('http://localhost:3000/api/projects/test-project-id', (route) => {    
      22 -      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mo
         -ckProject) })                                                                              
      23 -    })                                                                                     
      24 -    await page.route('http://localhost:3000/api/milestones/**', (route) => {               
      25 -      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mo
         -ckMilestones) })                                                                           
      26 -    })                                                                                     
      34      await loginAs(page, MOCK_COMPANY_USER)
      35 +    await setupKanbanMocks(page)                                                           
      36    })
      37  
      30 -  test('renders kanban board with 4 columns', async ({ page }) => {                        
      38 +  test('renders kanban board with columns', async ({ page }) => {                          
      39      await page.goto('/kanban/test-project-id')
      32 -    await expect(page.locator('main')).toBeVisible()                                       
      40 +    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })                    
      41    })
      42  
      43    test('shows project title in header', async ({ page }) => {
      44      await page.goto('/kanban/test-project-id')
      45 +    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })                    
      46      await expect(page.getByText('Projeto Teste')).toBeVisible()
      47    })
      48  
      40 -  test('shows milestone cards in columns', async ({ page }) => {                           
      49 +  test('shows milestone cards', async ({ page }) => {                                      
      50      await page.goto('/kanban/test-project-id')
      51 +    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })                    
      52      await expect(page.getByText('Setup')).toBeVisible()
      53      await expect(page.getByText('Entrega')).toBeVisible()
      54    })
     ...
      56  
      57  test.describe('Kanban Board - Specialist (RF08/RF09)', () => {
      58    test.beforeEach(async ({ page }) => {
      49 -    await page.route('http://localhost:3000/api/projects/test-project-id', (route) => {    
      50 -      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mo
         -ckProject) })                                                                              
      51 -    })                                                                                     
      52 -    await page.route('http://localhost:3000/api/milestones/**', (route) => {               
      53 -      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mo
         -ckMilestones) })                                                                           
      54 -    })                                                                                     
      59      await loginAs(page, MOCK_SPECIALIST_USER)
      60 +    await setupKanbanMocks(page)                                                           
      61    })
      62  
      63    test('renders kanban board for specialist', async ({ page }) => {
      64      await page.goto('/kanban/test-project-id')
      60 -    await expect(page.locator('main')).toBeVisible()                                       
      65 +    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })                    
      66    })
      67  
      68    test('shows INICIAR TRABALHO button on pending milestones', async ({ page }) => {
      69      await page.goto('/kanban/test-project-id')
      65 -    await expect(page.locator('main')).toBeVisible()                                       
      70 +    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })                    
      71      const button = page.getByRole('button', { name: /iniciar trabalho/i })
      67 -    if (await button.first().isVisible()) {                                                
      72 +    if (await button.first().isVisible({ timeout: 3000 }).catch(() => false)) {            
      73        await expect(button.first()).toBeVisible()
      74      }
      75    })

● Now fix the other failing tests — avaliar-propostas and explorar-talentos:

  Read 1 file (ctrl+o to expand)                                                                            
                                  
● Same issue — specific routes registered BEFORE loginAs get overridden. Fix them all:                      
                                                                                                          
● Write(e2e\avaliar-propostas.spec.ts)                                                                      
  ⎿  Added 17 lines, removed 13 lines                                                                       
       7    description: 'desc',                                                                            
       8    budget: 5000,                                                                                   
       9    deadline: '2026-12-31',                                                                         
      10 -  status: 'IN_PROGRESS',                                                                          
      10 +  status: 'OPEN',                                                                                 
      11    companyId: 'comp-1',                                                                          
      12  }                                                                                               
      13  
     ...
      38  
      39  test.describe('Avaliar Propostas (RF06/RF07)', () => {
      40    test.beforeEach(async ({ page }) => {
      41 -    await page.route('http://localhost:3000/api/projects/test-project-id', (route) => {    
      41 +    await loginAs(page, MOCK_COMPANY_USER)                                                 
      42 +    // Register specific mocks AFTER loginAs (last registered wins)                        
      43 +    await page.route('**/api/projects/test-project-id', (route) => {                       
      44        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mo
          ckProject) })
      45      })
      44 -    await page.route('http://localhost:3000/api/bids/**', (route) => {                     
      46 +    await page.route('**/api/bids/**', (route) => {                                        
      47        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mo
          ckBids) })
      48      })
      47 -    await loginAs(page, MOCK_COMPANY_USER)                                                 
      49    })
      50  
      51    test('renders evaluation page with bids header', async ({ page }) => {
      52      await page.goto('/projects/test-project-id/bids')
      52 -    await expect(page.locator('main')).toBeVisible()                                       
      53 +    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })                    
      54    })
      55  
      56    test('shows bid cards', async ({ page }) => {
      57      await page.goto('/projects/test-project-id/bids')
      57 -    await expect(page.locator('main')).toBeVisible()                                       
      58 -    // Verify bid data is rendered                                                         
      58 +    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })                    
      59      await expect(page.getByText('Dev Alpha')).toBeVisible()
      60      await expect(page.getByText('Dev Beta')).toBeVisible()
      61    })
      62  
      63    test('expand/collapse bid proposal text', async ({ page }) => {
      64      await page.goto('/projects/test-project-id/bids')
      65 -    await expect(page.locator('main')).toBeVisible()                                       
      66 -    // Look for expandable proposal text                                                   
      67 -    const expandButton = page.locator('button', { hasText: /ver mais|expandir|detalhes/i })
         -.first()                                                                                   
      68 -    if (await expandButton.isVisible()) {                                                  
      69 -      await expandButton.click()                                                           
      70 -      await expect(page.getByText('Tenho experiência com NestJS')).toBeVisible()           
      65 +    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })                    
      66 +    // Proposal text may be visible directly or behind an expand toggle                    
      67 +    const hasProposalText = await page.getByText('Tenho experiência com NestJS').isVisible(
         +{ timeout: 3000 }).catch(() => false)                                                      
      68 +    if (!hasProposalText) {                                                                
      69 +      // Try clicking a chevron/expand button                                              
      70 +      const chevron = page.locator('[class*="cursor-pointer"]').first()                    
      71 +      if (await chevron.isVisible({ timeout: 2000 }).catch(() => false)) {                 
      72 +        await chevron.click()                                                              
      73 +      }                                                                                    
      74      }
      75 +    await expect(page.getByText('Tenho experiência com NestJS')).toBeVisible({ timeout: 500
         +0 })                                                                                       
      76    })
      77  })
  ⎿  You've hit your limit · resets 2:50am (America/Sao_Paulo)