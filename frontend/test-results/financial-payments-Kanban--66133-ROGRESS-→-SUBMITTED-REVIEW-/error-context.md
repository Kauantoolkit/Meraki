# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: financial-payments.spec.ts >> Kanban - Milestone Workflow >> Specialist pode submeter entrega (IN_PROGRESS → SUBMITTED_REVIEW)
- Location: e2e\financial-payments.spec.ts:224:3

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  getByRole('heading', { name: 'Submeter Entrega' })
Expected: not visible
Received: visible
Timeout:  10000ms

Call log:
  - Expect "not toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: 'Submeter Entrega' })
    14 × locator resolved to <h2 class="text-lg font-bold text-white uppercase tracking-tight mb-2 flex items-center gap-2">…</h2>
       - unexpected value "visible"

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
        - generic [ref=e19]: 33840283-1162-414c-b2c3-8631fb29659e // DELIVERY_BOARD
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
  - banner [ref=e40]:
    - generic [ref=e41]:
      - generic [ref=e42]:
        - heading "Projeto Workflow E2E" [level=1] [ref=e43]
        - generic [ref=e44]:
          - generic [ref=e45]: IN_PROGRESS
          - generic [ref=e47]:
            - img [ref=e48]
            - text: 6d4a6864-829a-4176-ac88-88068c108ee4
          - generic [ref=e51]:
            - img [ref=e52]
            - text: "Deadline: 2027-12-31T00:00:00.000Z"
      - generic [ref=e54]:
        - generic [ref=e55]:
          - paragraph [ref=e56]: Orçamento em Escrow
          - paragraph [ref=e57]: R$ 6.000,00
        - button "OPTIONS" [ref=e58] [cursor=pointer]:
          - img [ref=e59]
          - text: OPTIONS
  - main [ref=e62]:
    - generic [ref=e63]:
      - generic [ref=e64]:
        - generic [ref=e65]:
          - heading "PENDING" [level=2] [ref=e68]
          - generic [ref=e69]: "1"
        - generic [ref=e71]:
          - generic [ref=e73]: M2
          - heading "Fase Beta" [level=3] [ref=e74]
          - generic [ref=e75]:
            - generic [ref=e77]: R$ 3.000,00
            - button "BLOQUEADA" [disabled] [ref=e78]
      - generic [ref=e79]:
        - generic [ref=e80]:
          - heading "IN_PROGRESS" [level=2] [ref=e84]
          - generic [ref=e85]: "1"
        - generic [ref=e87]:
          - generic [ref=e90]: M1
          - heading "Fase Alpha" [level=3] [ref=e91]
          - generic [ref=e92]:
            - generic [ref=e94]: R$ 3.000,00
            - button "SUBMETER ENTREGA" [ref=e95] [cursor=pointer]
      - generic [ref=e96]:
        - generic [ref=e97]:
          - heading "SUBMITTED_REVIEW" [level=2] [ref=e100]
          - generic [ref=e101]: "0"
        - paragraph [ref=e104]: Sem Registos
      - generic [ref=e106]:
        - generic [ref=e107]:
          - img [ref=e108]
          - heading "APPROVED" [level=2] [ref=e110]
        - generic [ref=e111]: "0"
    - complementary [ref=e113]:
      - generic [ref=e115]:
        - img [ref=e116]
        - heading "Project_History" [level=2] [ref=e118]
      - generic [ref=e120]:
        - generic [ref=e121]: "[SYS] PROJECT_EVENT: Board carregado para 33840283-1162-414c-b2c3-8631fb29659e"
        - generic [ref=e122]: "[DELIVERY] MILESTONE_EVENT: Fase Alpha → IN_PROGRESS"
        - generic [ref=e124]: meraki@delivery-service:~$
      - generic [ref=e127]:
        - textbox "Registar nota..." [ref=e128]
        - button [ref=e129] [cursor=pointer]:
          - img [ref=e130]
  - generic [ref=e134]:
    - heading "Submeter Entrega" [level=2] [ref=e135]:
      - img [ref=e136]
      - text: Submeter Entrega
    - paragraph [ref=e139]: Os fundos em Escrow ficarão pendentes da aprovação do cliente.
    - generic [ref=e140]:
      - generic [ref=e141]:
        - generic [ref=e142]: Repositório / URL
        - textbox "https://github.com/..." [ref=e143]: https://github.com/test/repo
      - generic [ref=e144]:
        - generic [ref=e145]: Notas de Release
        - textbox "Descreva o que foi entregue..." [ref=e146]: Entrega da Fase Alpha.
    - generic [ref=e147]:
      - button "CANCELAR" [ref=e148] [cursor=pointer]
      - button "DEPLOY_SUBMIT()" [ref=e149] [cursor=pointer]
