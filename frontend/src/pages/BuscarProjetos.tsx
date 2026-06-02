import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Calendar, Wallet, Tag, ArrowRight, ListChecks } from 'lucide-react'
import Navbar from '../components/Navbar'
import { projectsApi, Project } from '../api/projects'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function BuscarProjetos() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [skillFilter, setSkillFilter] = useState('')

  useEffect(() => {
    projectsApi.listOpen()
      .then(res => setProjects(res.data.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
    const matchMin = !minBudget || p.budget >= Number(minBudget)
    const matchMax = !maxBudget || p.budget <= Number(maxBudget)
    const matchSkill = !skillFilter || (p.skills ?? []).some(s => s.toLowerCase().includes(skillFilter.toLowerCase()))
    return matchSearch && matchMin && matchMax && matchSkill
  })

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-brand-500 animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-brand-500 uppercase">Meraki // Projetos Disponíveis</span>
            </div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Buscar Projetos</h1>
            <p className="text-sm text-zinc-400 font-mono mt-2">Projetos abertos aguardando propostas de especialistas.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-brand-500">{filtered.length}</span>
            <span className="font-mono text-xs text-zinc-500">projeto{filtered.length !== 1 ? 's' : ''} disponíve{filtered.length !== 1 ? 'is' : 'l'}</span>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="hidden lg:flex flex-col gap-4 w-56 shrink-0">
            <div className="bg-dark-card border border-dark-border p-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-dark-border">
                <Filter className="w-3.5 h-3.5 text-brand-500" />
                <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">Filtros</h2>
              </div>

              <div className="mb-5">
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Habilidade / Tecnologia</p>
                <div className="relative">
                  <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
                  <input
                    type="text"
                    value={skillFilter}
                    onChange={e => setSkillFilter(e.target.value)}
                    placeholder="Ex: React, NestJS..."
                    className="w-full pl-7 pr-3 py-1.5 bg-dark-input border border-dark-border text-[10px] font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
                  />
                </div>
              </div>

              <div className="mb-5">
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Orçamento (BRL)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minBudget}
                    onChange={e => setMinBudget(e.target.value)}
                    placeholder="Mín"
                    className="w-full bg-dark-input border border-dark-border px-2 py-1.5 text-[10px] font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
                  />
                  <span className="text-zinc-600 font-mono text-[10px]">—</span>
                  <input
                    type="number"
                    value={maxBudget}
                    onChange={e => setMaxBudget(e.target.value)}
                    placeholder="Máx"
                    className="w-full bg-dark-input border border-dark-border px-2 py-1.5 text-[10px] font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
                  />
                </div>
              </div>

              {(skillFilter || minBudget || maxBudget) && (
                <button
                  onClick={() => { setSkillFilter(''); setMinBudget(''); setMaxBudget('') }}
                  className="w-full font-mono text-[10px] text-zinc-500 hover:text-zinc-300 py-1.5 border border-transparent hover:border-dark-border transition-colors uppercase tracking-widest"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Search bar */}
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="BUSCAR POR TÍTULO OU DESCRIÇÃO..."
                  className="w-full pl-9 pr-3 py-2.5 bg-dark-input border border-dark-border text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand-500 rounded-none"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16 font-mono text-zinc-500">Carregando projetos...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 border border-zinc-800 border-dashed font-mono text-zinc-500">
                Nenhum projeto encontrado com os filtros aplicados.
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(p => (
                  <ProjectCard key={p.id} project={p} onApply={() => navigate(`/bidding/${p.id}`)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function ProjectCard({ project: p, onApply }: { project: Project; onApply: () => void }) {
  return (
    <div className="bg-dark-card border border-dark-border p-6 hover:border-brand-500/50 transition-colors relative group">
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-blue-400 border border-blue-400/30 bg-blue-400/10 px-2 py-0.5">ABERTO</span>
            <span className="font-mono text-[10px] text-zinc-600 truncate">{p.id.slice(0, 8)}</span>
          </div>
          <h3 className="text-lg font-bold text-white">{p.title}</h3>
        </div>
        <button
          onClick={onApply}
          className="shrink-0 btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-5 py-2.5 hover:bg-brand-400 border border-brand-500 transition-colors flex items-center gap-2"
        >
          CANDIDATAR <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {p.description && (
        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{p.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-brand-500" />
          <span className="font-mono text-xs text-white">{fmt(p.budget)}</span>
        </div>
        {p.deadline && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span className="font-mono text-xs text-zinc-400">
              Prazo: {new Date(p.deadline).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}
        {p.skills && p.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {p.skills.slice(0, 4).map(s => (
              <span key={s} className="text-[9px] font-mono border border-zinc-700 bg-dark-input text-zinc-400 px-1.5 py-0.5">
                {s}
              </span>
            ))}
            {p.skills.length > 4 && (
              <span className="text-[9px] font-mono text-zinc-600">+{p.skills.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {p.milestones && p.milestones.length > 0 && (
        <div className="border-t border-dark-border pt-3">
          <div className="flex items-center gap-1.5 mb-2">
            <ListChecks className="w-3 h-3 text-zinc-500" />
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
              {p.milestones.length} milestone{p.milestones.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-1">
            {p.milestones.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((m, i) => (
              <div key={m.id} className="flex items-center justify-between bg-dark-input px-3 py-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[9px] text-zinc-600 shrink-0">M{i + 1}</span>
                  <span className="font-mono text-[10px] text-zinc-300 truncate">{m.title}</span>
                </div>
                <span className="font-mono text-[10px] text-brand-500 font-bold shrink-0 ml-2">{fmt(m.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
