/**
 * Issue #99 — debounce dos filtros da página Explorar Talentos (/talents).
 *
 * Comportamento esperado: a busca por texto e os cliques em skill chips devem
 * ser agrupados (~300ms) em UMA única filtragem (fetchAndFilter), em vez de
 * disparar uma por interação. O botão BUSCAR()/Enter continua imediato.
 *
 * Usa fake timers — não precisa de backend nem login.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent, act } from '@testing-library/react'
import { renderWithProviders } from './helpers'

const SPECIALISTS = [
  { id: '1', userId: 'u1', name: 'Ana React', type: 'specialist', bio: 'Frontend', skills: ['react'], rating: 5, completedProjects: 3 },
  { id: '2', userId: 'u2', name: 'Bruno Node', type: 'specialist', bio: 'Backend', skills: ['node'], rating: 4, completedProjects: 1 },
  // Perfil sem nome (name nulo vindo do banco) — não pode quebrar o filtro de texto
  { id: '3', userId: 'u3', name: null, type: 'specialist', bio: 'Perfil incompleto', skills: [], rating: 0, completedProjects: 0 },
]

vi.mock('../api/portfolio', () => ({
  portfolioApi: { listSpecialists: vi.fn() },
}))
vi.mock('../api/skills', () => ({
  skillsApi: { getAll: vi.fn() },
}))

import ExplorarTalentos from '../pages/ExplorarTalentos'
import { portfolioApi } from '../api/portfolio'
import { skillsApi } from '../api/skills'

const listSpecialists = vi.mocked(portfolioApi.listSpecialists)
const getAllSkills = vi.mocked(skillsApi.getAll)

beforeEach(() => {
  vi.clearAllMocks()
  listSpecialists.mockResolvedValue({ data: SPECIALISTS } as any)
  getAllSkills.mockResolvedValue({ data: [{ name: 'react' }, { name: 'node' }] } as any)
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

/** Monta a página e processa os efeitos de mount (carga de skills, AuthProvider). */
async function renderPage() {
  renderWithProviders(<ExplorarTalentos />)
  await act(async () => {})
}

function typeSearch(value: string) {
  fireEvent.change(screen.getByPlaceholderText('BUSCAR ESPECIALISTA...'), { target: { value } })
}

const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms) })

describe('ExplorarTalentos — debounce dos filtros (issue #99)', () => {
  it('não dispara busca ao montar (preserva o estado inicial)', async () => {
    await renderPage()
    await advance(1000)
    expect(listSpecialists).not.toHaveBeenCalled()
    expect(screen.getByText(/selecione uma habilidade para buscar/i)).toBeInTheDocument()
  })

  it('agrupa várias teclas em UMA busca após ~300ms', async () => {
    await renderPage()
    typeSearch('r'); typeSearch('re'); typeSearch('rea'); typeSearch('reac'); typeSearch('react')

    // antes do debounce: nada disparou
    expect(listSpecialists).not.toHaveBeenCalled()
    // logo antes dos 300ms: ainda nada
    await advance(299)
    expect(listSpecialists).not.toHaveBeenCalled()
    // ao cruzar 300ms: exatamente 1 chamada (as 5 teclas colapsaram)
    await advance(1)
    expect(listSpecialists).toHaveBeenCalledTimes(1)
  })

  it('aplica o filtro de texto corretamente após o debounce', async () => {
    await renderPage()
    typeSearch('ana')
    await advance(300)
    expect(screen.getByText('Ana React')).toBeInTheDocument()
    expect(screen.queryByText('Bruno Node')).not.toBeInTheDocument()
  })

  it('o botão BUSCAR() filtra na hora e cancela o debounce pendente', async () => {
    await renderPage()
    typeSearch('ana')
    // clica sem avançar o tempo → deve buscar imediatamente
    await act(async () => { fireEvent.click(screen.getByText('BUSCAR()')) })
    expect(listSpecialists).toHaveBeenCalledTimes(1)
    // o timer pendente foi cancelado: avançar não gera uma segunda busca
    await advance(300)
    expect(listSpecialists).toHaveBeenCalledTimes(1)
  })

  it('não quebra a busca quando um especialista está sem nome (name nulo)', async () => {
    await renderPage()
    typeSearch('ana')
    await advance(300)
    // filtrou sem lançar TypeError; o perfil sem nome simplesmente não casa
    expect(screen.getByText('Ana React')).toBeInTheDocument()
    expect(screen.queryByText('Bruno Node')).not.toBeInTheDocument()
  })
})
