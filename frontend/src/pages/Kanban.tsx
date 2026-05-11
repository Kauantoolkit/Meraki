import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Terminal, Settings2, UploadCloud, ShieldCheck, Check, Send, User, Calendar, Lock } from 'lucide-react'
import Navbar from '../components/Navbar'
import { projectsApi, Project, Milestone } from '../api/projects'
import { milestonesApi } from '../api/milestones'
import { useAuth } from '../contexts/AuthContext'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

type KanbanStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED_REVIEW' | 'APPROVED'

const COLS: { key: KanbanStatus; label: string; color: string; headerCls: string }[] = [
  { key: 'PENDING',         label: 'PENDING',          color: 'text-zinc-300',  headerCls: 'border-dark-border' },
  { key: 'IN_PROGRESS',     label: 'IN_PROGRESS',      color: 'text-brand-500', headerCls: 'border-brand-500/30 bg-brand-500/5' },
  { key: 'SUBMITTED_REVIEW',label: 'SUBMITTED_REVIEW', color: 'text-blue-400',  headerCls: 'border-blue-500/30' },
  { key: 'APPROVED',        label: 'APPROVED',         color: 'text-zinc-400',  headerCls: 'border-zinc-700' },
]

export default function Kanban() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  // Submit modal
  const [submitModal, setSubmitModal] = useState(false)
  const [approveModal, setApproveModal] = useState(false)
  const [pendingMilestoneId, setPendingMilestoneId] = useState<string | null>(null)
  const [repoUrl, setRepoUrl] = useState('')
  const [releaseNotes, setReleaseNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const isCompany = ((user?.userType ?? user?.type) as string)?.toUpperCase() === 'COMPANY'

  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard', { replace: true })
      return
    }
    Promise.all([projectsApi.getById(projectId), projectsApi.getMilestones(projectId)])
      .then(([pRes, mRes]) => {
        setProject(pRes.data)
        setMilestones(mRes.data)
      })
      .finally(() => setLoading(false))
  }, [projectId])

  async function startMilestone(milestoneId: string) {
    setActionLoading(true)
    try {
      await milestonesApi.start(milestoneId)
      const updated = await projectsApi.getMilestones(projectId!)
      setMilestones(updated.data)
    } catch {
      alert('Erro ao iniciar milestone.')
    } finally {
      setActionLoading(false)
    }
  }

  async function confirmSubmit() {
    if (!pendingMilestoneId || !projectId) return
    setActionLoading(true)
    try {
      await milestonesApi.submit({
        milestoneId: pendingMilestoneId,
        projectId,
        deliveryNotes: releaseNotes || undefined,
        deliveredFiles: repoUrl ? [repoUrl] : undefined,
      })
      const updated = await projectsApi.getMilestones(projectId)
      setMilestones(updated.data)
      setSubmitModal(false)
      setRepoUrl('')
      setReleaseNotes('')
    } catch {
      alert('Erro ao submeter entrega.')
    } finally {
      setActionLoading(false)
    }
  }

  async function confirmApprove() {
    if (!pendingMilestoneId) return
    setActionLoading(true)
    try {
      await milestonesApi.approve(pendingMilestoneId)
      const updated = await projectsApi.getMilestones(projectId!)
      setMilestones(updated.data)
      setApproveModal(false)
    } catch {
      alert('Erro ao aprovar milestone.')
    } finally {
      setActionLoading(false)
    }
  }

  const byStatus = (status: KanbanStatus) => milestones.filter(m => m.status === status)

  // RN04: only the first PENDING milestone (by order) whose all predecessors are APPROVED can be started
  const sorted = [...milestones].sort((a, b) => a.order - b.order)
  const nextStartableId = (() => {
    for (const m of sorted) {
      if (m.status !== 'PENDING') continue
      const predecessors = sorted.filter(x => x.order < m.order)
      if (predecessors.every(x => x.status === 'APPROVED')) return m.id
      break
    }
    return null
  })()

  if (loading) return (
    <div className="bg-dark-bg min-h-screen flex items-center justify-center">
      <span className="font-mono text-brand-500">Carregando board...</span>
    </div>
  )

  return (
    <div className="bg-dark-bg bg-grid h-screen text-zinc-300 antialiased overflow-hidden flex flex-col">
      <div className="scanline" />
      <Navbar backUrl="/dashboard" projectTitle={project ? `${project.id} // DELIVERY_BOARD` : undefined} />

      {/* Project Header */}
      <header className="shrink-0 bg-dark-card border-b border-dark-border px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-white uppercase tracking-tight mb-1">{project?.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[10px] text-brand-500 border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-brand-500 animate-pulse" />{project?.status}
              </span>
              <span className="font-mono text-[10px] text-zinc-400 border border-dark-border px-2 py-0.5 flex items-center gap-1">
                <User className="w-3 h-3 text-brand-500" /> {project?.specialistId ?? 'Sem especialista'}
              </span>
              <span className="font-mono text-[10px] text-zinc-400 border border-dark-border px-2 py-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-brand-500" /> Deadline: {project?.deadline}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right border-r border-dark-border pr-3">
              <p className="font-mono text-[10px] text-zinc-500 uppercase">Orçamento em Escrow</p>
              <p className="font-mono font-bold text-brand-500">{project ? fmt(project.budget) : '—'}</p>
            </div>
            <button className="btn-sharp bg-dark-input hover:bg-dark-hover text-white font-mono text-xs px-4 py-2 border border-dark-border hover:border-brand-500 transition-colors flex items-center gap-1">
              <Settings2 className="w-4 h-4" /> OPTIONS
            </button>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 flex overflow-hidden">
        <section className="flex-1 overflow-x-auto overflow-y-hidden bg-dark-bg p-4 flex gap-4">
          {COLS.map(col => {
            const cards = byStatus(col.key)
            return (
              <div key={col.key} className="flex-shrink-0 w-80 flex flex-col h-full">
                <div className={`bg-dark-card border ${col.headerCls} p-3 flex justify-between items-center mb-3 relative overflow-hidden`}>
                  {col.key === 'IN_PROGRESS' && <div className="absolute inset-0 bg-brand-500/5" />}
                  <div className="flex items-center gap-2 relative z-10">
                    {col.key === 'APPROVED' ? <Check className="w-3 h-3 text-zinc-400" /> : (
                      <div className={`w-2 h-2 ${col.key === 'IN_PROGRESS' ? 'bg-brand-500 animate-pulse' : col.key === 'SUBMITTED_REVIEW' ? 'bg-blue-500' : 'bg-zinc-600'}`} />
                    )}
                    <h2 className={`font-mono font-bold text-xs ${col.color} ${col.key === 'APPROVED' ? 'line-through decoration-zinc-600' : ''}`}>{col.label}</h2>
                  </div>
                  <span className={`font-mono text-xs bg-dark-input border ${col.key === 'IN_PROGRESS' ? 'border-brand-500/30 text-brand-500' : col.key === 'SUBMITTED_REVIEW' ? 'border-blue-500/30 text-blue-400' : 'border-dark-border text-zinc-500'} px-2 py-0.5 relative z-10`}>
                    {cards.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-4">
                  {cards.length === 0 && col.key !== 'APPROVED' ? (
                    <div className="border border-dashed border-dark-border flex items-center justify-center p-6 bg-dark-input/30 min-h-[100px]">
                      <p className="font-mono text-[10px] text-zinc-500 text-center uppercase tracking-widest">Sem Registos</p>
                    </div>
                  ) : cards.map((m, idx) => (
                    <MilestoneCard
                      key={m.id}
                      milestone={m}
                      index={sorted.indexOf(m) + 1}
                      isCompany={isCompany}
                      canStart={m.id === nextStartableId}
                      onStart={() => startMilestone(m.id)}
                      onSubmit={() => { setPendingMilestoneId(m.id); setSubmitModal(true) }}
                      onApprove={() => { setPendingMilestoneId(m.id); setApproveModal(true) }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </section>

        {/* History Panel */}
        <aside className="w-80 border-l border-dark-border bg-[#000] flex-col h-full hidden lg:flex shrink-0">
          <div className="p-3 border-b border-dark-border bg-dark-card flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-500" />
              <h2 className="font-mono font-bold text-xs text-white uppercase tracking-wider">Project_History</h2>
            </div>
            <div className="w-2 h-2 bg-brand-500 animate-pulse rounded-full" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 terminal-scroll font-mono text-[10px] leading-relaxed space-y-3">
            <div className="text-zinc-500">
              <span className="text-zinc-600">[SYS]</span>{' '}
              <span className="text-brand-500">PROJECT_EVENT:</span>{' '}
              Board carregado para {project?.id ?? '...'}
            </div>
            {milestones.filter(m => m.status !== 'PENDING').map(m => (
              <div key={m.id} className="text-zinc-500">
                <span className="text-zinc-600">[DELIVERY]</span>{' '}
                <span className="text-brand-500">MILESTONE_EVENT:</span>{' '}
                {m.title} → <span className="text-white">{m.status}</span>
              </div>
            ))}
            <div className="text-brand-500 flex items-center mt-4">
              <span>meraki@delivery-service:~$</span>
              <span className="w-2 h-3 bg-brand-500 ml-1 animate-pulse" />
            </div>
          </div>
          <div className="p-3 border-t border-dark-border bg-dark-card">
            <div className="relative">
              <input type="text" placeholder="Registar nota..."
                className="w-full pl-3 pr-10 py-2 bg-dark-input border border-dark-border text-[10px] font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand-500 transition-all rounded-none" />
              <button className="absolute inset-y-0 right-0 px-3 flex items-center text-zinc-500 hover:text-brand-500 transition-colors">
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Submit Modal */}
      {submitModal && (
        <div className="fixed inset-0 z-50 bg-[#000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card border border-blue-500 w-full max-w-md p-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-2 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-400" /> Submeter Entrega
            </h2>
            <p className="text-xs font-mono text-zinc-400 mb-6">Os fundos em <span className="text-brand-500">Escrow</span> ficarão pendentes da aprovação do cliente.</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Repositório / URL</label>
                <input type="text" value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
                  className="w-full bg-[#000] border border-dark-border p-3 text-xs font-mono text-white focus:outline-none focus:border-blue-500" placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Notas de Release</label>
                <textarea value={releaseNotes} onChange={e => setReleaseNotes(e.target.value)}
                  className="w-full bg-[#000] border border-dark-border p-3 text-xs font-sans text-white focus:outline-none focus:border-blue-500 resize-none h-20" placeholder="Descreva o que foi entregue..." />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSubmitModal(false)} className="flex-1 btn-sharp bg-dark-input text-zinc-300 font-mono text-xs px-4 py-3 border border-dark-border hover:border-zinc-500 transition-colors">CANCELAR</button>
              <button onClick={confirmSubmit} disabled={actionLoading} className="flex-1 btn-sharp bg-blue-500 text-dark-bg font-bold font-mono text-xs px-4 py-3 border border-blue-500 hover:bg-blue-400 transition-colors disabled:opacity-70">
                {actionLoading ? 'Enviando...' : 'DEPLOY_SUBMIT()'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModal && (
        <div className="fixed inset-0 z-50 bg-[#000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card border border-brand-500 w-full max-w-md p-6 shadow-[0_0_30px_rgba(85,202,124,0.15)]">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-500" /> Aprovar Milestone
            </h2>
            <div className="bg-brand-500/10 border border-brand-500/30 p-3 mb-4">
              <p className="text-[10px] font-mono text-brand-500 uppercase">Warning: Ação Irreversível</p>
              <p className="text-xs text-zinc-300 mt-1">Ao aprovar, o valor estipulado no Escrow será transferido para o especialista.</p>
            </div>
            <div className="flex items-center gap-3 mb-6 bg-dark-input p-3 border border-dark-border">
              <Lock className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Milestone a Aprovar</p>
                <p className="text-sm font-bold text-white font-mono">
                  {milestones.find(m => m.id === pendingMilestoneId)?.title ?? '—'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setApproveModal(false)} className="flex-1 btn-sharp bg-dark-input text-zinc-300 font-mono text-xs px-4 py-3 border border-dark-border hover:border-zinc-500 transition-colors">CANCELAR</button>
              <button onClick={confirmApprove} disabled={actionLoading} className="flex-1 btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-4 py-3 border border-brand-500 hover:bg-brand-400 transition-colors disabled:opacity-70">
                {actionLoading ? 'Processando...' : 'CONFIRMAR_PAGAMENTO()'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MilestoneCard({ milestone: m, index, isCompany, canStart, onStart, onSubmit, onApprove }: {
  milestone: Milestone
  index: number
  isCompany: boolean
  canStart: boolean
  onStart: () => void
  onSubmit: () => void
  onApprove: () => void
}) {
  const isActive = m.status === 'IN_PROGRESS'
  const isApproved = m.status === 'APPROVED'

  return (
    <div className={`bg-dark-card border ${isActive ? 'border-brand-500/50' : 'border-dark-border'} p-4 transition-colors relative flex flex-col`}>
      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />}

      <div className={`flex justify-between items-start mb-3 ${isActive ? 'pl-2' : ''}`}>
        <span className={`font-mono text-[10px] ${isActive ? 'text-brand-500' : 'text-zinc-500'} bg-dark-input px-1.5 py-0.5 border border-dark-border`}>M{index}</span>
        {isApproved && <ShieldCheck className="w-4 h-4 text-brand-600" />}
      </div>
      <h3 className={`font-semibold text-sm ${isApproved ? 'text-zinc-400 line-through' : 'text-white'} mb-2 ${isActive ? 'pl-2' : ''}`}>{m.title}</h3>

      <div className={`border-t border-dark-border pt-3 mt-auto ${isActive ? 'ml-2' : ''}`}>
        <div className="flex justify-between items-center bg-dark-input p-2 border border-dark-border">
          <span className="font-mono font-bold text-xs text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.amount)}</span>
        </div>

        {isApproved ? (
          <button disabled className="mt-3 w-full text-[10px] font-mono border border-dark-border bg-dark-card py-1.5 text-zinc-500 cursor-not-allowed uppercase">PAGO E FINALIZADO</button>
        ) : !isCompany && m.status === 'PENDING' && canStart ? (
          <button onClick={onStart} className="mt-3 w-full text-[10px] font-mono border border-brand-500 bg-brand-500/10 text-brand-500 py-1.5 hover:bg-brand-500 hover:text-dark-bg transition-colors uppercase">INICIAR TRABALHO</button>
        ) : !isCompany && m.status === 'PENDING' && !canStart ? (
          <button disabled className="mt-3 w-full text-[10px] font-mono border border-dark-border bg-dark-card text-zinc-600 py-1.5 cursor-not-allowed uppercase" title="Conclua a milestone anterior primeiro (RN04)">BLOQUEADA</button>
        ) : !isCompany && m.status === 'IN_PROGRESS' ? (
          <button onClick={onSubmit} className="mt-3 w-full text-[10px] font-mono border border-blue-400 bg-blue-400/10 text-blue-400 py-1.5 hover:bg-blue-400 hover:text-dark-bg transition-colors uppercase">SUBMETER ENTREGA</button>
        ) : isCompany && m.status === 'SUBMITTED_REVIEW' ? (
          <button onClick={onApprove} className="mt-3 w-full text-[10px] font-mono border border-brand-500 bg-brand-500/10 text-brand-500 py-1.5 hover:bg-brand-500 hover:text-dark-bg transition-colors uppercase flex justify-center items-center gap-2">
            <Check className="w-3 h-3" /> APROVAR & PAGAR
          </button>
        ) : null}
      </div>
    </div>
  )
}