```

# Test source

```ts
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
  200 |     // Assign specialist
  201 |     const bid = await submitBid(specialist.token, {
  202 |       projectId: workflowProjectId,
  203 |       amount: 5500,
  204 |       durationDays: 30,
  205 |       proposalText: 'Proposta para workflow E2E.',
  206 |     })
  207 |     await apiRequest(`/bids/${bid.id}/accept`, { method: 'PUT', token: company.token })
  208 |   })
  209 | 
  210 |   test('Specialist pode iniciar milestone (PENDING → IN_PROGRESS)', async ({ page }) => {
  211 |     await loginAs(page, 'specialist')
  212 |     await page.goto(`/kanban/${workflowProjectId}`)
  213 |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  214 | 
  215 |     // Look for INICIAR TRABALHO button on the first milestone
  216 |     const startBtn = page.getByRole('button', { name: /INICIAR TRABALHO/i })
  217 |     if (await startBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
  218 |       await startBtn.click()
  219 |       // Wait for state to update — milestone should move to IN_PROGRESS
  220 |       await expect(page.getByRole('button', { name: /SUBMETER ENTREGA/i })).toBeVisible({ timeout: 10_000 })
  221 |     }
  222 |   })
  223 | 
  224 |   test('Specialist pode submeter entrega (IN_PROGRESS → SUBMITTED_REVIEW)', async ({ page }) => {
  225 |     await loginAs(page, 'specialist')
  226 |     await page.goto(`/kanban/${workflowProjectId}`)
  227 |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  228 | 
  229 |     const submitBtn = page.getByRole('button', { name: /SUBMETER ENTREGA/i })
  230 |     if (await submitBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
  231 |       await submitBtn.click()
  232 | 
  233 |       // Modal deve abrir
  234 |       await expect(page.getByRole('heading', { name: 'Submeter Entrega' })).toBeVisible({ timeout: 3_000 })
  235 |       await page.locator('input[placeholder*="github.com"]').first().fill('https://github.com/test/repo')
  236 |       await page.locator('textarea[placeholder*="Descreva"]').first().fill('Entrega da Fase Alpha.')
  237 | 
  238 |       // Confirm
  239 |       await page.getByRole('button', { name: /DEPLOY_SUBMIT/i }).click()
  240 | 
  241 |       // Modal should close, milestone moves to SUBMITTED_REVIEW
> 242 |       await expect(page.getByRole('heading', { name: 'Submeter Entrega' })).not.toBeVisible({ timeout: 10_000 })
      |                                                                                 ^ Error: expect(locator).not.toBeVisible() failed
  243 |     }
  244 |   })
  245 | 
  246 |   test('Company pode aprovar milestone (SUBMITTED_REVIEW → APPROVED)', async ({ page }) => {
  247 |     await loginAs(page, 'company')
  248 |     await page.goto(`/kanban/${workflowProjectId}`)
  249 |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  250 | 
  251 |     const approveBtn = page.getByRole('button', { name: /APROVAR.*PAGAR/i })
  252 |     if (await approveBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
  253 |       await approveBtn.click()
  254 | 
  255 |       // Modal with warning
  256 |       await expect(page.getByText('Aprovar Milestone')).toBeVisible({ timeout: 3_000 })
  257 |       await expect(page.getByText(/Ação Irreversível/i)).toBeVisible()
  258 | 
  259 |       // Confirm
  260 |       await page.getByRole('button', { name: /CONFIRMAR_PAGAMENTO/i }).click()
  261 | 
  262 |       // Modal should close
  263 |       await expect(page.getByText('Aprovar Milestone')).not.toBeVisible({ timeout: 10_000 })
  264 |     }
  265 |   })
  266 | })
  267 | 
  268 | /* ═══════════════════════════════════════════
  269 |    KANBAN - Visibilidade por Role
  270 |    ═══════════════════════════════════════════ */
  271 | test.describe('Kanban - Role Visibility', () => {
  272 |   let roleProjectId: string
  273 | 
  274 |   test.beforeAll(async () => {
  275 |     const project = await createProject(company.token, {
  276 |       title: 'Projeto Role E2E',
  277 |       description: 'Para testar visibilidade por role.',
  278 |       budget: 4000,
  279 |       deadline: '2027-12-31',
  280 |       requirements: ['Python'],
  281 |       milestones: [
  282 |         { title: 'Milestone Role Test', description: 'Test', amount: 4000 },
  283 |       ],
  284 |     })
  285 |     roleProjectId = project.id
  286 | 
  287 |     const bid = await submitBid(specialist.token, {
  288 |       projectId: roleProjectId,
  289 |       amount: 3500,
  290 |       durationDays: 15,
  291 |       proposalText: 'Role visibility test.',
  292 |     })
  293 |     await apiRequest(`/bids/${bid.id}/accept`, { method: 'PUT', token: company.token })
  294 |   })
  295 | 
  296 |   test('Company NÃO vê INICIAR TRABALHO (só specialist pode)', async ({ page }) => {
  297 |     await loginAs(page, 'company')
  298 |     await page.goto(`/kanban/${roleProjectId}`)
  299 |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  300 | 
  301 |     // Company should NOT see INICIAR TRABALHO
  302 |     await expect(page.getByRole('button', { name: /INICIAR TRABALHO/i })).not.toBeVisible()
  303 |   })
  304 | 
  305 |   test('Company NÃO vê SUBMETER ENTREGA (só specialist pode)', async ({ page }) => {
  306 |     // First advance milestone to IN_PROGRESS via API
  307 |     const milestones = await getMilestones(specialist.token, roleProjectId)
  308 |     if (milestones.length > 0 && milestones[0].status === 'PENDING') {
  309 |       await startMilestone(specialist.token, milestones[0].id)
  310 |     }
  311 | 
  312 |     await loginAs(page, 'company')
  313 |     await page.goto(`/kanban/${roleProjectId}`)
  314 |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  315 | 
  316 |     await expect(page.getByRole('button', { name: /SUBMETER ENTREGA/i })).not.toBeVisible()
  317 |   })
  318 | 
  319 |   test('Specialist NÃO vê APROVAR & PAGAR (só company pode)', async ({ page }) => {
  320 |     // Advance to SUBMITTED_REVIEW via API
  321 |     const milestones = await getMilestones(specialist.token, roleProjectId)
  322 |     if (milestones.length > 0 && milestones[0].status === 'IN_PROGRESS') {
  323 |       await submitDelivery(specialist.token, {
  324 |         milestoneId: milestones[0].id,
  325 |         projectId: roleProjectId,
  326 |         deliveryNotes: 'Test delivery',
  327 |         deliveredFiles: ['https://github.com/test/role-test'],
  328 |       })
  329 |     }
  330 | 
  331 |     await loginAs(page, 'specialist')
  332 |     await page.goto(`/kanban/${roleProjectId}`)
  333 |     await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  334 | 
  335 |     await expect(page.getByRole('button', { name: /APROVAR.*PAGAR/i })).not.toBeVisible()
  336 |   })
  337 | })
  338 | 
```