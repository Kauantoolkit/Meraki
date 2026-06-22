import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Briefcase, User, Award, ExternalLink, GitBranch, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import Navbar from '../components/Navbar'
import { portfolioApi, PublicProfile, WorkHistoryItem, Review, Certification } from '../api/portfolio'

const fmt = (v: number | string) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0)

/** Aceita apenas http(s) para evitar XSS via esquemas como javascript:/data:. */
function safeHref(url: string): string | undefined {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:' ? url : undefined
  } catch {
    return undefined
  }
}

interface ProjectGroup {
  projectId: string
  projectTitle: string
  companyName: string
  completedAt: string
  totalAmount: number
  entries: WorkHistoryItem[]
}

function groupByProject(items: WorkHistoryItem[]): ProjectGroup[] {
  const map = new Map<string, ProjectGroup>()
  for (const w of items) {
    const existing = map.get(w.projectId)
    if (existing) {
      existing.totalAmount += w.amount
      existing.entries.push(w)
      if (w.completedAt > existing.completedAt) existing.completedAt = w.completedAt
    } else {
      map.set(w.projectId, {
        projectId: w.projectId,
        projectTitle: w.projectTitle || 'Projeto',
        companyName: w.companyName,
        completedAt: w.completedAt,
        totalAmount: w.amount,
        entries: [w],
      })
    }
  }
  return [...map.values()].sort((a, b) => b.completedAt.localeCompare(a.completedAt))
}

type Tab = 'history' | 'reviews' | 'repos'

