import { useState, useEffect, useRef, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FileCode, Building2, Coins, CalendarClock, ShieldAlert, Send, Loader2, CheckSquare, ListChecks, Pencil, X, Award, AlertCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import { projectsApi, Project, Milestone } from '../api/projects'
import { bidsApi, Bid, BidMilestoneProposal } from '../api/bids'
import { skillsApi, Skill, SkillQuestion, QuizResult } from '../api/skills'
import { portfolioApi } from '../api/portfolio'
import { extractApiError } from '../api/client'
import { projectStatusLabel, bidStatusLabel } from '../lib/labels'
import { validateBidForm, ValidationError, formatValidationErrors } from '../lib/validators'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const TEMPLATE = (title: string, name: string) =>
  `Olá, Equipa!\n\nAnalisei os requisitos para o projeto "${title}" e é exatamente a minha especialidade.\n\nProponho a seguinte abordagem:\n1. Análise profunda e desenho arquitetural.\n2. Setup da infraestrutura.\n3. Implementação e integração.\n4. Testes e documentação.\n\nEstou disponível para iniciar imediatamente.\n\nCumprimentos,\n${name}`

function buildDefaultMilestoneProposals(milestones: Milestone[]): BidMilestoneProposal[] {
  return milestones.map(m => ({ milestoneId: m.id, proposedAmount: m.amount, note: '' }))
}

export default function Bidding() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [milestoneProposals, setMilestoneProposals] = useState<BidMilestoneProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<Bid | null>(null)
  const [existingBid, setExistingBid] = useState<Bid | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [editing, setEditing] = useState(false)
  const [editAmount, setEditAmount] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editProposal, setEditProposal] = useState('')
  const [editMilestoneProposals, setEditMilestoneProposals] = useState<BidMilestoneProposal[]>([])
  const [editError, setEditError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [coverLetterLineCount, setCoverLetterLineCount] = useState(1)
  const [coverLetterScrollTop, setCoverLetterScrollTop] = useState(0)
  const coverLetterRef = useRef<HTMLTextAreaElement | null>(null)

  // Skill quiz gate
  const [skillsToValidate, setSkillsToValidate] = useState<Array<{ skillId: string; skillName: string; questions: SkillQuestion[] }>>([])
  const [quizModalOpen, setQuizModalOpen] = useState(false)
  const [pendingSubmitData, setPendingSubmitData] = useState<{ amount: number; durationDays: number; proposalText: string; milestoneProposals?: BidMilestoneProposal[] } | null>(null)

  useEffect(() => {
    if (!projectId) return
    Promise.allSettled([
      projectsApi.getById(projectId),
      bidsApi.myBids(),
    ]).then(([pResult, bResult]) => {
      if (pResult.status === 'fulfilled') {
        const p = pResult.value.data
        setProject(p)
        if (p.milestones && p.milestones.length > 0) {
          const defaults = buildDefaultMilestoneProposals(p.milestones)
          setMilestoneProposals(defaults)
          setAmount(String(defaults.reduce((s, mp) => s + mp.proposedAmount, 0)))
        }
      }
      if (bResult.status === 'fulfilled') {
        const active = bResult.value.data.find(
          (b: { projectId: string; status: string }) =>
            b.projectId === projectId &&
            (b.status === 'PENDING' || b.status === 'ACCEPTED'),
        )
        if (active) setExistingBid(active)
      }
    }).finally(() => setLoading(false))
  }, [projectId])

  function updateMilestoneProposal(milestoneId: string, field: 'proposedAmount' | 'note', value: string) {
    setMilestoneProposals(prev => {
      const next = prev.map(mp =>
        mp.milestoneId === milestoneId
          ? { ...mp, [field]: field === 'proposedAmount' ? Number(value) : value }
          : mp,
      )
      if (field === 'proposedAmount') {
        setAmount(String(next.reduce((s, mp) => s + mp.proposedAmount, 0)))
      }
      return next
    })
  }

  function getFieldError(field: string): string | undefined {
    return validationErrors.find(e => e.field === field)?.message
  }

  async function doSubmitBid(data: { amount: number; durationDays: number; proposalText: string; milestoneProposals?: BidMilestoneProposal[] }) {
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await bidsApi.submit({
        projectId: project!.id,
        amount: data.amount,
        durationDays: data.durationDays,
        proposalText: data.proposalText,
        milestoneProposals: data.milestoneProposals,
      })
      setSubmitted(res.data)
    } catch (err: unknown) {
      const status = (err as any)?.response?.status
      if (status === 422) {
        setSubmitError('Este projeto não está a aceitar novas propostas.')
      } else if (status === 409) {
        setSubmitError('Já tens uma proposta ativa neste projeto.')
      } else {
        setSubmitError(extractApiError(err, 'Erro ao submeter proposta. Verifique os campos e tente novamente.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!project) return

    // Validar antes de enviar
    const errors = validateBidForm({ projectId: project.id, coverLetter, amount, duration, milestoneProposals })
    if (errors.length > 0) {
      setValidationErrors(errors)
      setSubmitError(formatValidationErrors(errors))
      return
    }
    setValidationErrors([])
    setSubmitError('')

    const submitData = {
      amount: Number(amount),
      durationDays: Math.round(Number(duration)),
      proposalText: coverLetter,
      milestoneProposals: milestoneProposals.length > 0 ? milestoneProposals : undefined,
    }

    // Check skill quiz gate
    if (project.skills && project.skills.length > 0 && project.companyId) {
      setSubmitting(true)
      try {
        // Fetch specialist's current badges
        let myBadges: Record<string, 'yellow' | 'green'> = {}
        try {
          const profileRes = await portfolioApi.getMyProfile()
          myBadges = profileRes.data.skillBadges ?? {}
        } catch {}

        // For each required skill, check if company has questions AND specialist lacks badge
        const catalog = (await skillsApi.getAll()).data
        const toValidate: Array<{ skillId: string; skillName: string; questions: SkillQuestion[] }> = []

        for (const skillName of project.skills) {
          const normalized = skillName.toLowerCase()
          // Skip if specialist already has a badge
          if (myBadges[normalized] === 'yellow' || myBadges[normalized] === 'green') continue

          // Find skill in catalog
          const skillEntry = catalog.find(s => s.name === normalized || s.displayName.toLowerCase() === normalized)
          if (!skillEntry) continue

          // Check if company has questions for this skill
          const qRes = await skillsApi.getCompanyQuestions(skillEntry.id, project.companyId)
          if (qRes.data && qRes.data.length > 0) {
            toValidate.push({ skillId: skillEntry.id, skillName: skillEntry.displayName, questions: qRes.data })
          }
        }

        setSubmitting(false)

        if (toValidate.length > 0) {
          setSkillsToValidate(toValidate)
          setPendingSubmitData(submitData)
          setQuizModalOpen(true)
          return
        }
      } catch {
        setSubmitting(false)
      }
    }

    await doSubmitBid(submitData)
  }

  function openEdit() {
    if (!existingBid) return
    setEditAmount(String(existingBid.amount))
    setEditDuration(String(existingBid.durationDays))
    setEditProposal(existingBid.proposalText)
    setEditMilestoneProposals(
      existingBid.milestoneProposals.length > 0
        ? existingBid.milestoneProposals
        : project?.milestones ? buildDefaultMilestoneProposals(project.milestones) : [],
    )
    setEditError('')
    setEditing(true)
  }

  function updateEditMilestoneProposal(milestoneId: string, field: 'proposedAmount' | 'note', value: string) {
    setEditMilestoneProposals(prev => {
      const next = prev.map(mp =>
        mp.milestoneId === milestoneId
          ? { ...mp, [field]: field === 'proposedAmount' ? Number(value) : value }
          : mp,
      )
      if (field === 'proposedAmount') {
        setEditAmount(String(next.reduce((s, mp) => s + mp.proposedAmount, 0)))
      }
      return next
    })
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!existingBid) return
    setUpdating(true)
    setEditError('')
    try {
      const res = await bidsApi.update(existingBid.id, {
        proposal: editProposal,
        proposedBudget: Number(editAmount),
        estimatedDuration: Number(editDuration),
        milestoneProposals: editMilestoneProposals.length > 0 ? editMilestoneProposals : undefined,
      })
      setExistingBid(res.data)
      setEditing(false)
    } catch (err: unknown) {
      setEditError(extractApiError(err, 'Erro ao atualizar. Tente novamente.'))
    } finally {
      setUpdating(false)
    }
  }

  async function handleWithdraw() {
    if (!existingBid) return
    if (!window.confirm('Retirar a proposta? Esta ação não pode ser desfeita.')) return
    setWithdrawing(true)
    try {
      await bidsApi.withdraw(existingBid.id)
      setExistingBid({ ...existingBid, status: 'WITHDRAWN' })
    } catch {
      alert('Erro ao retirar proposta.')
    } finally {
      setWithdrawing(false)
    }
  }

  if (loading) return (
    <div className="bg-dark-bg min-h-screen flex items-center justify-center">
      <span className="font-mono text-brand-500">Carregando projeto...</span>
    </div>
  )

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased flex flex-col">
      <div className="scanline" />
      <Navbar backUrl="/dashboard" projectTitle="MERAKI // PROPOSTA" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left: Project Brief */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-dark-card border border-dark-border p-6 relative">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-500" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-500" />

              <div className="flex justify-between items-start mb-4">
                <span className={`font-mono text-[10px] px-2 py-1 tracking-widest flex items-center gap-1.5 border ${
                  project?.status === 'OPEN'
                    ? 'text-brand-500 border-brand-500/30 bg-brand-500/10'
                    : project?.status === 'IN_PROGRESS'
                      ? 'text-blue-400 border-blue-400/30 bg-blue-400/10'
                      : 'text-zinc-500 border-zinc-700 bg-dark-input'
                }`}>
                  {project?.status === 'OPEN' && <span className="w-1.5 h-1.5 bg-brand-500 animate-pulse" />}
                  STATUS: {project?.status ? (projectStatusLabel[project.status] ?? project.status) : '…'}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dark-border">
                <div className="w-10 h-10 bg-dark-input border border-dark-border flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <p className="text-xs font-mono text-zinc-500 uppercase">Cliente</p>
                  <p className="text-sm font-bold text-white">{project?.companyId ?? 'Empresa'}</p>
                </div>
              </div>

              <h1 className="text-xl font-bold text-white mb-3">{project?.title}</h1>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed break-words">{project?.description}</p>

              {project?.skills && project.skills.length > 0 && (
                <div className="mb-6">
                  <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">Requisitos Técnicos</p>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map(s => (
                      <span key={s} className="text-[10px] font-mono border border-zinc-700 bg-dark-input text-zinc-300 px-2 py-1">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-px bg-dark-border mb-6">
                <div className="bg-dark-input p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-3 h-3 text-brand-500" />
                    <p className="font-mono text-[10px] text-zinc-500 uppercase">Orçamento Máximo</p>
                  </div>
                  <p className="font-mono font-bold text-white text-lg">{project ? fmt(project.budget) : '—'}</p>
                </div>
                <div className="bg-dark-input p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarClock className="w-3 h-3 text-blue-400" />
                    <p className="font-mono text-[10px] text-zinc-500 uppercase">Prazo de Entrega</p>
                  </div>
                  <p className="font-mono font-bold text-white text-lg">{project?.deadline ?? '—'}</p>
                </div>
              </div>

              {project?.milestones && project.milestones.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="w-3.5 h-3.5 text-brand-500" />
                    <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                      Marcos ({project.milestones.length})
                    </p>
                  </div>
                  <div className="space-y-2">
                    {project.milestones
                      .slice()
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((m, i) => (
                        <div key={m.id} className="bg-dark-input border border-dark-border p-3 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="font-mono text-[9px] text-zinc-600 bg-dark-card border border-dark-border px-1.5 py-0.5 shrink-0 mt-0.5">
                              M{i + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-mono text-xs text-white font-bold truncate">{m.title}</p>
                              {m.description && (
                                <p className="font-mono text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{m.description}</p>
                              )}
                            </div>
                          </div>
                          <span className="font-mono text-xs text-brand-500 font-bold shrink-0">{fmt(m.amount)}</span>
                        </div>
                      ))}
                  </div>
                  <div className="flex justify-end mt-2">
                    <p className="font-mono text-[10px] text-zinc-500">
                      Total: <span className="text-brand-500 font-bold">
                        {fmt(project.milestones.reduce((s, m) => s + m.amount, 0))}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right: Bid Form */}
          <section className="lg:col-span-7">
            <div className="bg-dark-card border border-dark-border relative flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-input">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-brand-500" />
                  <span className="font-mono text-xs font-bold text-white">criar_proposta.sh</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                {/* Painel de erros de validação */}
                {submitError && (
                  <div className="bg-red-500/10 border border-red-500/50 p-4 flex items-start gap-3 rounded-none">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-mono text-xs font-bold text-red-400 mb-1">ERROS DE VALIDAÇÃO</p>
                      <p className="font-mono text-xs text-red-300 whitespace-pre-wrap">{submitError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubmitError('')}
                      className="text-red-400 hover:text-red-300 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">const valorProposto =</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="font-mono text-zinc-500 group-focus-within:text-brand-500">R$</span>
                      </div>
                      <input
                        type="number" required min={1} value={amount} data-testid="bid-amount"
                        onChange={e => {
                          setAmount(e.target.value)
                          if (validationErrors.some(e => e.field === 'proposedBudget')) {
                            setValidationErrors(validationErrors.filter(e => e.field !== 'proposedBudget'))
                          }
                        }}
                        readOnly={milestoneProposals.length > 0}
                        placeholder="0.00"
                        className={`w-full pl-10 pr-4 py-3 bg-[#000] border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none rounded-none ${
                          getFieldError('proposedBudget')
                            ? 'border-red-500/50 focus:border-red-500'
                            : milestoneProposals.length > 0
                              ? 'border-dark-border text-zinc-500 cursor-not-allowed'
                              : 'border-dark-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                        }`}
                      />
                    </div>
                    {getFieldError('proposedBudget') && (
                      <p className="text-[9px] font-mono text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {getFieldError('proposedBudget')}
                      </p>
                    )}
                    {!getFieldError('proposedBudget') && (
                      <p className="text-[9px] font-mono text-zinc-500 text-right">
                        {milestoneProposals.length > 0 ? '// Soma automática dos marcos.' : '// Taxa de plataforma será retida no pagamento.'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">let diasEstimados =</label>
                    <div className="relative group">
                      <input data-testid="bid-duration" type="number" required min={1} max={3650} value={duration}
                        onChange={e => {
                          setDuration(e.target.value)
                          if (validationErrors.some(e => e.field === 'estimatedDuration')) {
                            setValidationErrors(validationErrors.filter(e => e.field !== 'estimatedDuration'))
                          }
                        }}
                        placeholder="Ex: 45"
                        className={`w-full pl-4 pr-12 py-3 bg-[#000] border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none rounded-none ${
                          getFieldError('estimatedDuration')
                            ? 'border-red-500/50 focus:border-red-500'
                            : 'border-dark-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                        }`}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="font-mono text-zinc-500 text-xs">DIAS</span>
                      </div>
                    </div>
                    {getFieldError('estimatedDuration') && (
                      <p className="text-[9px] font-mono text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {getFieldError('estimatedDuration')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Milestone Proposals */}
                {project?.milestones && project.milestones.length > 0 && milestoneProposals.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-3.5 h-3.5 text-brand-500" />
                      <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider">const propostasMilestone[] = {'{'}</label>
                    </div>
                    <div className="space-y-2">
                      {project.milestones
                        .slice()
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((m, i) => {
                          const mp = milestoneProposals.find(p => p.milestoneId === m.id)
                          if (!mp) return null
                          return (
                            <div key={m.id} className="bg-[#000] border border-dark-border p-3 flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[9px] text-zinc-600 bg-dark-card border border-dark-border px-1.5 py-0.5 shrink-0">M{i + 1}</span>
                                <p className="font-mono text-xs text-white font-bold truncate flex-1">{m.title}</p>
                                <span className="font-mono text-[10px] text-zinc-500 shrink-0">ref: {fmt(m.amount)}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-zinc-500 text-xs">R$</span>
                                  <input
                                    type="number" required min={0}
                                    value={mp.proposedAmount}
                                    onChange={e => updateMilestoneProposal(m.id, 'proposedAmount', e.target.value)}
                                    className="w-full pl-7 pr-2 py-1.5 bg-dark-input border border-dark-border text-xs font-mono text-white focus:outline-none focus:border-brand-500 rounded-none"
                                  />
                                </div>
                                <input
                                  type="text"
                                  maxLength={200}
                                  value={mp.note ?? ''}
                                  onChange={e => updateMilestoneProposal(m.id, 'note', e.target.value)}
                                  placeholder="Observação (opcional)"
                                  className="w-full px-2 py-1.5 bg-dark-input border border-dark-border text-xs font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                    <label className="text-[10px] font-mono text-brand-500 block">{'}'}</label>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider">function escreverCartaDeApresentacao() {'{'}</label>
                    <button type="button" onClick={() => project && setCoverLetter(TEMPLATE(project.title, 'Especialista'))}
                      className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 cursor-pointer">[Inserir Template]</button>
                  </div>
                  <div className={`relative w-full border bg-[#000] p-1 transition-all ${
                    getFieldError('proposal')
                      ? 'border-red-500/50 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500'
                      : 'border-dark-border focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500'
                  }`}>
                    <div className="absolute left-0 top-0 bottom-0 w-10 border-r border-dark-border bg-dark-input overflow-hidden select-none">
                      <div className="flex flex-col items-center pt-3" style={{ transform: `translateY(-${coverLetterScrollTop}px)` }}>
                        {Array.from({ length: Math.max(coverLetterLineCount, 16) }, (_, idx) => (
                          <span key={idx} className="text-[10px] font-mono text-zinc-700 leading-[24px]">{idx + 1}</span>
                        ))}
                      </div>
                    </div>
                    <textarea
                      ref={coverLetterRef}
                      data-testid="bid-cover"
                      required
                      minLength={20}
                      maxLength={2000}
                      value={coverLetter}
                      onScroll={e => setCoverLetterScrollTop(e.currentTarget.scrollTop)}
                      onChange={e => {
                        const text = e.target.value
                        setCoverLetter(text)
                        setCoverLetterLineCount(Math.max(1, text.split('\n').length))
                        if (validationErrors.some(err => err.field === 'proposal')) {
                          setValidationErrors(validationErrors.filter(err => err.field !== 'proposal'))
                        }
                      }}
                      placeholder="Apresente a sua proposta técnica..."
                      className="editor-textarea relative z-10 w-full pl-12 pr-2 py-3 bg-transparent text-sm font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none h-64"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono text-brand-500 block">{'}'}</label>
                    <div className="text-[9px] font-mono text-zinc-500">
                      {coverLetter.length}/2000 caracteres
                      {getFieldError('proposal') && (
                        <p className="text-red-400 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" /> {getFieldError('proposal')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="flex items-start gap-2 text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span data-testid="bid-error">{submitError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                    <ShieldAlert className="w-3 h-3 text-blue-400" />
                    <span>A proposta ficará invisível para concorrentes.</span>
                  </div>
                  <button type="submit" disabled={submitting} data-testid="bid-submit"
                    className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-8 py-3 hover:bg-brand-400 border border-brand-500 transition-colors shadow-[4px_4px_0px_rgba(85,202,124,0.2)] flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{submitting ? 'A PROCESSAR...' : 'ENVIAR_PROPOSTA()'}</span>
                  </button>
                </div>
              </form>

              {/* Projeto encerrado — não aceita novas propostas */}
              {project && project.status !== 'OPEN' && !existingBid && !submitted && (
                <div className="absolute inset-0 bg-dark-bg/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 border border-amber-500/40">
                  <ShieldAlert className="w-16 h-16 text-amber-400 mb-4" />
                  <h2 className="text-xl font-mono font-bold text-white mb-2">PROJETO ENCERRADO</h2>
                  <p className="text-xs font-mono text-amber-400 text-center mb-6">
                    &gt; STATUS: {project.status} — Este projeto não está a aceitar novas propostas.
                  </p>
                  <button onClick={() => navigate('/dashboard')}
                    className="btn-sharp bg-transparent text-white font-mono text-xs px-6 py-2 border border-dark-border hover:border-amber-500 hover:text-amber-400 transition-colors">
                    &lt; Retornar ao Workspace
                  </button>
                </div>
              )}

              {/* Proposta existente */}
              {existingBid && !submitted && !editing && (
                <div className="absolute inset-0 bg-dark-bg/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 border border-blue-500">
                  <ShieldAlert className="w-12 h-12 text-blue-400 mb-4" />
                  <h2 className="text-xl font-mono font-bold text-white mb-1">PROPOSTA SUBMETIDA</h2>
                  <p className="text-xs font-mono text-blue-400 text-center mb-5">
                    {existingBid.status === 'PENDING'
                      ? '> Aguardando avaliação da empresa.'
                      : existingBid.status === 'ACCEPTED'
                        ? '> Proposta aceite. Parabéns!'
                        : `> Status: ${bidStatusLabel[existingBid.status] ?? existingBid.status}`}
                  </p>
                  <div className="bg-[#000] border border-dark-border p-4 w-full max-w-sm mb-5">
                    <p className="font-mono text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">Detalhes da Proposta</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-zinc-500">Valor proposto:</span>
                        <span className="text-brand-500 font-bold">{fmt(existingBid.amount)}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-zinc-500">Prazo estimado:</span>
                        <span className="text-white">{existingBid.durationDays} dias</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-zinc-500">Status:</span>
                        <span className={existingBid.status === 'ACCEPTED' ? 'text-brand-500' : existingBid.status === 'REJECTED' ? 'text-red-400' : 'text-blue-400'}>
                          {bidStatusLabel[existingBid.status] ?? existingBid.status}
                        </span>
                      </div>
                    </div>
                    {existingBid.milestoneProposals.length > 0 && project?.milestones && (
                      <div className="mt-3 pt-3 border-t border-dark-border space-y-1.5">
                        <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Por Marco</p>
                        {existingBid.milestoneProposals.map(mp => {
                          const m = project.milestones!.find(x => x.id === mp.milestoneId)
                          return (
                            <div key={mp.milestoneId} className="font-mono text-[10px]">
                              <div className="flex justify-between">
                                <span className="text-zinc-500 truncate max-w-[140px]">{m?.title ?? mp.milestoneId}</span>
                                <span className="text-brand-500 font-bold">{fmt(mp.proposedAmount)}</span>
                              </div>
                              {mp.note && <p className="text-zinc-600 mt-0.5 line-clamp-1">{mp.note}</p>}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {existingBid.status === 'PENDING' && (
                      <>
                        <button onClick={openEdit}
                          className="btn-sharp bg-brand-500 text-dark-bg font-mono font-bold text-xs px-5 py-2 border border-brand-500 hover:bg-brand-400 transition-colors flex items-center gap-2">
                          <Pencil className="w-3.5 h-3.5" /> Editar Proposta
                        </button>
                        <button
                          data-testid="bid-withdraw-btn"
                          onClick={handleWithdraw}
                          disabled={withdrawing}
                          className="btn-sharp bg-transparent text-red-400 font-mono font-bold text-xs px-5 py-2 border border-red-500/50 hover:bg-red-500/10 hover:border-red-400 transition-colors disabled:opacity-50">
                          {withdrawing ? 'Retirando...' : 'Retirar Proposta'}
                        </button>
                      </>
                    )}
                    <button onClick={() => navigate('/dashboard')}
                      className="btn-sharp bg-transparent text-white font-mono text-xs px-5 py-2 border border-dark-border hover:border-brand-500 hover:text-brand-500 transition-colors">
                      &lt; Voltar
                    </button>
                  </div>
                </div>
              )}

              {/* Formulário de edição */}
              {existingBid && !submitted && editing && (
                <div className="absolute inset-0 bg-dark-bg/95 backdrop-blur-sm z-10 flex flex-col p-6 border border-brand-500 overflow-y-auto">
                  <div className="flex items-center justify-between mb-5 border-b border-dark-border pb-4">
                    <div className="flex items-center gap-2">
                      <Pencil className="w-4 h-4 text-brand-500" />
                      <span className="font-mono text-sm font-bold text-white uppercase tracking-wider">Editar Proposta</span>
                    </div>
                    <button onClick={() => setEditing(false)} className="text-zinc-500 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdate} className="flex flex-col gap-5 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">Valor Proposto (R$)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-zinc-500 text-sm">R$</span>
                          <input
                            type="number" required min={1} value={editAmount}
                            onChange={e => setEditAmount(e.target.value)}
                            readOnly={editMilestoneProposals.length > 0}
                            className={`w-full pl-9 pr-4 py-3 bg-[#000] border text-sm font-mono text-white focus:outline-none rounded-none ${editMilestoneProposals.length > 0 ? 'border-dark-border text-zinc-500 cursor-not-allowed' : 'border-dark-border focus:border-brand-500'}`}
                          />
                        </div>
                        {editMilestoneProposals.length > 0 && (
                          <p className="text-[9px] font-mono text-zinc-500">// Soma automática dos marcos.</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">Prazo Estimado (dias)</label>
                        <div className="relative">
                          <input type="number" required min={1} max={3650} value={editDuration} onChange={e => setEditDuration(e.target.value)}
                            className="w-full pl-4 pr-12 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 rounded-none" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-zinc-500 text-xs">DIAS</span>
                        </div>
                      </div>
                    </div>

                    {/* Edit Milestone Proposals */}
                    {editMilestoneProposals.length > 0 && project?.milestones && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ListChecks className="w-3 h-3 text-brand-500" />
                          <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider">Proposta por Marco</label>
                        </div>
                        <div className="space-y-2">
                          {project.milestones
                            .slice()
                            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                            .map((m, i) => {
                              const mp = editMilestoneProposals.find(p => p.milestoneId === m.id)
                              if (!mp) return null
                              return (
                                <div key={m.id} className="bg-[#000] border border-dark-border p-2.5 flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[9px] text-zinc-600 bg-dark-card border border-dark-border px-1.5 py-0.5 shrink-0">M{i + 1}</span>
                                    <p className="font-mono text-xs text-white font-bold truncate flex-1">{m.title}</p>
                                    <span className="font-mono text-[10px] text-zinc-500 shrink-0">ref: {fmt(m.amount)}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-zinc-500 text-xs">R$</span>
                                      <input
                                        type="number" required min={0}
                                        value={mp.proposedAmount}
                                        onChange={e => updateEditMilestoneProposal(m.id, 'proposedAmount', e.target.value)}
                                        className="w-full pl-7 pr-2 py-1.5 bg-dark-input border border-dark-border text-xs font-mono text-white focus:outline-none focus:border-brand-500 rounded-none"
                                      />
                                    </div>
                                    <input
                                      type="text"
                                      maxLength={200}
                                      value={mp.note ?? ''}
                                      onChange={e => updateEditMilestoneProposal(m.id, 'note', e.target.value)}
                                      placeholder="Observação (opcional)"
                                      className="w-full px-2 py-1.5 bg-dark-input border border-dark-border text-xs font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
                                    />
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 flex-1 flex flex-col">
                      <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">Proposta Técnica</label>
                      <textarea required minLength={20} value={editProposal} onChange={e => setEditProposal(e.target.value)}
                        className="flex-1 w-full px-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-zinc-300 focus:outline-none focus:border-brand-500 rounded-none resize-none min-h-[140px]" />
                    </div>

                    {editError && (
                      <p className="font-mono text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2">{editError}</p>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
                      <button type="button" onClick={() => setEditing(false)} disabled={updating}
                        className="font-mono text-xs text-zinc-400 border border-dark-border px-4 py-2 hover:border-zinc-500 transition-colors uppercase disabled:opacity-50">
                        Cancelar
                      </button>
                      <button type="submit" disabled={updating}
                        className="btn-sharp bg-brand-500 text-dark-bg font-mono font-bold text-xs px-6 py-2 border border-brand-500 hover:bg-brand-400 transition-colors uppercase disabled:opacity-60 flex items-center gap-2">
                        {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        {updating ? 'Atualizando...' : 'Salvar Alterações'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Success Overlay */}
              {submitted && (
                <div data-testid="bid-success" className="absolute inset-0 bg-dark-bg/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 border border-brand-500">
                  <CheckSquare className="w-16 h-16 text-brand-500 mb-4" />
                  <h2 className="text-xl font-mono font-bold text-white mb-2">PROPOSTA SUBMETIDA</h2>
                  <p className="text-xs font-mono text-brand-500 text-center mb-6">&gt; Proposta enviada com sucesso. Aguardando avaliação do cliente.</p>
                  <div className="bg-[#000] border border-dark-border p-4 w-full max-w-sm mb-6">
                    <p className="font-mono text-[10px] text-zinc-500 mb-1">DETALHES DO REGISTO:</p>
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-zinc-400">Status:</span><span className="text-blue-400">PENDING_REVIEW</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-zinc-400">Timestamp:</span><span className="text-white">{new Date(submitted.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate('/dashboard')}
                    className="btn-sharp bg-transparent text-white font-mono text-xs px-6 py-2 border border-dark-border hover:border-brand-500 hover:text-brand-500 transition-colors">
                    &lt; Retornar ao Workspace
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {quizModalOpen && skillsToValidate.length > 0 && pendingSubmitData && (
        <ProjectSkillQuizModal
          skills={skillsToValidate}
          companyId={project?.companyId ?? ''}
          onClose={() => { setQuizModalOpen(false); setSkillsToValidate([]); setPendingSubmitData(null) }}
          onAllPassed={async () => {
            setQuizModalOpen(false)
            setSkillsToValidate([])
            if (pendingSubmitData) await doSubmitBid(pendingSubmitData)
            setPendingSubmitData(null)
          }}
          onSkip={async () => {
            setQuizModalOpen(false)
            setSkillsToValidate([])
            if (pendingSubmitData) await doSubmitBid(pendingSubmitData)
            setPendingSubmitData(null)
          }}
        />
      )}
    </div>
  )
}

// ─── ProjectSkillQuizModal ────────────────────────────────────────────────────

function ProjectSkillQuizModal({ skills, companyId, onClose, onAllPassed, onSkip }: {
  skills: Array<{ skillId: string; skillName: string; questions: SkillQuestion[] }>
  companyId: string
  onClose: () => void
  onAllPassed: () => void
  onSkip: () => void
}) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<QuizResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const current = skills[currentIdx]

  useEffect(() => {
    if (current) {
      setAnswers(new Array(current.questions.length).fill(-1))
      setResult(null)
      setError('')
    }
  }, [currentIdx])

  async function submitCurrentQuiz() {
    if (answers.some(a => a === -1)) {
      setError('Responda todas as questões.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const questionIds = current.questions.map(q => q.id)
      const res = await skillsApi.attemptProject(current.skillId, answers, companyId, questionIds)
      setResult(res.data)
    } catch {
      // Soft gate: if API fails, allow continuing
      setResult({ passed: true, score: 100, correctAnswers: 0, totalQuestions: 0 })
    } finally {
      setSubmitting(false)
    }
  }

  function handleNext() {
    if (currentIdx < skills.length - 1) {
      setCurrentIdx(i => i + 1)
    } else {
      // All done — proceed to bid
      onAllPassed()
    }
  }

  const isLast = currentIdx === skills.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-dark-card border border-brand-500/50 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl z-10">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <div>
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              Quiz de Acesso — {current.skillName}
            </h2>
            <p className="font-mono text-[10px] text-zinc-500 mt-0.5">
              Skill {currentIdx + 1} de {skills.length} exigidas pelo projeto
            </p>
          </div>
          <button onClick={onSkip} className="font-mono text-[10px] text-zinc-500 border border-dark-border px-2 py-1 hover:text-zinc-300 transition-colors">
            Pular
          </button>
        </div>

        <div className="p-5">
          {!result ? (
            <div className="space-y-5">
              <p className="font-mono text-xs text-zinc-400">
                Esta empresa exige validação de <span className="text-white font-bold">{current.skillName}</span> para submeter proposta.
              </p>

              {current.questions.map((q, qi) => (
                <div key={q.id} className="bg-dark-input border border-dark-border p-4">
                  <p className="font-mono text-xs text-white font-bold mb-3">
                    <span className="text-brand-500 mr-2">{qi + 1}.</span>{q.text}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <label
                        key={oi}
                        className={`flex items-center gap-3 p-2 border cursor-pointer transition-colors ${
                          answers[qi] === oi
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-dark-border hover:border-zinc-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`pq-${qi}`}
                          checked={answers[qi] === oi}
                          onChange={() => setAnswers(prev => {
                            const next = [...prev]
                            next[qi] = oi
                            return next
                          })}
                          className="sr-only"
                        />
                        <div className={`w-3 h-3 rounded-full border flex-shrink-0 ${answers[qi] === oi ? 'bg-brand-500 border-brand-500' : 'border-zinc-600'}`} />
                        <span className="font-mono text-xs text-zinc-300">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {error && (
                <div className="flex items-center gap-2 text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-dark-border">
                <button onClick={onSkip}
                  className="font-mono text-xs text-zinc-500 border border-dark-border px-4 py-2 hover:text-zinc-300 transition-colors uppercase">
                  Pular Validação
                </button>
                <button onClick={submitCurrentQuiz} disabled={submitting}
                  className="btn-sharp bg-brand-500 text-dark-bg font-mono font-bold text-xs px-6 py-2 border border-brand-500 hover:bg-brand-400 disabled:opacity-60 flex items-center gap-2 transition-colors">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {submitting ? 'Processando...' : 'Enviar Respostas'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              {result.passed ? (
                <>
                  <Award className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                  <h3 className="font-mono text-lg font-bold text-white mb-1">APROVADO!</h3>
                  <p className="font-mono text-xs text-zinc-400 mb-5">
                    {result.correctAnswers}/{result.totalQuestions} corretas ({result.score}%) em <span className="text-white">{current.skillName}</span>
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="font-mono text-lg font-bold text-white mb-1">REPROVADO</h3>
                  <p className="font-mono text-xs text-zinc-400 mb-2">
                    {result.correctAnswers}/{result.totalQuestions} corretas ({result.score}%) — necessário ≥70%
                  </p>
                  <p className="font-mono text-[10px] text-amber-400 mb-5">
                    Você pode continuar, mas a empresa saberá que não passou no quiz.
                  </p>
                </>
              )}
              <button onClick={handleNext}
                className="btn-sharp bg-brand-500 text-dark-bg font-mono font-bold text-xs px-8 py-3 border border-brand-500 hover:bg-brand-400 transition-colors">
                {isLast ? 'Enviar Proposta' : 'Próxima Skill'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
