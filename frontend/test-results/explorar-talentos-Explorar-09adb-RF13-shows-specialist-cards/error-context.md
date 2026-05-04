# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: explorar-talentos.spec.ts >> Explorar Talentos (RF12/RF13) >> shows specialist cards
- Location: e2e\explorar-talentos.spec.ts:44:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Dev Alpha')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Dev Alpha')

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
          - paragraph [ref=e29]: Empresa Teste
          - paragraph [ref=e30]: Empresa
        - img [ref=e32]
  - main [ref=e36]:
    - generic [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e41]: Portfolio Service // Online
        - heading "Diretório de Especialistas" [level=1] [ref=e42]
        - paragraph [ref=e43]: Encontre especialistas qualificados para o seu projeto.
      - generic [ref=e44]:
        - generic [ref=e45]:
          - generic:
            - img
          - textbox "BUSCAR ESPECIALISTA..." [ref=e46]
        - button "SEARCH()" [ref=e47] [cursor=pointer]
    - generic [ref=e48]:
      - complementary [ref=e49]:
        - generic [ref=e50]:
          - generic [ref=e51]:
            - img [ref=e52]
            - heading "Eye_Filtros" [level=2] [ref=e54]
          - generic [ref=e55]:
            - paragraph [ref=e56]: Stack
            - generic [ref=e57]:
              - generic [ref=e60] [cursor=pointer]: NestJS
              - generic [ref=e63] [cursor=pointer]: Flutter
              - generic [ref=e66] [cursor=pointer]: NodeJS
              - generic [ref=e69] [cursor=pointer]: React
              - generic [ref=e72] [cursor=pointer]: AWS
              - generic [ref=e75] [cursor=pointer]: Docker
              - generic [ref=e78] [cursor=pointer]: PostgreSQL
              - generic [ref=e81] [cursor=pointer]: TypeScript
              - generic [ref=e84] [cursor=pointer]: Kubernetes
              - generic [ref=e87] [cursor=pointer]: GraphQL
          - generic [ref=e88]:
            - paragraph [ref=e89]: Valor / Hora (BRL)
            - generic [ref=e90]:
              - spinbutton [ref=e91]
              - generic [ref=e92]: —
              - spinbutton [ref=e93]
          - generic [ref=e94]:
            - paragraph [ref=e95]: Nível Profissional
            - generic [ref=e96]:
              - generic [ref=e99] [cursor=pointer]: Júnior (0-2 anos)
              - generic [ref=e102] [cursor=pointer]: Pleno (2-5 anos)
              - generic [ref=e105] [cursor=pointer]: Sênior (5+ anos)
              - generic [ref=e108] [cursor=pointer]: Sênior Especialista (10%+ anos)
          - button "Aplicar Filtros" [ref=e109] [cursor=pointer]
      - generic [ref=e111]: Nenhum especialista encontrado.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { loginAs, MOCK_COMPANY_USER } from './helpers/auth'
  3  | 
  4  | const mockSpecialists = [
  5  |   {
  6  |     id: 's1',
  7  |     userId: 'u1',
  8  |     name: 'Dev Alpha',
  9  |     type: 'specialist',
  10 |     bio: 'NestJS expert',
  11 |     skills: ['NestJS', 'Docker'],
  12 |     rating: 4.8,
  13 |     completedProjects: 12,
  14 |   },
  15 | ]
  16 | 
  17 | test.describe('Explorar Talentos (RF12/RF13)', () => {
  18 |   test.beforeEach(async ({ page }) => {
  19 |     await loginAs(page, MOCK_COMPANY_USER)
  20 |     // Register AFTER loginAs so they take priority (last registered wins)
  21 |     await page.route('**/api/specialists**', (route) => {
  22 |       route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSpecialists) })
  23 |     })
  24 |     await page.route('**/api/portfolio/**', (route) => {
  25 |       route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  26 |     })
  27 |   })
  28 | 
  29 |   test('renders talent exploration page with search', async ({ page }) => {
  30 |     await page.goto('/talents')
  31 |     await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  32 |     await expect(page.locator('input[placeholder*="BUSCAR"]')).toBeVisible({ timeout: 5_000 })
  33 |   })
  34 | 
  35 |   test('shows filter sidebar with skill checkboxes', async ({ page }) => {
  36 |     await page.goto('/talents')
  37 |     await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  38 |     const checkbox = page.locator('input[type="checkbox"]').first()
  39 |     if (await checkbox.isVisible({ timeout: 3000 }).catch(() => false)) {
  40 |       await expect(checkbox).toBeVisible()
  41 |     }
  42 |   })
  43 | 
  44 |   test('shows specialist cards', async ({ page }) => {
  45 |     await page.goto('/talents')
  46 |     await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
> 47 |     await expect(page.getByText('Dev Alpha')).toBeVisible({ timeout: 5_000 })
     |                                               ^ Error: expect(locator).toBeVisible() failed
  48 |   })
  49 | })
  50 | 
```