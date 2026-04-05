import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Building2, Briefcase, Star, Globe, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import { portfolioApi, PublicProfile } from '../api/portfolio'

export default function PerfilEmpresa() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)

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
      <Navbar backUrl="/talents" projectTitle="MERAKI // COMPANY_PROFILE" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!profile ? (
          <div className="text-center py-16 font-mono text-zinc-500">Perfil não encontrado.</div>
        ) : (
          <div className="space-y-6">
            {/* Hero banner */}
            <div className="bg-dark-card border border-dark-border relative overflow-hidden">
              <div className="h-20 bg-gradient-to-r from-dark-input to-dark-card border-b border-dark-border" />
              <div className="px-6 pb-6">
                <div className="flex items-end gap-4 -mt-8 mb-4">
                  <div className="w-16 h-16 bg-dark-input border border-dark-border flex items-center justify-center shrink-0">
                    <Building2 className="w-8 h-8 text-zinc-500" />
                  </div>
                  <div className="pb-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-white uppercase">{profile.name}</h1>
                      <CheckCircle className="w-4 h-4 text-brand-500" />
                    </div>
                    <p className="font-mono text-[10px] text-zinc-500">
                      Empresa Tecnológica // Sector Inovação
                    </p>
                  </div>
                  <div className="ml-auto pb-1">
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="w-3.5 h-3.5 text-orange-400" />
                          <span className="font-mono font-bold text-white text-sm">{profile.rating?.toFixed(1) ?? '—'}</span>
                        </div>
                        <p className="font-mono text-[10px] text-zinc-500">42 OPs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left */}
              <div className="lg:col-span-2 space-y-6">
                {/* About */}
                <div className="bg-dark-card border border-dark-border p-6">
                  <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-brand-500" /> Sobre a Empresa
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {profile.bio ?? 'A empresa é uma empresa inovadora focada na modernização de sistemas legados em instituições financeiras do setor. Trabalhamos comprovadamente com freelancers confiados que garantem entrega de código limpo, documentação e engajamento ao longo do projeto.'}
                  </p>
                </div>

                {/* Project History */}
                <div className="bg-dark-card border border-dark-border">
                  <div className="p-4 border-b border-dark-border flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-brand-500" />
                    <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      Histórico de Projetos (Mock)
                    </h2>
                  </div>

                  {/* Table header */}
                  <div className="grid grid-cols-4 gap-2 px-4 py-2 border-b border-dark-border bg-dark-input">
                    {['Projeto', 'Pub. Em', 'Descrição', 'Status'].map(h => (
                      <span key={h} className="font-mono text-[9px] text-zinc-600 uppercase">{h}</span>
                    ))}
                  </div>

                  {!profile.workHistory || profile.workHistory.length === 0 ? (
                    <div className="p-6 text-center font-mono text-zinc-600 text-xs border-dashed border-zinc-700">
                      Nenhum projeto publicado.
                    </div>
                  ) : profile.workHistory.map((w, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-dark-border hover:bg-dark-hover transition-colors items-center">
                      <span className="font-mono text-xs font-bold text-white truncate">{w.projectTitle}</span>
                      <span className="font-mono text-[10px] text-zinc-500">{new Date(w.completedAt).toLocaleDateString('pt-BR')}</span>
                      <span className="font-mono text-[10px] text-zinc-400 truncate">—</span>
                      <span className="font-mono text-[9px] text-brand-500 border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 w-fit uppercase">CONCLUÍDO</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Reviews */}
              <div className="lg:col-span-1">
                <div className="bg-dark-card border border-dark-border p-5">
                  <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-orange-400" /> Avaliações da Rede
                  </h2>
                  <div className="space-y-4">
                    {[
                      { name: 'Dev Nóbel', rating: 5, text: 'Profissionalismo exemplar. Contrataram-me para um NestJS e mantiveram comunicação clara.' },
                      { name: 'Fábio Derlys', rating: 4, text: 'Boa empresa, gostei muito da clareza, pagaram em dia e sem nenhuma surpresa.' },
                    ].map((r, i) => (
                      <div key={i} className="border border-dark-border bg-dark-input p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-mono text-xs font-bold text-white">{r.name}</p>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(n => (
                              <Star key={n} className={`w-2.5 h-2.5 ${n <= r.rating ? 'text-orange-400 fill-orange-400' : 'text-zinc-700'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
