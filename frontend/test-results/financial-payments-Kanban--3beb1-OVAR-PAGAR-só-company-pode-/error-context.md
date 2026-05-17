# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: financial-payments.spec.ts >> Kanban - Role Visibility >> Specialist NÃO vê APROVAR & PAGAR (só company pode)
- Location: e2e\financial-payments.spec.ts:319:3

# Error details

```
Error: API POST /milestones/8e51e4a2-5265-4b89-ac72-baac2bf62d80/submit → 500: {"statusCode":500,"message":"Internal server error","path":"/api/milestones/8e51e4a2-5265-4b89-ac72-baac2bf62d80/submit","timestamp":"2026-05-16T21:28:37.167Z"}
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
      |                 ^ Error: API POST /milestones/8e51e4a2-5265-4b89-ac72-baac2bf62d80/submit → 500: {"statusCode":500,"message":"Internal server error","path":"/api/milestones/8e51e4a2-5265-4b89-ac72-baac2bf62d80/submit","timestamp":"2026-05-16T21:28:37.167Z"}
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
  110 |   const { milestones, ...projectData } = data
  111 |   const project = await request<any>('/projects', { method: 'POST', body: projectData, token })
  112 | 
  113 |   if (milestones && milestones.length > 0) {
  114 |     for (const m of milestones) {
  115 |       await request(`/projects/${project.id}/milestones`, { method: 'POST', body: m, token })
  116 |     }
  117 |   }
  118 | 
  119 |   return project
  120 | }
  121 | 
  122 | /* ─── Bid helpers ─── */
  123 | 
  124 | export async function submitBid(
  125 |   token: string,
  126 |   data: { projectId: string; amount: number; durationDays: number; proposalText: string },
  127 | ) {
  128 |   return request<any>(`/bids/project/${data.projectId}`, {
  129 |     method: 'POST',
  130 |     body: {
  131 |       proposal: data.proposalText,
  132 |       proposedBudget: data.amount,
  133 |       estimatedDuration: data.durationDays,
  134 |     },
  135 |     token,
  136 |   })
  137 | }
```