export default function PerfilEspecialista() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('history')

  useEffect(() => {
    if (!id) return
    portfolioApi.getPublicProfile(id)
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [id])

  const reviews: Review[] = profile?.reviews ?? []
  const certifications: Certification[] = profile?.certifications ?? []

  if (loading) return (
    <div className="bg-dark-bg min-h-screen flex items-center justify-center">
      <span className="font-mono text-brand-500">Carregando perfil...</span>
    </div>
  )

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar backUrl="/talents" projectTitle="ÁREA DE TRABALHO // PORTFÓLIO" />

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
                  <div className="w-20 h-20 bg-dark-input border border-brand-500/30 flex items-center justify-center mb-3 relative overflow-hidden">
                    {profile.avatarUrl
                      ? <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                      : <User className="w-10 h-10 text-zinc-600" />
                    }
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
                    <p className="font-mono font-bold text-brand-500 text-sm mb-1">
                      {profile.workHistory && profile.workHistory.length > 0
                        ? fmt(profile.workHistory.reduce((s: number, w: any) => s + w.amount, 0) / profile.workHistory.length)
                        : 'R$—'}
                    </p>
                    <p className="font-mono text-[9px] text-zinc-500 uppercase">Média/Milestone</p>
                  </div>
                </div>

              </div>

              {/* Stack */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="bg-dark-card border border-dark-border p-5">
                  <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-brand-500 inline-block" />
                    Stack Tecnológica
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((s: string) => {
                      const badge = profile.skillBadges?.[s]
                      const cls = badge === 'green'
                        ? 'border-green-500 text-green-400'
                        : badge === 'yellow'
                        ? 'border-yellow-500 text-yellow-400'
                        : 'border-zinc-700 text-zinc-300'
                      return (
                        <span key={s} className={`text-[10px] font-mono border bg-dark-input px-2 py-1 ${cls}`}>
                          {s}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Credentials */}
              {certifications.length > 0 && (
                <div className="bg-dark-card border border-dark-border p-5">
                  <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-brand-500 inline-block" />
                    Credenciais
                  </h3>
                  <div className="space-y-2">
                    {certifications.map(cert => (
                      <div key={cert.id} className="flex items-start gap-3 bg-dark-input border border-dark-border p-3">
                        <Award className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="font-mono text-[10px] text-white font-bold truncate">{cert.name}</p>
                          <p className="font-mono text-[9px] text-zinc-500">{cert.issuer}</p>
                          {cert.issueDate && (
                            <p className="font-mono text-[9px] text-zinc-600 mt-0.5">
                              {new Date(cert.issueDate).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                          {cert.credentialUrl && safeHref(cert.credentialUrl) && (
                            <a
                              href={safeHref(cert.credentialUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-[9px] text-brand-500 hover:underline mt-0.5 block truncate"
                            >
                              Ver credencial
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  onClick={() => setTab('reviews')}
                  className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                    tab === 'reviews'
                      ? 'text-brand-500 border-brand-500'
                      : 'text-zinc-500 border-transparent hover:text-zinc-300'
                  }`}
                >
                  Avaliações ({reviews.length})
                </button>
                <button
                  onClick={() => setTab('repos')}
                  className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                    tab === 'repos'
                      ? 'text-brand-500 border-brand-500'
                      : 'text-zinc-500 border-transparent hover:text-zinc-300'
                  }`}
                >
                  Links & Repositórios
                </button>
              </div>

              {tab === 'reviews' ? (
                <div className="space-y-4" data-testid="reviews-section">
                  {reviews.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-zinc-700 font-mono text-zinc-600">
                      Nenhuma avaliação ainda.
                    </div>
                  ) : reviews.map(r => (
                    <div key={r.id} className="bg-dark-card border border-dark-border p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-white">{r.companyName ?? 'Empresa'}</span>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} className={`w-3 h-3 ${n <= r.rating ? 'text-orange-400 fill-orange-400' : 'text-zinc-700'}`} />
                          ))}
                          <span className="font-mono text-[10px] text-zinc-500 ml-1">{r.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">{r.comment}</p>
                      <p className="font-mono text-[9px] text-zinc-600 mt-2">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  ))}
                </div>
              ) : tab === 'history' ? (
                <div className="space-y-4">
                  {!profile.workHistory || profile.workHistory.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-zinc-700 font-mono text-zinc-600">
                      Nenhum projeto concluído ainda.
                    </div>
                  ) : groupByProject(profile.workHistory).map((g) => (
                    <WorkHistoryCard key={g.projectId} item={g} review={reviews.find((r: Review) => r.projectId === g.projectId)} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {!profile.links || profile.links.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-zinc-700 font-mono text-zinc-600">
                      Nenhum link cadastrado.
                    </div>
                  ) : profile.links.map((l: any, i: number) => (
                    <a
                      key={i}
                      href={safeHref(l.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-dark-card border border-dark-border p-5 flex items-center gap-4 hover:border-brand-500/40 transition-colors group"
                    >
                      <GitBranch className="w-5 h-5 text-brand-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm font-bold text-white">{l.label}</p>
                        <p className="font-mono text-[10px] text-zinc-500 mt-0.5 truncate">{l.url}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-brand-500 transition-colors shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function WorkHistoryCard({ item: g, review }: { item: ProjectGroup; review?: Review }) {
  const [open, setOpen] = useState(false)
  const count = g.entries.length

  return (
    <div className="bg-dark-card border border-dark-border hover:border-brand-500/30 transition-colors">
      <button onClick={() => setOpen(!open)} className="w-full p-5 text-left">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[9px] text-brand-500 border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 uppercase">CONCLUÍDO</span>
              {g.companyName && <span className="font-mono text-[10px] text-zinc-600">{g.companyName}</span>}
            </div>
            <h3 className="text-sm font-bold text-white">{g.projectTitle}</h3>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono text-sm font-bold text-brand-500">{fmt(g.totalAmount)}</p>
            <p className="font-mono text-[10px] text-zinc-600">{new Date(g.completedAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {review && (
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} className={`w-3 h-3 ${n <= review.rating ? 'text-orange-400 fill-orange-400' : 'text-zinc-700'}`} />
                ))}
                <span className="font-mono text-[10px] text-zinc-500 ml-1">{review.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-zinc-500">
            <span className="font-mono text-[10px]">{count} milestone{count > 1 ? 's' : ''}</span>
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-dark-border divide-y divide-dark-border">
          {g.entries.map((e, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-zinc-600 border border-zinc-700 px-1.5 py-0.5">M{i + 1}</span>
                <span className="font-mono text-xs text-zinc-300">{e.milestoneTitle || e.projectTitle || `Milestone ${i + 1}`}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs font-bold text-brand-500">{fmt(e.amount)}</span>
                <span className="font-mono text-[10px] text-zinc-600">{new Date(e.completedAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
