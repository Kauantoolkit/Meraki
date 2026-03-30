import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Building2, Briefcase, Star } from 'lucide-react'
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
      <Navbar backUrl="/talents" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!profile ? (
          <div className="text-center py-16 font-mono text-zinc-500">Perfil não encontrado.</div>
        ) : (
          <div className="bg-dark-card border border-dark-border p-8 relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-dark-border">
              <div className="w-16 h-16 bg-dark-input border border-brand-500 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-brand-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white uppercase">{profile.name}</h1>
                <p className="font-mono text-xs text-zinc-500">Empresa // ID: {profile.userId}</p>
              </div>
            </div>

            {profile.bio && <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{profile.bio}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-input border border-dark-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-brand-500" />
                  <span className="font-mono text-xs text-zinc-500 uppercase">Projetos Publicados</span>
                </div>
                <span className="font-mono text-2xl font-bold text-white">{profile.completedProjects ?? 0}</span>
              </div>
              <div className="bg-dark-input border border-dark-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-orange-400" />
                  <span className="font-mono text-xs text-zinc-500 uppercase">Avaliação Média</span>
                </div>
                <span className="font-mono text-2xl font-bold text-white">{profile.rating?.toFixed(1) ?? '—'}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
