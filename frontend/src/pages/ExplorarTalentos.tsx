import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Briefcase, User } from 'lucide-react'
import Navbar from '../components/Navbar'
import { portfolioApi, PublicProfile } from '../api/portfolio'

export default function ExplorarTalentos() {
  const navigate = useNavigate()
  const [specialists, setSpecialists] = useState<PublicProfile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    portfolioApi.listSpecialists()
      .then(res => setSpecialists(res.data))
      .finally(() => setLoading(false))
  }, [])

  function handleSearch() {
    setLoading(true)
    portfolioApi.listSpecialists(search)
      .then(res => setSpecialists(res.data))
      .finally(() => setLoading(false))
  }

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-brand-500 animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-brand-500 uppercase">Portfolio Service // Online</span>
            </div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Explorador de Talentos</h1>
            <p className="text-sm text-zinc-400 font-mono mt-2">Encontre especialistas qualificados para o seu projeto.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-500" />
              </div>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="BUSCAR ESPECIALISTA..."
                className="w-full pl-9 pr-3 py-2.5 bg-dark-input border border-dark-border text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand-500 rounded-none" />
            </div>
            <button onClick={handleSearch}
              className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-4 py-2 hover:bg-brand-400 border border-brand-500 transition-colors">
              SEARCH()
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 font-mono text-zinc-500">Carregando especialistas...</div>
        ) : specialists.length === 0 ? (
          <div className="text-center py-16 border border-zinc-800 border-dashed font-mono text-zinc-500">
            Nenhum especialista encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialists.map(s => (
              <div key={s.id}
                onClick={() => navigate(`/profile/specialist/${s.userId}`)}
                className="bg-dark-card border border-dark-border p-5 hover:border-brand-500/50 transition-colors cursor-pointer group relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-dark-input border border-dark-border flex items-center justify-center">
                    <User className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{s.name}</p>
                    <p className="font-mono text-[10px] text-zinc-500">ID: {s.userId?.slice(0, 8)}</p>
                  </div>
                </div>

                {s.bio && <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{s.bio}</p>}

                {s.skills && s.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {s.skills.slice(0, 4).map(skill => (
                      <span key={skill} className="text-[10px] font-mono border border-zinc-700 bg-dark-input text-zinc-300 px-2 py-0.5">{skill}</span>
                    ))}
                    {s.skills.length > 4 && (
                      <span className="text-[10px] font-mono text-zinc-600">+{s.skills.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-dark-border pt-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-orange-400" />
                    <span className="font-mono text-xs text-white">{s.rating?.toFixed(1) ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-brand-500" />
                    <span className="font-mono text-xs text-zinc-400">{s.completedProjects ?? 0} projetos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
