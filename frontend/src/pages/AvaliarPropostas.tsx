import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  User, Coins, CalendarClock, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Loader2, ShieldCheck, Clock,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { projectsApi, Project } from '../api/projects'
import { bidsApi, Bid } from '../api/bids'
import { useAuth } from '../contexts/AuthContext'
import { projectStatusLabel } from '../lib/labels'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const STATUS_META: Record<Bid['status'], { label: string; cls: string }> = {
  PENDING:   { label: 'AGUARDANDO',  cls: 'text-blue-400 border-blue-400/30 bg-blue-400/10' },
  ACCEPTED:  { label: 'ACEITE',      cls: 'text-brand-500 border-brand-500/30 bg-brand-500/10' },
  REJECTED:  { label: 'REJEITADO',   cls: 'text-red-400 border-red-400/30 bg-red-400/10' },
  WITHDRAWN: { label: 'RETIRADO',    cls: 'text-zinc-500 border-zinc-700 bg-dark-input' },
}

export default function AvaliarPropostas() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ bid: Bid; action: 'accept' | 'reject' } | null>(null)

  // Apenas COMPANY pode gerir propostas; especialistas são redirecionados
  useEffect(() => {
    if (user && user.userType !== 'COMPANY') {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const hasAccepted = bids.some(b => b.status === 'ACCEPTED')

  useEffect(() => {
    if (!projectId || !user) return
    Promise.allSettled([projectsApi.getById(projectId), bidsApi.listForProject(projectId)])
      .then(([pResult, bResult]) => {
        if (pResult.status === 'fulfilled') {
          const p = pResult.value.data
          // ACL frontend: redireciona se a empresa logada não for dona do projeto
          // Só aplica se user.companyId já carregou (evita redirect falso-positivo)
          if (user.companyId && p.companyId !== user.companyId) {
            navigate('/dashboard', { replace: true })
            return
          }
          setProject(p)
        }
        if (bResult.status === 'fulfilled') setBids(bResult.value.data)
      })
      .finally(() => setLoading(false))
  }, [projectId, user, navigate])

  async function handleAction(bid: Bid, action: 'accept' | 'reject') {
    setActionId(bid.id)
    setConfirmModal(null)
    try {
      if (action === 'accept') {
        await bidsApi.accept(bid.id)
      } else {
        await bidsApi.reject(bid.id)
      }
      const updated = await bidsApi.listForProject(projectId!)
      setBids(updated.data)
      if (action === 'accept') {
        setTimeout(() => navigate(`/kanban/${projectId}`), 1200)
      }
    } catch {
      alert('Erro ao processar a acção. Tente novamente.')
    } finally {
      setActionId(null)
    }
  }

  if (loading) return (
    <div className="bg-dark-bg min-h-screen flex items-center justify-center">
      <span className="font-mono text-brand-500">Carregando propostas...</span>
    </div>
  )

  const pending  = bids.filter(b => b.status === 'PENDING')
  const accepted = bids.find(b => b.status === 'ACCEPTED')

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar backUrl="/dashboard" projectTitle={project?.title ? `${project.title} // BIDDING_REVIEW` : 'BIDDING_REVIEW'} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">

        {/* Project summary */}
        <div className="bg-dark-card border border-dark-border p-5 mb-8 relative">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-mono text-[9px] border px-2 py-0.5 tracking-widest uppercase ${
                  hasAccepted
                    ? 'text-brand-500 border-brand-500/30 bg-brand-500/10'
                    : 'text-blue-400 border-blue-400/30 bg-blue-400/10'
                }`}>
                  {hasAccepted ? 'ESPECIALISTA SELECIONADO' : `STATUS: ${projectStatusLabel[project?.status ?? ''] ?? project?.status ?? ''}`}
                </span>
                <span className="font-mono text-[10px] text-zinc-600 truncate max-w-[200px]">{project?.id?.slice(0, 12)}</span>
              </div>
              <h1 className="text-xl font-bold text-white">{project?.title}</h1>
              <p className="text-sm text-zinc-400 font-mono mt-1 line-clamp-2">{project?.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-px bg-dark-border shrink-0">
              <div className="bg-dark-input px-4 py-3 text-center">
                <p className="font-mono text-[9px] text-zinc-600 uppercase mb-1">Orçamento</p>
                <p className="font-mono text-sm font-bold text-white">{project ? fmt(project.budget) : '—'}</p>
              </div>
              <div className="bg-dark-input px-4 py-3 text-center">
                <p className="font-mono text-[9px] text-zinc-600 uppercase mb-1">Deadline</p>
                <p className="font-mono text-sm font-bold text-white">{project?.deadline ?? '—'}</p>
              </div>
              <div className="bg-dark-input px-4 py-3 text-center">
                <p className="font-mono text-[9px] text-zinc-600 uppercase mb-1">Propostas</p>
                <p className="font-mono text-sm font-bold text-white">{bids.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accepted winner banner */}
        {accepted && (
          <div className="border border-brand-500/40 bg-brand-500/5 p-4 mb-6 flex items-center gap-4">
            <ShieldCheck className="w-5 h-5 text-brand-500 shrink-0" />
            <div className="flex-1">
              <p className="font-mono text-xs font-bold text-brand-500 uppercase">Especialista Seleccionado</p>
              <p className="font-mono text-[10px] text-zinc-400 mt-0.5">
                {accepted.specialistName ?? `ID: ${accepted.specialistId?.slice(0, 12)}`} —
                {' '}{fmt(accepted.amount)} · {accepted.durationDays} dias
              </p>
            </div>
            <button
              onClick={() => navigate(`/kanban/${projectId}`)}
              className="btn-sharp bg-brand-500 text-dark-bg font-mono font-bold text-xs px-4 py-2 border border-brand-500 hover:bg-brand-400 transition-colors uppercase"
            >
              ABRIR_KANBAN()
            </button>
          </div>
        )}

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-5 border-b border-dark-border pb-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono text-xs text-zinc-300">
                <span className="font-bold text-white">{pending.length}</span> pendentes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-brand-500" />
              <span className="font-mono text-xs text-zinc-300">
                <span className="font-bold text-white">{bids.filter(b => b.status === 'ACCEPTED').length}</span> aceites
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="font-mono text-xs text-zinc-300">
                <span className="font-bold text-white">{bids.filter(b => b.status === 'REJECTED').length}</span> rejeitados
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] text-zinc-600 uppercase">Ordenado por: Data de envio</span>
        </div>

        {/* Bid list */}
        {bids.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-zinc-700 font-mono text-zinc-600">
            <p className="text-sm mb-1">Nenhuma proposta recebida ainda.</p>
            <p className="text-[10px] text-zinc-700">O projeto está OPEN e aguardando candidaturas de especialistas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bids.map((bid, idx) => {
              const meta = STATUS_META[bid.status]
              const isExpanded = expandedId === bid.id
              const isPending = bid.status === 'PENDING'
              const isProcessing = actionId === bid.id
              const canAct = isPending && !hasAccepted && !isProcessing

              return (
                <div
                  key={bid.id}
                  className={`bg-dark-card border transition-colors overflow-hidden ${
                    bid.status === 'ACCEPTED'
                      ? 'border-brand-500/40'
                      : bid.status === 'REJECTED'
                        ? 'border-red-500/20 opacity-60'
                        : 'border-dark-border hover:border-zinc-700'
                  }`}
                >
                  {/* Bid header */}
                  <div className="p-5 w-full min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-dark-input border border-dark-border flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-bold text-white truncate">
                            {bid.specialistName ?? `Especialista #${idx + 1}`}
                          </p>
                          <p className="font-mono text-[10px] text-zinc-600 truncate">
                            BID_ID: {bid.id.slice(0, 12)} · {new Date(bid.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <span className={`font-mono text-[9px] border px-2 py-1 tracking-widest uppercase shrink-0 ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>

                    {/* Values */}
                    <div className="grid grid-cols-2 gap-px bg-dark-border mb-4">
                      <div className="bg-dark-input p-3 flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <div>
                          <p className="font-mono text-[9px] text-zinc-600 uppercase">Valor Proposto</p>
                          <p className="font-mono font-bold text-white text-sm">{fmt(bid.amount)}</p>
                        </div>
                      </div>
                      <div className="bg-dark-input p-3 flex items-center gap-2">
                        <CalendarClock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <div>
                          <p className="font-mono text-[9px] text-zinc-600 uppercase">Duração Estimada</p>
                          <p className="font-mono font-bold text-white text-sm">{bid.durationDays} dias</p>
                        </div>
                      </div>
                    </div>

                    {/* Proposal text — collapsible */}
                    <div className="bg-dark-input border border-dark-border">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : bid.id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-dark-hover transition-colors"
                      >
                        <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                          Texto da Proposta
                        </span>
                        {isExpanded
                          ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                          : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                        }
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-dark-border w-full overflow-hidden">
                          <p className="font-mono text-xs text-zinc-300 leading-relaxed break-all whitespace-pre-wrap">
                            {bid.proposalText || 'Sem texto de proposta.'}
                          </p>
                        </div>
                      )}
                      {!isExpanded && bid.proposalText && (
                        <p className="px-4 pb-3 font-mono text-[10px] text-zinc-600 line-clamp-1 border-t border-dark-border pt-2 break-all">
                          {bid.proposalText}
                        </p>
                      )}
                    </div>

                    {/* Milestone proposals */}
                    {bid.milestoneProposals && bid.milestoneProposals.length > 0 && (
                      <div className="mt-4 bg-dark-input border border-dark-border">
                        <div className="px-4 py-2.5 border-b border-dark-border">
                          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                            Observações por Marco
                          </span>
                        </div>
                        <div className="divide-y divide-dark-border">
                          {bid.milestoneProposals.map((mp) => {
                            const milestone = project?.milestones?.find(m => m.id === mp.milestoneId)
                            return (
                              <div key={mp.milestoneId} className="px-4 py-3 flex flex-col gap-1">
                                <p className="font-mono text-[10px] text-brand-500 uppercase tracking-wider">
                                  {milestone?.title ?? `Marco ${mp.milestoneId.slice(0, 8)}`}
                                </p>
                                <div className="flex items-center justify-between">
                                  <p className="font-mono text-xs text-white font-bold">{fmt(mp.proposedAmount)}</p>
                                  {mp.note && (
                                    <p className="font-mono text-[10px] text-zinc-400 italic max-w-[60%] text-right">{mp.note}</p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {isPending && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-border">
                        {hasAccepted ? (
                          <p className="font-mono text-[10px] text-zinc-600 italic">
                            Um especialista já foi seleccionado para este projeto.
                          </p>
                        ) : (
                          <>
                            <p className="font-mono text-[10px] text-zinc-600">
                              Apenas um especialista pode ser aceite por projeto.
                            </p>
                            <div className="flex gap-3">
                              <button
                                data-testid={`reject-${bid.id}`}
                                onClick={() => setConfirmModal({ bid, action: 'reject' })}
                                disabled={!canAct}
                                className="btn-sharp flex items-center gap-2 px-4 py-2 bg-dark-input border border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-500/10 font-mono font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <XCircle className="w-3.5 h-3.5" /> REJEITAR()
                              </button>
                              <button
                                data-testid={`accept-${bid.id}`}
                                onClick={() => setConfirmModal({ bid, action: 'accept' })}
                                disabled={!canAct}
                                className="btn-sharp flex items-center gap-2 px-5 py-2 bg-brand-500 border border-brand-500 text-dark-bg hover:bg-brand-400 font-mono font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-[4px_4px_0px_rgba(85,202,124,0.2)]"
                              >
                                {isProcessing
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <CheckCircle className="w-3.5 h-3.5" />
                                }
                                ACEITAR_PROPOSTA()
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Confirm modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-[#000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`bg-dark-card border w-full max-w-md p-6 shadow-2xl ${
            confirmModal.action === 'accept'
              ? 'border-brand-500 shadow-[0_0_30px_rgba(85,202,124,0.1)]'
              : 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]'
          }`}>
            <h2 className={`text-lg font-bold uppercase tracking-tight mb-2 flex items-center gap-2 ${
              confirmModal.action === 'accept' ? 'text-brand-500' : 'text-red-400'
            }`}>
              {confirmModal.action === 'accept'
                ? <><CheckCircle className="w-5 h-5" /> Aceitar Proposta</>
                : <><XCircle className="w-5 h-5" /> Rejeitar Proposta</>
              }
            </h2>

            {confirmModal.action === 'accept' ? (
              <div className="bg-brand-500/10 border border-brand-500/30 p-3 mb-5">
                <p className="font-mono text-[10px] text-brand-500 uppercase mb-1">Ação Irreversível</p>
                <p className="font-mono text-xs text-zinc-300">
                  Ao aceitar, este especialista será o único vencedor do projeto.
                  As demais propostas serão bloqueadas automaticamente.
                </p>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 p-3 mb-5">
                <p className="font-mono text-[10px] text-red-400 uppercase mb-1">Confirmar Rejeição</p>
                <p className="font-mono text-xs text-zinc-300">
                  A proposta será marcada como REJECTED. O especialista será notificado.
                </p>
              </div>
            )}

            {/* Bid summary */}
            <div className="bg-dark-input border border-dark-border p-4 mb-5">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-4 h-4 text-zinc-500" />
                <p className="font-mono text-xs font-bold text-white">
                  {confirmModal.bid.specialistName ?? `Especialista ID: ${confirmModal.bid.specialistId?.slice(0, 12)}`}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-mono text-[9px] text-zinc-600 uppercase">Valor</p>
                  <p className="font-mono text-sm font-bold text-white">{fmt(confirmModal.bid.amount)}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-zinc-600 uppercase">Duração</p>
                  <p className="font-mono text-sm font-bold text-white">{confirmModal.bid.durationDays} dias</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 btn-sharp bg-dark-input text-zinc-300 font-mono text-xs px-4 py-3 border border-dark-border hover:border-zinc-500 transition-colors uppercase"
              >
                CANCELAR
              </button>
              <button
                data-testid="confirm-action"
                onClick={() => handleAction(confirmModal.bid, confirmModal.action)}
                className={`flex-1 btn-sharp font-bold font-mono text-xs px-4 py-3 border transition-colors uppercase ${
                  confirmModal.action === 'accept'
                    ? 'bg-brand-500 border-brand-500 text-dark-bg hover:bg-brand-400'
                    : 'bg-red-500 border-red-500 text-white hover:bg-red-400'
                }`}
              >
                {confirmModal.action === 'accept' ? 'CONFIRMAR_ACEITE()' : 'CONFIRMAR_REJEIÇÃO()'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
