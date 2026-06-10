import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Inbox, Wallet, PlusSquare, FolderCode, FolderGit2, Users, Search, Trash2, X, AlertTriangle, Pencil, Plus, BookOpen } from 'lucide-react'
import Navbar from '../components/Navbar'
import { projectsApi, Project } from '../api/projects'
import { extractApiError } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { projectStatusLabel } from '../lib/labels'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const

export default function DashboardEmpresa() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState<Project | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [editTarget, setEditTarget] = useState<Project | null>(null)
  const [completing, setCompleting] = useState<string | null>(null)

  function loadProjects() {
    projectsApi.listByCompany()
      .then(res => {
        const all: Project[] = res.data.data
        const mine = user?.companyId
          ? all.filter(p => p.companyId === user.companyId)
          : all
        setProjects(mine)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadProjects() }, [user?.companyId])

  async function handleComplete(id: string) {
    setCompleting(id)
    try {
      await projectsApi.complete(id)
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'COMPLETED' as const } : p))
    } catch (err: unknown) {
      alert(extractApiError(err, 'Não foi possível completar o projeto. Verifique se todos os milestones foram aprovados.'))
    } finally {
      setCompleting(null)
    }
  }

  async function handleCancel() {
    if (!cancelTarget) return
    setCancelling(true)
    setCancelError('')
    try {
      await projectsApi.cancel(cancelTarget.id)
      setProjects(prev => prev.map(p =>
        p.id === cancelTarget.id ? { ...p, status: 'CANCELLED' as const } : p
      ))
      setCancelTarget(null)
    } catch (err: unknown) {
      setCancelError(extractApiError(err, 'Erro ao cancelar o projeto.'))
    } finally {
      setCancelling(false)
    }
  }

  // ALL hides CANCELLED by default — só aparece se filtro CANCELLED está ativo
  const filtered = projects.filter(p => {
    const matchFilter = filter === 'ALL'
      ? p.status !== 'CANCELLED'
      : p.status === filter
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const inProgress = projects.filter(p => p.status === 'IN_PROGRESS').length
  const open       = projects.filter(p => p.status === 'OPEN').length
  const committed  = projects.filter(p => p.status === 'IN_PROGRESS').reduce((sum, p) => sum + p.budget, 0)

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/skills')}
              className="btn-sharp bg-dark-input text-zinc-300 font-bold uppercase tracking-widest text-xs px-5 py-3 border border-dark-border hover:border-brand-500 transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Skills
            </button>
            <button
              onClick={() => navigate('/projects/new')}
              className="btn-sharp bg-brand-500 text-dark-bg font-bold uppercase tracking-widest text-xs px-6 py-3 hover:bg-brand-400 border border-brand-500 transition-colors flex items-center gap-2 shadow-[4px_4px_0px_rgba(85,202,124,0.2)]"
            >
              <PlusSquare className="w-4 h-4" />
              Novo Projeto
            </button>
          </div>
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
              <span className="text-xs text-brand-500 font-mono">/ Em Andamento</span>
            </div>
          </div>
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Aguardando Propostas</span>
              <Inbox className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-mono">{String(open).padStart(2, '0')}</span>
              <span className="text-xs text-blue-400 font-mono">/ Aberto</span>
            </div>
          </div>
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Orçamento Comprometido</span>
              <Wallet className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">{fmt(committed)}</span>
              <span className="text-xs text-purple-400 font-mono">/ EM ANDAMENTO</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-dark-card border border-dark-border p-2">
          <div className="flex overflow-x-auto w-full md:w-auto gap-1">
            {STATUS_FILTERS.map(s => {
              const label = s === 'ALL' ? '[ ATIVOS ]' : (projectStatusLabel[s] ?? s)
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 text-xs font-mono font-bold whitespace-nowrap transition-colors ${
                    filter === s
                      ? s === 'CANCELLED'
                        ? 'text-dark-bg bg-red-500 border border-red-500'
                        : 'text-dark-bg bg-brand-500 border border-brand-500'
                      : 'text-zinc-400 hover:text-white hover:bg-dark-input border border-transparent hover:border-dark-border'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500" />
            </div>
            <input
              type="text"
              maxLength={100}
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
            {filter === 'ALL'
              ? 'Nenhum projeto ativo. Clique em "Novo Projeto" para começar.'
              : `Nenhum projeto com status ${(projectStatusLabel[filter] ?? filter).toLowerCase()}.`}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                onViewBids={() => navigate(`/projects/${p.id}/bids`)}
                onOpenKanban={() => navigate(`/kanban/${p.id}`)}
                onCancel={() => { setCancelTarget(p); setCancelError('') }}
                onEdit={() => setEditTarget(p)}
                onComplete={() => handleComplete(p.id)}
                completing={completing === p.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Edit modal */}
      {editTarget && (
        <EditProjectModal
          project={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={updated => {
            setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
            setEditTarget(null)
          }}
        />
      )}

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => !cancelling && setCancelTarget(null)} />
          <div className="relative bg-dark-card border border-red-500/50 w-full max-w-md p-6 shadow-2xl z-10">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500" />

            <div className="flex items-start gap-3 mb-5">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider mb-1">Cancelar Projeto</h2>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                  O projeto <span className="text-white font-bold">"{cancelTarget.title}"</span> será cancelado.
                  {cancelTarget.status === 'IN_PROGRESS' && (
                    <span className="block mt-2 text-orange-400">
                      Atenção: este projeto está em andamento com um especialista.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {cancelError && (
              <p className="font-mono text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2 mb-4">{cancelError}</p>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="font-mono text-xs text-zinc-400 border border-dark-border px-4 py-2 hover:border-zinc-500 transition-colors uppercase disabled:opacity-50 flex items-center gap-1.5"
              >
                <X className="w-3 h-3" /> Manter
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="btn-sharp bg-red-500 text-white font-mono font-bold text-xs px-5 py-2 border border-red-500 hover:bg-red-600 transition-colors uppercase disabled:opacity-60 flex items-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" />
                {cancelling ? 'Cancelando...' : 'Cancelar Projeto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EditProjectModal({ project, onClose, onSave }: {
  project: Project
  onClose: () => void
  onSave: (updated: Project) => void
}) {
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description ?? '')
  const [skills, setSkills] = useState<string[]>(project.skills ?? [])
  const [skillInput, setSkillInput] = useState('')
  const [budget, setBudget] = useState(String(project.budget))
  const [deadline, setDeadline] = useState(
    project.deadline ? String(project.deadline).slice(0, 10) : ''
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function addSkill() {
    const v = skillInput.trim()
    if (v && !skills.includes(v)) setSkills(prev => [...prev, v])
    setSkillInput('')
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await projectsApi.update(project.id, {
        title,
        description,
        requirements: skills,
        budget: Number(budget),
        deadline,
      })
      onSave(res.data)
    } catch (err: unknown) {
      setError(extractApiError(err, 'Erro ao salvar. Tente novamente.'))
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={() => !saving && onClose()} />
      <div className="relative bg-dark-card border border-dark-border w-full max-w-xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

        <div className="flex items-center justify-between mb-6 border-b border-dark-border pb-4">
          <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">Editar Projeto</h2>
          <button onClick={onClose} disabled={saving} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-brand-500 uppercase tracking-wider block">Título</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] text-brand-500 uppercase tracking-wider block">Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none h-28 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] text-brand-500 uppercase tracking-wider block">Tecnologias & Requisitos</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Ex: NestJS, React, Docker..."
                className="flex-1 px-4 py-2 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
              />
              <button type="button" onClick={addSkill}
                className="bg-dark-input text-white font-mono text-xs px-4 py-2 border border-dark-border hover:border-brand-500 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-[#000] border border-dark-border p-3 min-h-[48px] flex flex-wrap gap-2">
              {skills.length === 0 && (
                <span className="font-mono text-[10px] text-zinc-600">Nenhum requisito adicionado.</span>
              )}
              {skills.map(s => (
                <span key={s}
                  onClick={() => setSkills(skills.filter(sk => sk !== s))}
                  className="group flex items-center gap-1 text-[10px] font-mono border border-zinc-700 bg-dark-input text-zinc-300 px-2 py-1 hover:border-red-500 transition-colors cursor-pointer">
                  {s} <X className="w-2.5 h-2.5 text-zinc-600 group-hover:text-red-500" />
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-brand-500 uppercase tracking-wider block">Orçamento (BRL)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-zinc-500 text-sm">R$</span>
                <input
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 rounded-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-brand-500 uppercase tracking-wider block">Prazo de Entrega</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 rounded-none"
              />
            </div>
          </div>

          {error && (
            <p className="font-mono text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-dark-border">
          <button onClick={onClose} disabled={saving}
            className="font-mono text-xs text-zinc-400 border border-dark-border px-4 py-2 hover:border-zinc-500 transition-colors uppercase disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="btn-sharp bg-brand-500 text-dark-bg font-mono font-bold text-xs px-6 py-2 border border-brand-500 hover:bg-brand-400 transition-colors uppercase disabled:opacity-60 flex items-center gap-2">
            <Pencil className="w-3.5 h-3.5" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ project: p, onViewBids, onOpenKanban, onCancel, onEdit, onComplete, completing }: {
  project: Project
  onViewBids: () => void
  onOpenKanban: () => void
  onCancel: () => void
  onEdit: () => void
  onComplete: () => void
  completing: boolean
}) {
  const isOpen      = p.status === 'OPEN'
  const isCancelled = p.status === 'CANCELLED'
  const canCancel   = p.status === 'OPEN' || p.status === 'IN_PROGRESS'

  const statusColor = isCancelled
    ? 'text-red-400 border-red-400/30 bg-red-400/10'
    : isOpen
      ? 'text-blue-400 border-blue-400/30 bg-blue-400/10'
      : p.status === 'COMPLETED'
        ? 'text-zinc-400 border-zinc-400/30 bg-zinc-400/10'
        : 'text-brand-500 border-brand-500/30 bg-brand-500/10'

  return (
    <div className={`bg-dark-card border p-6 transition-colors relative group flex flex-col shadow-[inset_0px_0px_20px_rgba(85,202,124,0.02)] ${
      isCancelled ? 'border-red-500/20 opacity-60' : 'border-dark-border hover:border-brand-500/50'
    }`}>
      {!isCancelled && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 min-w-0">
          {isOpen ? <FolderCode className="w-4 h-4 text-zinc-500 shrink-0" /> : <FolderGit2 className="w-4 h-4 text-brand-500 shrink-0" />}
          <span className="font-mono text-xs text-zinc-600 truncate">{p.id.slice(0, 12)}…</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`font-mono text-[10px] ${statusColor} px-2 py-1 tracking-widest flex items-center gap-1.5`}>
            {p.status === 'IN_PROGRESS' && <span className="w-1.5 h-1.5 bg-brand-500 animate-pulse" />}
            {projectStatusLabel[p.status] ?? p.status}
          </span>
          {isOpen && (
            <button
              onClick={e => { e.stopPropagation(); onEdit() }}
              title="Editar projeto"
              className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-brand-500 hover:bg-brand-500/10 border border-transparent hover:border-brand-500/30 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {canCancel && (
            <button
              data-testid={`cancel-project-${p.id}`}
              onClick={e => { e.stopPropagation(); onCancel() }}
              title="Cancelar projeto"
              className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
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
          <p className="font-mono text-[10px] text-zinc-500 uppercase mb-1">Prazo</p>
          <p className="font-mono text-white">{p.deadline}</p>
        </div>
      </div>

      {!isCancelled && (
        isOpen ? (
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
        ) : p.status === 'IN_PROGRESS' ? (
          <div className="flex flex-col gap-2 border-t border-dark-border pt-4 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] text-zinc-500 uppercase">Especialista</p>
                <p className="font-mono text-xs text-white">{p.specialistId ?? 'N/A'}</p>
              </div>
              <button
                onClick={onOpenKanban}
                className="btn-sharp bg-brand-500 text-dark-bg hover:bg-brand-400 font-mono font-bold text-xs px-4 py-2 border border-brand-500 transition-colors"
              >
                ABRIR_KANBAN()
              </button>
            </div>
            <button
              data-testid={`complete-project-${p.id}`}
              onClick={onComplete}
              disabled={completing}
              className="w-full btn-sharp bg-dark-input text-zinc-400 hover:text-white hover:border-brand-500 font-mono font-bold text-xs px-4 py-2 border border-dark-border transition-colors disabled:opacity-50 uppercase"
            >
              {completing ? 'Completando...' : 'MARCAR_COMPLETO()'}
            </button>
          </div>
        ) : (
          <div className="border-t border-dark-border pt-4 mt-2">
            <span className="font-mono text-[10px] text-zinc-500 uppercase">Projeto {(projectStatusLabel[p.status] ?? p.status).toLowerCase()}</span>
          </div>
        )
      )}
    </div>
  )
}
