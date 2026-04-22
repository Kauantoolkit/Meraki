/**
 * Testes de renderização para todas as telas do frontend Meraki.
 * Verifica que cada componente monta sem crashes (smoke test).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from './helpers'

// ── Mock de todas as APIs ──────────────────────────────────────────────────

vi.mock('../api/auth', () => ({
  authApi: {
    login: vi.fn().mockResolvedValue({ token: 'tok', user: { id: '1', name: 'Test', email: 't@t.com', userType: 'COMPANY', type: 'company' } }),
    register: vi.fn().mockResolvedValue({ token: 'tok', user: { id: '1', name: 'Test', email: 't@t.com', userType: 'COMPANY', type: 'company' } }),
    me: vi.fn().mockResolvedValue({ data: { id: '1', name: 'Test', email: 't@t.com', userType: 'COMPANY', type: 'company' } }),
  },
}))

vi.mock('../api/projects', () => ({
  projectsApi: {
    list: vi.fn().mockResolvedValue({ data: { data: [], total: 0 } }),
    listOpen: vi.fn().mockResolvedValue({ data: { data: [], total: 0 } }),
    listByCompany: vi.fn().mockResolvedValue({ data: { data: [], total: 0 } }),
    listBySpecialist: vi.fn().mockResolvedValue({ data: { data: [], total: 0 } }),
    getById: vi.fn().mockResolvedValue({ data: { id: 'p1', title: 'Test Project', description: 'Desc', budget: 10000, deadline: '2030-01-01', status: 'OPEN', companyId: 'c1', skills: [] } }),
    create: vi.fn().mockResolvedValue({ data: { id: 'p1' } }),
    getMilestones: vi.fn().mockResolvedValue({ data: [] }),
  },
}))

vi.mock('../api/bids', () => ({
  bidsApi: {
    submit: vi.fn().mockResolvedValue({ data: { id: 'b1' } }),
    listForProject: vi.fn().mockResolvedValue({ data: [] }),
    myBids: vi.fn().mockResolvedValue({ data: [] }),
    accept: vi.fn().mockResolvedValue({ data: {} }),
    reject: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

vi.mock('../api/payments', () => ({
  paymentsApi: {
    list: vi.fn().mockResolvedValue({ data: [] }),
    listMine: vi.fn().mockResolvedValue({ data: [] }),
    releaseMilestone: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

vi.mock('../api/portfolio', () => ({
  portfolioApi: {
    getMyProfile: vi.fn().mockResolvedValue({ data: { id: 'sp1', userId: 'u1', name: 'Test', type: 'specialist', skills: [], rating: 4.5 } }),
    getPublicProfile: vi.fn().mockResolvedValue({ data: { id: 'sp1', userId: 'u1', name: 'Test', type: 'specialist', skills: [], rating: 4.5 } }),
    listSpecialists: vi.fn().mockResolvedValue({ data: [] }),
  },
}))

vi.mock('../api/milestones', () => ({
  milestonesApi: {
    submit: vi.fn().mockResolvedValue({ data: {} }),
    approve: vi.fn().mockResolvedValue({ data: {} }),
    updateStatus: vi.fn().mockResolvedValue({ data: {} }),
    getHistory: vi.fn().mockResolvedValue({ data: [] }),
    addComment: vi.fn().mockResolvedValue({ data: {} }),
    getComments: vi.fn().mockResolvedValue({ data: [] }),
  },
}))

// ── Imports de paginas ─────────────────────────────────────────────────────

import LandingPage from '../pages/LandingPage'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import PasswordRecovery from '../pages/PasswordRecovery'
import Privacy from '../pages/Privacy'
import DashboardEmpresa from '../pages/DashboardEmpresa'
import DashboardEspecialista from '../pages/DashboardEspecialista'
import CreateProject from '../pages/CreateProject'
import Bidding from '../pages/Bidding'
import AvaliarPropostas from '../pages/AvaliarPropostas'
import Kanban from '../pages/Kanban'
import Financeiro from '../pages/Financeiro'
import GanhosEspecialista from '../pages/GanhosEspecialista'
import ExplorarTalentos from '../pages/ExplorarTalentos'
import Portfolio from '../pages/Portfolio'
import PerfilEspecialista from '../pages/PerfilEspecialista'
import PerfilEmpresa from '../pages/PerfilEmpresa'
import Inbox from '../pages/Inbox'
import Notificacoes from '../pages/Notificacoes'
import Settings from '../pages/Settings'
import Suporte from '../pages/Suporte'
import Admin from '../pages/Admin'

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Paginas publicas ───────────────────────────────────────────────────────

describe('Paginas publicas', () => {
  it('LandingPage renderiza sem crash', () => {
    renderWithProviders(<LandingPage />)
    expect(document.body).toBeTruthy()
  })

  it('Login renderiza formulario', () => {
    renderWithProviders(<Login />)
    expect(screen.getByPlaceholderText('admin@empresa.com')).toBeTruthy()
  })

  it('Signup renderiza formulario', () => {
    renderWithProviders(<Signup />)
    expect(document.body.textContent).toBeTruthy()
  })

  it('PasswordRecovery renderiza sem crash', () => {
    renderWithProviders(<PasswordRecovery />)
    expect(document.body).toBeTruthy()
  })

  it('Privacy renderiza sem crash', () => {
    renderWithProviders(<Privacy />)
    expect(document.body).toBeTruthy()
  })
})

// ── Dashboards ─────────────────────────────────────────────────────────────

describe('Dashboards', () => {
  it('DashboardEmpresa renderiza sem crash', () => {
    renderWithProviders(<DashboardEmpresa />)
    expect(document.body).toBeTruthy()
  })

  it('DashboardEspecialista renderiza sem crash', () => {
    renderWithProviders(<DashboardEspecialista />)
    expect(document.body).toBeTruthy()
  })
})

// ── Gestao de projetos ─────────────────────────────────────────────────────

describe('Gestao de projetos', () => {
  it('CreateProject renderiza wizard', () => {
    renderWithProviders(<CreateProject />)
    expect(document.body).toBeTruthy()
  })

  it('Bidding renderiza sem crash', () => {
    renderWithProviders(<Bidding />)
    expect(document.body).toBeTruthy()
  })

  it('AvaliarPropostas renderiza sem crash', () => {
    renderWithProviders(<AvaliarPropostas />)
    expect(document.body).toBeTruthy()
  })

  it('Kanban renderiza sem crash', () => {
    renderWithProviders(<Kanban />)
    expect(document.body).toBeTruthy()
  })
})

// ── Financeiro ─────────────────────────────────────────────────────────────

describe('Financeiro', () => {
  it('Financeiro renderiza sem crash', () => {
    renderWithProviders(<Financeiro />)
    expect(document.body).toBeTruthy()
  })

  it('GanhosEspecialista renderiza sem crash', () => {
    renderWithProviders(<GanhosEspecialista />)
    expect(document.body).toBeTruthy()
  })
})

// ── Portfolio e perfis ─────────────────────────────────────────────────────

describe('Portfolio e perfis', () => {
  it('ExplorarTalentos renderiza sem crash', () => {
    renderWithProviders(<ExplorarTalentos />)
    expect(document.body).toBeTruthy()
  })

  it('Portfolio renderiza sem crash', () => {
    renderWithProviders(<Portfolio />)
    expect(document.body).toBeTruthy()
  })

  it('PerfilEspecialista renderiza sem crash', () => {
    renderWithProviders(<PerfilEspecialista />)
    expect(document.body).toBeTruthy()
  })

  it('PerfilEmpresa renderiza sem crash', () => {
    renderWithProviders(<PerfilEmpresa />)
    expect(document.body).toBeTruthy()
  })
})

// ── Comunicacao ────────────────────────────────────────────────────────────

describe('Comunicacao', () => {
  it('Inbox renderiza sem crash', () => {
    renderWithProviders(<Inbox />)
    expect(document.body).toBeTruthy()
  })

  it('Notificacoes renderiza sem crash', () => {
    renderWithProviders(<Notificacoes />)
    expect(document.body).toBeTruthy()
  })
})

// ── Configuracoes e admin ──────────────────────────────────────────────────

describe('Configuracoes e admin', () => {
  it('Settings renderiza sem crash', () => {
    renderWithProviders(<Settings />)
    expect(document.body).toBeTruthy()
  })

  it('Suporte renderiza sem crash', () => {
    renderWithProviders(<Suporte />)
    expect(document.body).toBeTruthy()
  })

  it('Admin renderiza sem crash', () => {
    renderWithProviders(<Admin />)
    expect(document.body).toBeTruthy()
  })
})
