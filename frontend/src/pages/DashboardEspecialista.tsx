import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Terminal, Send, Wallet, Star, Zap, Cpu, Radio, Check } from 'lucide-react'
import Navbar from '../components/Navbar'
import { projectsApi, Project } from '../api/projects'
import { bidsApi, Bid } from '../api/bids'
import { useAuth } from '../contexts/AuthContext'
import { projectStatusLabel, bidStatusLabel } from '../lib/labels'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function DashboardEspecialista() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [openProjects, setOpenProjects] = useState<Project[]>([])
  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [myBids, setMyBids] = useState<Bid[]>([])
  const [bidProjects, setBidProjects] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)

  // Habilidades do especialista logado (vêm de GET /users/me → profile.skills)
  const mySkills: string[] = ((user as any)?.profile?.skills ?? []).map((s: string) => s.toLowerCase())

  useEffect(() => {
    Promise.all([
      projectsApi.listBySpecialist(),
      bidsApi.myBids(),
      // Só busca projetos abertos se o especialista tiver skills para filtrar
      mySkills.length > 0 ? projectsApi.listOpen() : Promise.resolve(null),
    ]).then(([mine, bids, open]) => {
      const bidList: Bid[] = bids.data
      setMyProjects(mine.data.data.filter((p: Project) => p.status === 'SIGNING' || p.status === 'IN_PROGRESS' || p.status === 'COMPLETED'))
      setMyBids(bidList)
      if (open) setOpenProjects(open.data.data)
      const uniqueIds = [...new Set(bidList.map((b: Bid) => b.projectId))]
      Promise.all(
        uniqueIds.map((id: string) =>
          projectsApi.getById(id)
            .then(r => [id, r.data.title] as [string, string])
            .catch(() => [id, id.slice(0, 8)] as [string, string])
        )
      ).then(pairs => setBidProjects(new Map(pairs)))
    }).catch(() => {
      // handled by the 401 interceptor — user will be redirected to login
    }).finally(() => setLoading(false))
  }, [])

  // Recomendações só existem se há skills cadastradas — sem fallback "mostra tudo"
  const recommended = mySkills.length > 0
    ? openProjects
        .filter(p => (p.skills ?? []).some(s => mySkills.includes(s.toLowerCase())))
        .slice(0, 5)
    : []

  // Mapa projectId → Bid para exibir badge de relação nos cards
  const bidMap = new Map<string, Bid>(myBids.map(b => [b.projectId, b]))

  const bidStatusColor = (status: string) => {
    if (status === 'ACCEPTED') return 'text-brand-500'
    if (status === 'REJECTED') return 'text-red-400'
    return 'text-blue-400'
  }

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
              <span className="font-mono text-[10px] tracking-widest text-brand-500 uppercase">Sistema: Online | Status: Disponível</span>
            </div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Terminal do Especialista</h1>
            <p className="text-sm text-zinc-400 font-mono mt-2">Gira as suas entregas ativas e acompanhe o estado das propostas submetidas.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-dark-card border border-brand-500/30 p-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />
            <div className="flex justify-between items-start mb-3">
              <span className="font-mono text-[10px] text-zinc-500 uppercase">Trabalhos Ativos</span>
              <Terminal className="w-4 h-4 text-brand-500" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{String(myProjects.filter(p => p.status === 'IN_PROGRESS').length).padStart(2, '0')}</span>
          </div>
          <div className="bg-dark-card border border-dark-border p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="font-mono text-[10px] text-zinc-500 uppercase">Propostas Pendentes</span>
              <Send className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{String(myBids.filter(b => b.status === 'PENDING').length).padStart(2, '0')}</span>
          </div>
          <div className="bg-dark-card border border-dark-border p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="font-mono text-[10px] text-zinc-500 uppercase">Ganhos (Este Mês)</span>
              <Wallet className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">—</span>
          </div>
          <div className="bg-dark-card border border-dark-border p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="font-mono text-[10px] text-zinc-500 uppercase">Reputação Atual</span>
              <Star className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white font-mono">—</span>
              <span className="text-[10px] text-zinc-500 font-mono">/ 5.0</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Projects */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-dark-border pb-2">
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-500" />
                Recomendados para Você
              </h2>
              <button
                onClick={() => navigate('/projects/browse')}
                className="font-mono text-[10px] text-brand-500 hover:text-brand-400 border border-brand-500/30 hover:border-brand-500 px-2 py-1 transition-colors uppercase"
              >
                Ver todos →
              </button>
            </div>

            {loading ? (
              <div className="p-4 border border-zinc-800 border-dashed text-zinc-500 font-mono text-xs text-center">Carregando...</div>
            ) : mySkills.length === 0 ? (
              <div className="p-6 border border-zinc-800 border-dashed flex flex-col items-center gap-3 text-center">
                <span className="font-mono text-xs text-zinc-500">Sem skills cadastradas — não é possível gerar recomendações.</span>
                <button
                  onClick={() => navigate('/projects/browse')}
                  className="font-mono text-xs text-brand-500 border border-brand-500/40 px-3 py-1.5 hover:border-brand-500 transition-colors"
                >
                  Explorar projetos disponíveis →
                </button>
              </div>
            ) : recommended.length === 0 ? (
              <div className="p-4 border border-zinc-800 border-dashed text-zinc-500 font-mono text-xs text-center">
                Nenhum projeto com as suas tecnologias no momento.{' '}
                <button onClick={() => navigate('/projects/browse')} className="text-brand-500 hover:underline">Ver todos os projetos.</button>
              </div>
            ) : recommended.map(p => {
              const myBid = bidMap.get(p.id)
              const hasPending = myBid?.status === 'PENDING'
              return (
                <div key={p.id} className="bg-dark-card border border-brand-500/50 p-5 hover:border-brand-500 transition-colors">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="font-mono text-[10px] text-blue-400 border border-blue-400/30 bg-blue-400/10 px-2 py-0.5 tracking-widest">
                      OPORTUNIDADE
                    </span>
                    {myBid?.status === 'PENDING' && (
                      <span className="font-mono text-[10px] text-yellow-400 border border-yellow-400/30 bg-yellow-400/10 px-2 py-0.5">PROPOSTA ENVIADA</span>
                    )}
                    {myBid?.status === 'REJECTED' && (
                      <span className="font-mono text-[10px] text-red-400 border border-red-400/30 bg-red-400/10 px-2 py-0.5">REJEITADA</span>
                    )}
                    {myBid?.status === 'WITHDRAWN' && (
                      <span className="font-mono text-[10px] text-zinc-400 border border-zinc-600/30 bg-zinc-600/10 px-2 py-0.5">RETIRADA</span>
                    )}
                    <span className="font-mono text-[10px] text-zinc-500">{p.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{p.title}</h3>
                  <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{p.description || 'S/ Desc.'}</p>
                  <div className="bg-[#000] border border-dark-border p-3 mb-4 flex gap-4">
                    <div>
                      <p className="font-mono text-[9px] text-zinc-500">ORÇAMENTO (MAX)</p>
                      <p className="font-mono text-xs font-bold text-white">{fmt(p.budget)}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] text-zinc-500">DEADLINE</p>
                      <p className="font-mono text-xs text-white">{p.deadline}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/bidding/${p.id}`)}
                    className={`btn-sharp font-bold font-mono text-xs px-4 py-2 border transition-colors ${
                      hasPending
                        ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/40 hover:bg-yellow-400/20'
                        : 'bg-brand-500 text-dark-bg border-brand-500 hover:bg-brand-400'
                    }`}
                  >
                    {hasPending ? 'VER_PROPOSTA()' : 'ENVIAR_PROPOSTA()'}
                  </button>
                </div>
              )
            })}

            {/* Propostas Pendentes */}
            {myBids.filter(b => b.status === 'PENDING').length > 0 && (
              <>
                <div className="flex items-center justify-between border-b border-dark-border pb-2 mt-4">
                  <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-400" /> Propostas Pendentes
                  </h2>
                  <span className="font-mono text-[10px] text-blue-400 border border-blue-400/30 bg-blue-400/10 px-2 py-0.5">
                    {myBids.filter(b => b.status === 'PENDING').length} aguardando
                  </span>
                </div>
                {myBids.filter(b => b.status === 'PENDING').map(bid => (
                  <div key={bid.id} className="bg-dark-card border border-blue-400/20 p-4 hover:border-blue-400/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-[10px] text-yellow-400 border border-yellow-400/30 bg-yellow-400/10 px-2 py-0.5">AGUARDANDO RESPOSTA</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-3">
                      {bidProjects.get(bid.projectId) ?? <span className="font-mono text-zinc-500 text-[10px]">{bid.projectId.slice(0, 8)}</span>}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] text-zinc-400">{fmt(bid.amount)} · {bid.durationDays} dias</span>
                      <button
                        onClick={() => navigate(`/bidding/${bid.projectId}`)}
                        className="btn-sharp font-mono text-xs text-blue-400 border border-blue-400/30 px-3 py-1 hover:border-blue-400 hover:bg-blue-400/10 transition-colors"
                      >
                        VER_PROPOSTA()
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className="flex items-center justify-between border-b border-dark-border pb-2 mt-4">
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-500" /> Trabalhos em Execução
              </h2>
            </div>

            {myProjects.filter(p => p.status !== 'COMPLETED').length === 0 ? (
              <div className="p-4 border border-zinc-800 border-dashed text-zinc-500 font-mono text-xs text-center">Nenhum trabalho em execução no momento.</div>
            ) : myProjects.filter(p => p.status !== 'COMPLETED').map(p => (
              <div key={p.id} className={`bg-dark-card border p-5 transition-colors ${p.status === 'SIGNING' ? 'border-yellow-500/50 hover:border-yellow-500' : 'border-dark-border hover:border-brand-500/50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {p.status === 'SIGNING' ? (
                    <span className="font-mono text-[10px] text-yellow-400 border border-yellow-400/30 bg-yellow-400/10 px-2 py-0.5 tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-yellow-400 animate-pulse" /> AGUARDANDO ASSINATURA
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-brand-500 border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-brand-500 animate-pulse" /> {projectStatusLabel[p.status] ?? p.status}
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-zinc-500">{p.id.slice(0, 8)}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{p.title}</h3>
                <div className="bg-[#000] border border-dark-border p-4 mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[10px] text-brand-500">DADOS DO CONTRATO</span>
                    <span className="font-mono text-[10px] text-zinc-500">Deadline: {p.deadline}</span>
                  </div>
                  <h4 className="font-mono text-sm text-white font-bold">Orçamento: {fmt(p.budget)}</h4>
                </div>
                {p.status === 'SIGNING' ? (
                  <button
                    onClick={() => navigate(`/contract/${p.id}`)}
                    className="btn-sharp bg-yellow-500 text-dark-bg font-bold font-mono text-xs px-4 py-2 hover:bg-yellow-400 border border-yellow-500 transition-colors shadow-[2px_2px_0px_rgba(234,179,8,0.2)]"
                  >
                    ASSINAR_CONTRATO()
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/kanban/${p.id}`)}
                    className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-4 py-2 hover:bg-brand-400 border border-brand-500 transition-colors shadow-[2px_2px_0px_rgba(85,202,124,0.2)]"
                  >
                    ABRIR_KANBAN()
                  </button>
                )}
              </div>
            ))}

            {myProjects.filter(p => p.status === 'COMPLETED').length > 0 && (
              <>
                <div className="flex items-center justify-between border-b border-dark-border pb-2 mt-4">
                  <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Check className="w-4 h-4 text-zinc-400" /> Projetos Concluídos
                  </h2>
                </div>
                {myProjects.filter(p => p.status === 'COMPLETED').map(p => (
                  <div key={p.id} className="bg-dark-card border border-zinc-700 p-5 transition-colors hover:border-zinc-600 opacity-75">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-[10px] text-zinc-400 border border-zinc-600 bg-zinc-800 px-2 py-0.5 tracking-widest flex items-center gap-1">
                        <Check className="w-3 h-3" /> CONCLUÍDO
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">{p.id.slice(0, 8)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{p.title}</h3>
                    <div className="bg-[#000] border border-dark-border p-4">
                      <h4 className="font-mono text-sm text-zinc-400 font-bold">Orçamento: {fmt(p.budget)}</h4>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Right: Bids */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-dark-border pb-2">
                <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Radio className="w-4 h-4 text-zinc-400" /> Registo de Propostas
                </h2>
              </div>

              <div className="bg-[#000] border border-dark-border p-4 font-mono text-[10px] leading-relaxed flex flex-col gap-3 h-[320px] overflow-y-auto terminal-scroll">
                {myBids.length === 0 ? (
                  <p className="text-zinc-600">Nenhuma proposta enviada ainda.</p>
                ) : myBids.map(bid => (
                  <div key={bid.id} className="border-b border-dark-border/50 pb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-zinc-400 truncate max-w-[140px]" title={bidProjects.get(bid.projectId)}>
                        {bidProjects.get(bid.projectId) ?? bid.projectId.slice(0, 8)}
                      </span>
                      <span className={bidStatusColor(bid.status)}>{bidStatusLabel[bid.status] ?? bid.status}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-zinc-600">{fmt(bid.amount)} ({bid.durationDays} dias)</span>
                      {bid.status === 'PENDING' && (
                        <button
                          onClick={() => navigate(`/bidding/${bid.projectId}`)}
                          className="text-blue-400 hover:text-blue-300 text-[10px] underline"
                        >
                          ver →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="text-brand-500 flex items-center mt-2">
                  <span>&gt; Aguardando novos eventos</span>
                  <span className="w-1.5 h-2.5 bg-brand-500 ml-1 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
