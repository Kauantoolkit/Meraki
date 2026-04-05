import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Briefcase, User, Award, ChevronRight, ExternalLink, GitBranch, ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import { portfolioApi, PublicProfile, WorkHistoryItem } from '../api/portfolio'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

type Tab = 'history' | 'repos'

export default function PerfilEspecialista() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('history')

  useEffect(() => {
    if (!id) return
    portfolioApi.getPublicProfile(id)
      .then(res => setProfile(res.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="bg-dark-bg min-h-screen flex items-center justify-center">
      <span className="font-mono text-brand-500">Carregando perfil...</span>
    </div>
  )

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar backUrl="/talents" projectTitle="WORKSPACE // PORTFOLIO" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!profile ? (
          <div className="text-center py-16 font-mono text-zinc-500">Perfil não encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Profile Card */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-dark-card border border-dark-border p-6 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

                {/* Avatar + Name */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 bg-dark-input border border-brand-500/30 flex items-center justify-center mb-3 relative">
                    <User className="w-10 h-10 text-zinc-600" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-brand-500 border-2 border-dark-card" />
                  </div>
                  <h2 className="text-xl font-bold text-white uppercase">{profile.name}</h2>
                  <p className="font-mono text-[10px] text-brand-500 mt-0.5 tracking-wider">
                    Especialista Técnico
                  </p>
                  <p className="font-mono text-[10px] text-zinc-600 mt-0.5">
                    ID: {profile.userId?.slice(0, 12)}
                  </p>
                </div>

                {profile.bio && (
                  <p className="text-xs text-zinc-400 text-center mb-6 leading-relaxed border-y border-dark-border py-4">
                    {profile.bio}
                  </p>
                )}

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-dark-input border border-dark-border p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-3 h-3 text-orange-400" />
                      <span className="font-mono font-bold text-white text-sm">{profile.rating != null ? Number(profile.rating).toFixed(1) : '—'}</span>
                    </div>
                    <p className="font-mono text-[9px] text-zinc-500 uppercase">Reputação</p>
                  </div>
                  <div className="bg-dark-input border border-dark-border p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Briefcase className="w-3 h-3 text-brand-500" />
                      <span className="font-mono font-bold text-white text-sm">{profile.completedProjects ?? 0}</span>
                    </div>
                    <p className="font-mono text-[9px] text-zinc-500 uppercase">Projetos</p>
                  </div>
                  <div className="bg-dark-input border border-dark-border p-3 text-center">
                    <p className="font-mono font-bold text-white text-sm mb-1">100%</p>
                    <p className="font-mono text-[9px] text-zinc-500 uppercase">Taxa Entrega</p>
                  </div>
                  <div className="bg-dark-input border border-dark-border p-3 text-center">
                    <p className="font-mono font-bold text-brand-500 text-sm mb-1">R$—/h</p>
                    <p className="font-mono text-[9px] text-zinc-500 uppercase">Hora</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/projects/new')}
                  className="w-full btn-sharp bg-brand-500 text-dark-bg hover:bg-brand-400 font-mono font-bold text-xs py-3 border border-brand-500 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 shadow-[4px_4px_0px_rgba(85,202,124,0.2)]"
                >
                  <ChevronRight className="w-4 h-4" /> Iniciar Projeto
                </button>
              </div>

              {/* Stack */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="bg-dark-card border border-dark-border p-5">
                  <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-brand-500 inline-block" />
                    Stack Tecnológica
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map(s => (
                      <span key={s} className="text-[10px] font-mono border border-zinc-700 bg-dark-input text-zinc-300 px-2 py-1">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Credentials */}
              <div className="bg-dark-card border border-dark-border p-5">
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-brand-500 inline-block" />
                  Credenciais
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-dark-input border border-dark-border p-3">
                    <Award className="w-4 h-4 text-brand-500 shrink-0" />
                    <div>
                      <p className="font-mono text-[10px] text-white font-bold">AWS Certified Solutions Architect</p>
                      <p className="font-mono text-[9px] text-zinc-500">Amazon Web Services</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Work History / Repos */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex mb-6 border-b border-dark-border">
                <button
                  onClick={() => setTab('history')}
                  className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                    tab === 'history'
                      ? 'text-brand-500 border-brand-500'
                      : 'text-zinc-500 border-transparent hover:text-zinc-300'
                  }`}
                >
                  Histórico de Projetos
                </button>
                <button
                  onClick={() => setTab('repos')}
                  className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                    tab === 'repos'
                      ? 'text-brand-500 border-brand-500'
                      : 'text-zinc-500 border-transparent hover:text-zinc-300'
                  }`}
                >
                  Repositórios Públicos
                </button>
              </div>

              {tab === 'history' ? (
                <div className="space-y-4">
                  {!profile.workHistory || profile.workHistory.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-zinc-700 font-mono text-zinc-600">
                      Nenhum projeto concluído ainda.
                    </div>
                  ) : profile.workHistory.map((w, i) => (
                    <WorkHistoryCard key={i} item={w} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-dark-card border border-dark-border p-5 flex items-center gap-4 hover:border-brand-500/40 transition-colors">
                    <GitBranch className="w-5 h-5 text-brand-500 shrink-0" />
                    <div className="flex-1">
                      <p className="font-mono text-sm font-bold text-white">meraki-delivery-service</p>
                      <p className="font-mono text-[10px] text-zinc-500 mt-0.5">Microserviço de entrega e Kanban — NestJS + PostgreSQL</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-600 hover:text-brand-500 cursor-pointer transition-colors" />
                  </div>
                  <div className="py-6 text-center border border-dashed border-zinc-700 font-mono text-zinc-600 text-xs">
                    Repositórios públicos serão sincronizados via integração GitHub.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function WorkHistoryCard({ item: w }: { item: WorkHistoryItem }) {
  return (
    <div className="bg-dark-card border border-dark-border p-5 hover:border-brand-500/30 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[9px] text-brand-500 border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 uppercase">CONCLUÍDO</span>
            <span className="font-mono text-[10px] text-zinc-600">{w.companyName}</span>
          </div>
          <h3 className="text-sm font-bold text-white">{w.projectTitle}</h3>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono text-sm font-bold text-brand-500">{fmt(w.amount)}</p>
          <p className="font-mono text-[10px] text-zinc-600">{new Date(w.completedAt).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* Mock rating */}
      <div className="flex items-center gap-1 mb-3">
        {[1,2,3,4,5].map(n => (
          <Star key={n} className={`w-3 h-3 ${n <= 5 ? 'text-orange-400 fill-orange-400' : 'text-zinc-700'}`} />
        ))}
        <span className="font-mono text-[10px] text-zinc-500 ml-1">5.0</span>
      </div>
    </div>
  )
}
