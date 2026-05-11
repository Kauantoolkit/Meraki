# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bidding.spec.ts >> Bidding - Erros (RN02, RNF04) >> P9 - API rejeita submit duplicado com 409
- Location: e2e\bidding.spec.ts:124:3

# Error details

```
Error: API POST /bids/project/2c12ac4e-548e-4788-9bc5-b574430800df → 400: {"statusCode":400,"message":["proposal must be longer than or equal to 20 characters"],"path":"/api/bids/project/2c12ac4e-548e-4788-9bc5-b574430800df","timestamp":"2026-05-11T10:12:20.651Z"}
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - img [ref=e8]
        - generic [ref=e11]: Meraki
      - generic [ref=e12]:
        - button "Login" [ref=e13] [cursor=pointer]:
          - img [ref=e14]
          - text: Login
        - button "Registar" [ref=e17] [cursor=pointer]:
          - text: Registar
          - img [ref=e18]
  - generic [ref=e23]: FORA DO ESCOPO INICIAL — Esta tela não está prevista nos requisitos funcionais (RF01–RF14) do Meraki v1.0
  - generic [ref=e24]:
    - generic [ref=e27]: v1.0.0 // Plataforma de talentos & projetos
    - heading "TECH FREELANCE MARKETPLACE" [level=1] [ref=e28]
    - paragraph [ref=e29]: Plataforma segura para conectar empresas e especialistas técnicos. Escrow inteligente, milestone rastreáveis e pagamentos garantidos.
    - button "INICIAR JORNADA" [ref=e30] [cursor=pointer]:
      - text: INICIAR JORNADA
      - img [ref=e31]
    - generic [ref=e33]:
      - generic [ref=e34]:
        - paragraph [ref=e35]: 100%
        - paragraph [ref=e36]: Escrow Garantido
      - generic [ref=e37]:
        - paragraph [ref=e38]: JWT
        - paragraph [ref=e39]: Auth Seguro
      - generic [ref=e40]:
        - paragraph [ref=e41]: OPEN
        - paragraph [ref=e42]: Sistema de Licitação
      - generic [ref=e43]:
        - paragraph [ref=e44]: DDD
        - paragraph [ref=e45]: Arquitetura Robusta
  - generic [ref=e46]:
    - generic [ref=e49]: Módulos da Plataforma
    - generic [ref=e50]:
      - generic [ref=e51]:
        - img [ref=e54]
        - paragraph [ref=e58]: Dashboard Empresa
        - paragraph [ref=e59]: Gerencie projetos, licitações e equipes.
      - generic [ref=e60]:
        - img [ref=e63]
        - paragraph [ref=e66]: Dashboard Especialista
        - paragraph [ref=e67]: Terminal de trabalho e oportunidades.
      - generic [ref=e68]:
        - img [ref=e71]
        - paragraph [ref=e75]: Kanban
        - paragraph [ref=e76]: Acompanhe milestones em tempo real.
      - generic [ref=e77]:
        - img [ref=e80]
        - paragraph [ref=e83]: Explorar Talentos
        - paragraph [ref=e84]: Diretório de especialistas verificados.
      - generic [ref=e85]:
        - img [ref=e88]
        - paragraph [ref=e93]: Bidding
        - paragraph [ref=e94]: Sistema de propostas com licitação.
      - generic [ref=e95]:
        - img [ref=e98]
        - paragraph [ref=e100]: Escrow Terminal
        - paragraph [ref=e101]: Pagamentos garantidos por milestone.
      - generic [ref=e102]:
        - img [ref=e105]
        - paragraph [ref=e108]: Inbox
        - paragraph [ref=e109]: Comunicação segura entre partes.
      - generic [ref=e110]:
        - img [ref=e113]
        - paragraph [ref=e116]: Financeiro
        - paragraph [ref=e117]: Gestão de fundo de garantia.
      - generic [ref=e118]:
        - img [ref=e121]
        - paragraph [ref=e124]: Ganhos
        - paragraph [ref=e125]: Extrato e saque de recebimentos.
      - generic [ref=e126]:
        - img [ref=e129]
        - paragraph [ref=e132]: Eventos
        - paragraph [ref=e133]: Log de notificações do sistema.
      - generic [ref=e134]:
        - img [ref=e137]
        - paragraph [ref=e140]: Settings
        - paragraph [ref=e141]: Configurações e segurança da conta.
      - generic [ref=e142]:
        - img [ref=e145]
        - paragraph [ref=e147]: Admin
        - paragraph [ref=e148]: Painel de administração da plataforma.
  - generic [ref=e150]:
    - generic [ref=e151]:
      - paragraph [ref=e152]: Pronto para começar?
      - paragraph [ref=e153]: Crie a sua conta gratuitamente e explore a plataforma.
    - generic [ref=e154]:
      - button "Já tenho conta" [ref=e155] [cursor=pointer]
      - button "SOLICITAR REGISTRO" [ref=e156] [cursor=pointer]:
        - text: SOLICITAR REGISTRO
        - img [ref=e157]
  - contentinfo [ref=e159]:
    - paragraph [ref=e160]: © 2026 Meraki Platform — Freelance Marketplace
```

# Test source

