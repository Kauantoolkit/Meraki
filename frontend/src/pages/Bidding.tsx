import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FileCode, Building2, Coins, CalendarClock, ShieldAlert, Send, Loader2, CheckSquare } from 'lucide-react'
import Navbar from '../components/Navbar'
import { projectsApi, Project } from '../api/projects'
import { bidsApi, Bid } from '../api/bids'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const TEMPLATE = (title: string, name: string) =>
  `Olá, Equipa!\n\nAnalisei os requisitos para o projeto "${title}" e é exatamente a minha especialidade.\n\nProponho a seguinte abordagem:\n1. Análise profunda e desenho arquitetural.\n2. Setup da infraestrutura.\n3. Implementação e integração.\n4. Testes e documentação.\n\nEstou disponível para iniciar imediatamente.\n\nCumprimentos,\n${name}`

export default function Bidding() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<Bid | null>(null)
  const [existingBid, setExistingBid] = useState<Bid | null>(null)

  useEffect(() => {
    if (!projectId) return
    Promise.allSettled([
      projectsApi.getById(projectId),
      bidsApi.myBids(),
    ]).then(([pResult, bResult]) => {
      if (pResult.status === 'fulfilled') setProject(pResult.value.data)
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!project) return
    setSubmitting(true)
    try {
      const res = await bidsApi.submit({
        projectId: project.id,
        amount: Number(amount),
        durationDays: Number(duration),
        proposalText: coverLetter,
      })
      setSubmitted(res.data)
    } catch (e: any) {
      const status = e?.response?.status
      const msg: string = e?.response?.data?.message ?? ''
      if (status === 422) {
        alert('Este projeto não está a aceitar novas propostas.')
      } else if (status === 409) {
        alert('Já tem uma proposta ativa neste projeto (RN02).')
      } else {
        alert(`Erro ao submeter proposta: ${msg || 'Tente novamente.'}`)
      }
    } finally {
      setSubmitting(false)
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
      <Navbar backUrl="/dashboard" projectTitle="MERAKI // BIDDING_TERMINAL" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left: Project Brief */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-dark-card border border-dark-border p-6 relative">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-500" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-500" />

              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[10px] text-zinc-400 border border-dark-border bg-dark-input px-2 py-1 tracking-widest">
                  REF: {project?.id}
                </span>
                <span className={`font-mono text-[10px] px-2 py-1 tracking-widest flex items-center gap-1.5 border ${
                  project?.status === 'OPEN'
                    ? 'text-brand-500 border-brand-500/30 bg-brand-500/10'
                    : project?.status === 'IN_PROGRESS'
                      ? 'text-blue-400 border-blue-400/30 bg-blue-400/10'
                      : 'text-zinc-500 border-zinc-700 bg-dark-input'
                }`}>
                  {project?.status === 'OPEN' && <span className="w-1.5 h-1.5 bg-brand-500 animate-pulse" />}
                  STATUS: {project?.status ?? '…'}
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
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{project?.description}</p>

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

              <div className="grid grid-cols-2 gap-px bg-dark-border">
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
                    <p className="font-mono text-[10px] text-zinc-500 uppercase">Data Limite</p>
                  </div>
                  <p className="font-mono font-bold text-white text-lg">{project?.deadline ?? '—'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right: Bid Form */}
          <section className="lg:col-span-7">
            <div className="bg-dark-card border border-dark-border relative flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-input">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-brand-500" />
                  <span className="font-mono text-xs font-bold text-white">create_proposal.sh</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">const proposedBudget =</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="font-mono text-zinc-500 group-focus-within:text-brand-500">R$</span>
                      </div>
                      <input type="number" required min={1} value={amount} onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-none" />
                    </div>
                    <p className="text-[9px] font-mono text-zinc-500 text-right">// Taxa de plataforma será retida no pagamento.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">let estimatedDays =</label>
                    <div className="relative group">
                      <input type="number" required min={1} max={3650} value={duration} onChange={e => setDuration(e.target.value)}
                        placeholder="Ex: 45"
                        className="w-full pl-4 pr-12 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-none" />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="font-mono text-zinc-500 text-xs">DIAS</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider">function writeCoverLetter() {'{'}</label>
                    <button type="button" onClick={() => project && setCoverLetter(TEMPLATE(project.title, 'Especialista'))}
                      className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 cursor-pointer">[Inserir Template]</button>
                  </div>
                  <div className="relative w-full border border-dark-border bg-[#000] p-1 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
                    <div className="absolute left-0 top-0 bottom-0 w-8 border-r border-dark-border bg-dark-input flex flex-col items-center py-2 select-none">
                      {[1,2,3,4,5,6,7,8].map(n => <span key={n} className="text-[10px] font-mono text-zinc-700">{n}</span>)}
                    </div>
                    <textarea required minLength={20} maxLength={2000} value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                      placeholder="Apresente a sua proposta técnica..."
                      className="editor-textarea w-full pl-10 pr-2 py-2 bg-transparent text-sm font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none h-64" />
                  </div>
                  <label className="text-[10px] font-mono text-brand-500 block">{'}'}</label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                    <ShieldAlert className="w-3 h-3 text-blue-400" />
                    <span>A proposta ficará invisível para concorrentes.</span>
                  </div>
                  <button type="submit" disabled={submitting}
                    className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-8 py-3 hover:bg-brand-400 border border-brand-500 transition-colors shadow-[4px_4px_0px_rgba(85,202,124,0.2)] flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{submitting ? 'A PROCESSAR...' : 'EXECUTE_SUBMIT()'}</span>
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

              {/* RN02: Already submitted overlay */}
              {existingBid && !submitted && (
                <div className="absolute inset-0 bg-dark-bg/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 border border-blue-500">
                  <ShieldAlert className="w-16 h-16 text-blue-400 mb-4" />
                  <h2 className="text-xl font-mono font-bold text-white mb-2">PROPOSTA JÁ SUBMETIDA</h2>
                  <p className="text-xs font-mono text-blue-400 text-center mb-6">&gt; RN02: Apenas uma proposta ativa por projeto é permitida.</p>
                  <div className="bg-[#000] border border-dark-border p-4 w-full max-w-sm mb-6">
                    <p className="font-mono text-[10px] text-zinc-500 mb-1">PROPOSTA EXISTENTE:</p>
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-zinc-400">ID:</span><span className="text-white">{existingBid.id}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-zinc-400">Valor:</span><span className="text-white">{fmt(existingBid.amount)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-zinc-400">Status:</span>
                      <span className={existingBid.status === 'ACCEPTED' ? 'text-brand-500' : existingBid.status === 'REJECTED' ? 'text-red-400' : 'text-blue-400'}>
                        {existingBid.status}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => navigate('/dashboard')}
                    className="btn-sharp bg-transparent text-white font-mono text-xs px-6 py-2 border border-dark-border hover:border-brand-500 hover:text-brand-500 transition-colors">
                    &lt; Retornar ao Workspace
                  </button>
                </div>
              )}

              {/* Success Overlay */}
              {submitted && (
                <div className="absolute inset-0 bg-dark-bg/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 border border-brand-500">
                  <CheckSquare className="w-16 h-16 text-brand-500 mb-4" />
                  <h2 className="text-xl font-mono font-bold text-white mb-2">PROPOSTA SUBMETIDA</h2>
                  <p className="text-xs font-mono text-brand-500 text-center mb-6">&gt; 201 CREATED: Evento `bid.submitted` publicado no broker.</p>
                  <div className="bg-[#000] border border-dark-border p-4 w-full max-w-sm mb-6">
                    <p className="font-mono text-[10px] text-zinc-500 mb-1">DETALHES DO REGISTO:</p>
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-zinc-400">ID:</span><span className="text-white">{submitted.id}</span>
                    </div>
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
    </div>
  )
}
