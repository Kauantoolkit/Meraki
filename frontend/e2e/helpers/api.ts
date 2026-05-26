/**
 * API helper for E2E integration tests.
 * Makes direct HTTP calls to the backend (Node context, NOT browser).
 */

const API = process.env.API_URL ?? 'http://localhost:3000/api'

export interface TestUser {
  token: string
  user: {
    id: string
    name: string
    email: string
    userType: 'COMPANY' | 'SPECIALIST'
    specialistId?: string
    companyId?: string
    type: 'company' | 'specialist'
  }
}

async function request<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown; token?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`

  const res = await fetch(`${API}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const err = new Error(`API ${opts.method ?? 'GET'} ${path} → ${res.status}: ${JSON.stringify(data)}`)
    ;(err as any).status = res.status
    ;(err as any).body = data
    throw err
  }
  return data as T
}

/**
 * Register (if needed) and login. Returns token + normalized user.
 */
export async function ensureUser(
  email: string,
  password: string,
  name: string,
  userType: 'COMPANY' | 'SPECIALIST',
  companyName?: string,
): Promise<TestUser> {
  // Try to register — ignore 409/conflict if already exists
  try {
    await request('/auth/register', {
      method: 'POST',
      body: { email, password, name, userType, ...(companyName ? { companyName } : {}) },
    })
  } catch (e: any) {
    if (e.status !== 409 && e.status !== 400 && e.status !== 429) throw e
  }

  // Login — retry com backoff em caso de throttling (429)
  let loginRes: { accessToken: string; user: any }
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      loginRes = await request<{ accessToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      break
    } catch (e: any) {
      if (e.status === 429 && attempt < 4) {
        await new Promise(res => setTimeout(res, 5000 * (attempt + 1)))
        continue
      }
      throw e
    }
  }

  const u = loginRes.user
  return {
    token: loginRes.accessToken,
    user: { ...u, type: u.userType === 'COMPANY' ? 'company' : 'specialist' },
  }
}

/* ─── Convenience accounts (reused across tests) ─── */

let _company: TestUser | null = null
let _company2: TestUser | null = null
let _specialist: TestUser | null = null
let _specialist2: TestUser | null = null

export async function getCompanyUser(): Promise<TestUser> {
  if (!_company) {
    _company = await ensureUser('e2e-company@meraki.test', 'Test@12345', 'Empresa E2E', 'COMPANY', 'E2E Corp Ltda')
  }
  return _company
}

export async function getCompany2User(): Promise<TestUser> {
  if (!_company2) {
    _company2 = await ensureUser('e2e-company2@meraki.test', 'Test@12345', 'Empresa E2E 2', 'COMPANY', 'E2E Corp 2 Ltda')
  }
  return _company2
}

export async function getSpecialistUser(): Promise<TestUser> {
  if (!_specialist) {
    _specialist = await ensureUser('e2e-specialist@meraki.test', 'Test@12345', 'Dev E2E', 'SPECIALIST')
  }
  return _specialist
}

export async function getSpecialist2User(): Promise<TestUser> {
  if (!_specialist2) {
    _specialist2 = await ensureUser('e2e-specialist2@meraki.test', 'Test@12345', 'Dev E2E 2', 'SPECIALIST')
  }
  return _specialist2
}

/* ─── Project helpers ─── */

export async function createProject(
  token: string,
  data: {
    title: string
    description: string
    budget: number
    deadline: string
    requirements: string[]
    milestones?: { title: string; description: string; amount: number }[]
  },
) {
  const { milestones, ...projectData } = data
  const project = await request<any>('/projects', { method: 'POST', body: projectData, token })

  if (milestones && milestones.length > 0) {
    for (const m of milestones) {
      await request(`/projects/${project.id}/milestones`, { method: 'POST', body: m, token })
    }
  }

  return project
}

/* ─── Bid helpers ─── */

export async function submitBid(
  token: string,
  data: { projectId: string; amount: number; durationDays: number; proposalText: string },
) {
  return request<any>(`/bids/project/${data.projectId}`, {
    method: 'POST',
    body: {
      proposal: data.proposalText,
      proposedBudget: data.amount,
      estimatedDuration: data.durationDays,
    },
    token,
  })
}

export async function getMyBids(token: string) {
  return request<any[]>('/bids/my-bids', { token })
}

export async function withdrawBid(token: string, bidId: string) {
  return request<any>(`/bids/${bidId}/withdraw`, { method: 'PUT', token })
}

export async function acceptBid(token: string, bidId: string) {
  return request<any>(`/bids/${bidId}/accept`, { method: 'PUT', token })
}

export async function rejectBid(token: string, bidId: string) {
  return request<any>(`/bids/${bidId}/reject`, { method: 'PUT', token })
}

export async function sendBidMessage(token: string, bidId: string, message: string) {
  return request<any>(`/bids/${bidId}/messages`, { method: 'POST', body: { message }, token })
}

export async function getBidMessages(token: string, bidId: string) {
  return request<any[]>(`/bids/${bidId}/messages`, { token })
}

/* ─── Milestone helpers ─── */

export async function getMilestones(token: string, projectId: string) {
  return request<any[]>(`/projects/${projectId}/milestones`, { token })
}

export async function startMilestone(token: string, milestoneId: string) {
  return request<any>(`/milestones/${milestoneId}/start`, { method: 'PUT', token })
}

export async function submitDelivery(
  token: string,
  data: { milestoneId: string; projectId: string; deliveryNotes?: string; deliveredFiles?: string[] },
) {
  return request<any>(`/milestones/${data.milestoneId}/submit`, {
    method: 'POST',
    body: {
      projectId: data.projectId,
      deliveryNotes: data.deliveryNotes,
      deliveredFiles: data.deliveredFiles,
    },
    token,
  })
}

export async function approveMilestone(token: string, milestoneId: string) {
  return request<any>(`/milestones/${milestoneId}/approve`, { method: 'PUT', token })
}

/* ─── Payment helpers ─── */

export async function getPayments(token: string) {
  return request<any[]>('/payments', { token })
}

export async function getMyPayments(token: string) {
  return request<any[]>('/payments/my', { token })
}

/* ─── Portfolio helpers ─── */

export async function getMyPortfolio(token: string) {
  return request<any>('/portfolio/me', { token })
}

export async function getPublicProfile(token: string, specialistId: string) {
  return request<any>(`/portfolio/specialist/${specialistId}`, { token })
}

/* ─── Generic request export for ad-hoc calls ─── */
export { request as apiRequest }