```ts
  1   | /**
  2   |  * API helper for E2E integration tests.
  3   |  * Makes direct HTTP calls to the backend (Node context, NOT browser).
  4   |  */
  5   | 
  6   | const API = process.env.API_URL ?? 'http://localhost:3000/api'
  7   | 
  8   | export interface TestUser {
  9   |   token: string
  10  |   user: {
  11  |     id: string
  12  |     name: string
  13  |     email: string
  14  |     userType: 'COMPANY' | 'SPECIALIST'
  15  |     specialistId?: string
  16  |     companyId?: string
  17  |     type: 'company' | 'specialist'
  18  |   }
  19  | }
  20  | 
  21  | async function request<T = unknown>(
  22  |   path: string,
  23  |   opts: { method?: string; body?: unknown; token?: string } = {},
  24  | ): Promise<T> {
  25  |   const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  26  |   if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`
  27  | 
  28  |   const res = await fetch(`${API}${path}`, {
  29  |     method: opts.method ?? 'GET',
  30  |     headers,
  31  |     body: opts.body ? JSON.stringify(opts.body) : undefined,
  32  |   })
  33  | 
  34  |   const data = await res.json().catch(() => null)
  35  | 
  36  |   if (!res.ok) {
> 37  |     const err = new Error(`API ${opts.method ?? 'GET'} ${path} → ${res.status}: ${JSON.stringify(data)}`)
      |                 ^ Error: API POST /bids/project/2c12ac4e-548e-4788-9bc5-b574430800df → 400: {"statusCode":400,"message":["proposal must be longer than or equal to 20 characters"],"path":"/api/bids/project/2c12ac4e-548e-4788-9bc5-b574430800df","timestamp":"2026-05-11T10:12:20.651Z"}
  38  |     ;(err as any).status = res.status
  39  |     ;(err as any).body = data
  40  |     throw err
  41  |   }
  42  |   return data as T
  43  | }
  44  | 
  45  | /**
  46  |  * Register (if needed) and login. Returns token + normalized user.
  47  |  */
  48  | export async function ensureUser(
  49  |   email: string,
  50  |   password: string,
  51  |   name: string,
  52  |   userType: 'COMPANY' | 'SPECIALIST',
  53  |   companyName?: string,
  54  | ): Promise<TestUser> {
  55  |   // Try to register — ignore 409/conflict if already exists
  56  |   try {
  57  |     await request('/auth/register', {
  58  |       method: 'POST',
  59  |       body: { email, password, name, userType, ...(companyName ? { companyName } : {}) },
  60  |     })
  61  |   } catch (e: any) {
  62  |     if (e.status !== 409 && e.status !== 400) throw e
  63  |   }
  64  | 
  65  |   // Login
  66  |   const loginRes = await request<{ accessToken: string; user: any }>('/auth/login', {
  67  |     method: 'POST',
  68  |     body: { email, password },
  69  |   })
  70  | 
  71  |   const u = loginRes.user
  72  |   return {
  73  |     token: loginRes.accessToken,
  74  |     user: { ...u, type: u.userType === 'COMPANY' ? 'company' : 'specialist' },
  75  |   }
  76  | }
  77  | 
  78  | /* ─── Convenience accounts (reused across tests) ─── */
  79  | 
  80  | let _company: TestUser | null = null
  81  | let _specialist: TestUser | null = null
  82  | 
  83  | export async function getCompanyUser(): Promise<TestUser> {
  84  |   if (!_company) {
  85  |     _company = await ensureUser('e2e-company@meraki.test', 'Test@12345', 'Empresa E2E', 'COMPANY', 'E2E Corp Ltda')
  86  |   }
  87  |   return _company
  88  | }
  89  | 
  90  | export async function getSpecialistUser(): Promise<TestUser> {
  91  |   if (!_specialist) {
  92  |     _specialist = await ensureUser('e2e-specialist@meraki.test', 'Test@12345', 'Dev E2E', 'SPECIALIST')
  93  |   }
  94  |   return _specialist
  95  | }
  96  | 
  97  | /* ─── Project helpers ─── */
  98  | 
  99  | export async function createProject(
  100 |   token: string,
  101 |   data: {
  102 |     title: string
  103 |     description: string
  104 |     budget: number
  105 |     deadline: string
  106 |     requirements: string[]
  107 |     milestones?: { title: string; description: string; amount: number }[]
  108 |   },
  109 | ) {
  110 |   return request<any>('/projects', { method: 'POST', body: data, token })
  111 | }
  112 | 
  113 | /* ─── Bid helpers ─── */
  114 | 
  115 | export async function submitBid(
  116 |   token: string,
  117 |   data: { projectId: string; amount: number; durationDays: number; proposalText: string },
  118 | ) {
  119 |   return request<any>(`/bids/project/${data.projectId}`, {
  120 |     method: 'POST',
  121 |     body: {
  122 |       proposal: data.proposalText,
  123 |       proposedBudget: data.amount,
  124 |       estimatedDuration: data.durationDays,
  125 |     },
  126 |     token,
  127 |   })
  128 | }
  129 | 
  130 | export async function getMyBids(token: string) {
  131 |   return request<any[]>('/bids/my-bids', { token })
  132 | }
  133 | 
  134 | /* ─── Milestone helpers ─── */
  135 | 
  136 | export async function getMilestones(token: string, projectId: string) {
  137 |   return request<any[]>(`/projects/${projectId}/milestones`, { token })
```