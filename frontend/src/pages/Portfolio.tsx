import { useState, useEffect } from 'react'
import { Star, Briefcase, Award, User } from 'lucide-react'
import Navbar from '../components/Navbar'
import { portfolioApi, PublicProfile } from '../api/portfolio'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function Portfolio() {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    portfolioApi.getMyProfile()
      .then(res => setProfile(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="bg-dark-bg min-h-screen flex items-center justify-center">
      <span className="font-mono text-brand-500">Carregando perfil...</span>
    </div>
  )

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Meu Portfólio</h1>
          <p className="text-sm text-zinc-400 font-mono mt-2">Perfil público e histórico profissional.</p>
        </div>

        {!profile ? (
          <div className="text-center py-16 border border-dashed border-zinc-700 font-mono text-zinc-500">
            Perfil ainda não configurado.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-dark-card border border-dark-border p-6 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 bg-dark-input border border-brand-500 flex items-center justify-center mb-3">
                    <User className="w-8 h-8 text-brand-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                  <p className="font-mono text-xs text-zinc-500 mt-1">ID: {profile.userId?.slice(0, 12)}</p>
                </div>

                {profile.bio && (
                  <p className="text-xs text-zinc-400 text-center mb-6 leading-relaxed">{profile.bio}</p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-dark-input border border-dark-border p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-3 h-3 text-orange-400" />
                    </div>
                    <p className="font-mono font-bold text-white">{profile.rating?.toFixed(1) ?? '—'}</p>
                    <p className="font-mono text-[10px] text-zinc-500">Reputação</p>
                  </div>
                  <div className="bg-dark-input border border-dark-border p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Briefcase className="w-3 h-3 text-brand-500" />
                    </div>
                    <p className="font-mono font-bold text-white">{profile.completedProjects ?? 0}</p>
                    <p className="font-mono text-[10px] text-zinc-500">Projetos</p>
                  </div>
                </div>

                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">Stack Técnico</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.map(s => (
                        <span key={s} className="text-[10px] font-mono border border-zinc-700 bg-dark-input text-zinc-300 px-2 py-0.5">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Work History */}
            <div className="lg:col-span-2">
              <div className="bg-dark-card border border-dark-border">
                <div className="p-4 border-b border-dark-border flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-500" />
                  <h2 className="font-mono text-sm font-bold text-white uppercase">Histórico Profissional</h2>
                </div>
                {!profile.workHistory || profile.workHistory.length === 0 ? (
                  <div className="p-8 text-center font-mono text-zinc-500 border border-dashed border-zinc-700 m-4">
                    Nenhum projeto concluído ainda.
                  </div>
                ) : (
                  <div className="divide-y divide-dark-border">
                    {profile.workHistory.map((w, i) => (
                      <div key={i} className="p-4 hover:bg-dark-hover transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-sm font-bold text-white">{w.projectTitle}</h3>
                            <p className="font-mono text-xs text-zinc-500">{w.companyName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-sm font-bold text-brand-500">{fmt(w.amount)}</p>
                            <p className="font-mono text-[10px] text-zinc-500">{new Date(w.completedAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
