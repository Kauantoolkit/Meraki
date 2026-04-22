import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Inbox, Wallet, PlusSquare, FolderCode, FolderGit2, Users, Search } from 'lucide-react'
import Navbar from '../components/Navbar'
import { projectsApi, Project } from '../api/projects'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function DashboardEmpresa() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    projectsApi.listByCompany()
      .then(res => setProjects(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = projects.filter(p => {
    const matchFilter = filter === 'ALL' || p.status === filter
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const inProgress = projects.filter(p => p.status === 'IN_PROGRESS').length
  const open = projects.filter(p => p.status === 'OPEN').length
  const committed = projects.filter(p => p.status === 'IN_PROGRESS').reduce((sum, p) => sum + p.budget, 0)

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased overflow-x-hidden">
      <div className="scanline" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-brand-500 animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-brand-500 uppercase">Status: Online</span>
            </div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Meus Projetos</h1>
            <p className="text-sm text-zinc-400 font-mono mt-2">Gerencie licitações, acompanhe milestones e aprove entregas.</p>
          </div>
          <button
            onClick={() => navigate('/projects/new')}
            className="btn-sharp bg-brand-500 text-dark-bg font-bold uppercase tracking-widest text-xs px-6 py-3 hover:bg-brand-400 border border-brand-500 transition-colors flex items-center gap-2 shadow-[4px_4px_0px_rgba(85,202,124,0.2)]"
          >
            <PlusSquare className="w-4 h-4" />
            Deploy Projeto
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-card border border-dark-border p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Projetos Ativos</span>
              <Activity className="w-4 h-4 text-brand-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-mono">{String(inProgress).padStart(2, '0')}</span>
              <span className="text-xs text-brand-500 font-mono">/ IN_PROGRESS</span>
            </div>
          </div>
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Aguardando Propostas</span>
              <Inbox className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-mono">{String(open).padStart(2, '0')}</span>
              <span className="text-xs text-blue-400 font-mono">/ OPEN</span>
            </div>
          </div>
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Orçamento Comprometido</span>
              <Wallet className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">{fmt(committed)}</span>
              <span className="text-xs text-purple-400 font-mono">/ ESCROW</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-dark-card border border-dark-border p-2">
          <div className="flex overflow-x-auto w-full md:w-auto gap-1">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 text-xs font-mono font-bold whitespace-nowrap transition-colors ${filter === s ? 'text-dark-bg bg-brand-500 border border-brand-500' : 'text-zinc-400 hover:text-white hover:bg-dark-input border border-transparent hover:border-dark-border'}`}
              >
                {s === 'ALL' ? '[ TODOS ]' : s}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500" />
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="BUSCAR PROJETO..."
              className="w-full pl-9 pr-3 py-2 bg-dark-input border border-dark-border text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand-500 rounded-none"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-12 font-mono text-zinc-500">Carregando projetos...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12 border border-zinc-800 border-dashed text-zinc-500 font-mono text-sm">
            Nenhum projeto encontrado. Clique em "Deploy Projeto" para começar.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map(p => (
              <ProjectCard key={p.id} project={p} onViewBids={() => navigate(`/projects/${p.id}/bids`)} onOpenKanban={() => navigate(`/kanban/${p.id}`)} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function ProjectCard({ project: p, onViewBids, onOpenKanban }: {
  project: Project
  onViewBids: () => void
  onOpenKanban: () => void
}) {
  const isOpen = p.status === 'OPEN'
  const statusColor = isOpen
    ? 'text-blue-400 border-blue-400/30 bg-blue-400/10'
    : 'text-brand-500 border-brand-500/30 bg-brand-500/10'

  return (
    <div className="bg-dark-card border border-dark-border p-6 hover:border-brand-500/50 transition-colors relative group flex flex-col shadow-[inset_0px_0px_20px_rgba(85,202,124,0.02)]">
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          {isOpen ? <FolderCode className="w-4 h-4 text-zinc-500" /> : <FolderGit2 className="w-4 h-4 text-brand-500" />}
          <span className={`font-mono text-xs ${isOpen ? 'text-zinc-500' : 'text-brand-500'}`}>{p.id}</span>
        </div>
        <span className={`font-mono text-[10px] ${statusColor} px-2 py-1 tracking-widest flex items-center gap-1.5`}>
          {!isOpen && <span className="w-1.5 h-1.5 bg-brand-500 animate-pulse" />}
          STATUS: {p.status}
        </span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{p.title}</h3>
      <p className="text-sm text-zinc-400 mb-6 line-clamp-2">{p.description || 'Descrição não fornecida.'}</p>
      <div className="flex-grow" />

      <div className="grid grid-cols-2 gap-4 bg-dark-input p-4 border border-dark-border mt-3 mb-2">
        <div>
          <p className="font-mono text-[10px] text-zinc-500 uppercase mb-1">Orçamento</p>
          <p className="font-mono font-bold text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.budget)}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] text-zinc-500 uppercase mb-1">Deadline</p>
          <p className="font-mono text-white">{p.deadline}</p>
        </div>
      </div>

      {isOpen ? (
        <div className="flex items-center justify-between border-t border-dark-border pt-4 mt-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-600" />
            <span className="font-mono text-[10px] text-zinc-500">Avaliar candidaturas</span>
          </div>
          <button
            onClick={onViewBids}
            className="btn-sharp bg-brand-500 text-dark-bg hover:bg-brand-400 font-mono font-bold text-xs px-4 py-2 border border-brand-500 transition-colors"
          >
            VER_PROPOSTAS()
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between border-t border-dark-border pt-4 mt-2">
          <div>
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Especialista</p>
            <p className="font-mono text-xs text-white">{p.specialistId ?? 'N/A'}</p>
          </div>
          <button
            onClick={onOpenKanban}
            className="btn-sharp bg-brand-500 text-dark-bg hover:bg-brand-400 font-mono font-bold text-xs px-4 py-2 border border-brand-500 transition-colors"
          >
            OPEN_KANBAN()
          </button>
        </div>
      )}
    </div>
  )
}
