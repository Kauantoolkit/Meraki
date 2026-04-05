import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Briefcase, User, Filter, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import { portfolioApi, PublicProfile } from '../api/portfolio'

const SKILL_OPTIONS = ['NestJS', 'Flutter', 'NodeJS', 'React', 'AWS', 'Docker', 'PostgreSQL', 'TypeScript', 'Kubernetes', 'GraphQL']
const EXPERIENCE_LEVELS = ['Júnior (0-2 anos)', 'Pleno (2-5 anos)', 'Sênior (5+ anos)', 'Sênior Especialista (10%+ anos)']

export default function ExplorarTalentos() {
  const navigate = useNavigate()
  const [specialists, setSpecialists] = useState<PublicProfile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Filters (UI state only — real filtering would hit API)
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set())
  const [minRate, setMinRate] = useState('')
  const [maxRate, setMaxRate] = useState('')
  const [experience, setExperience] = useState('')

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

  function toggleSkill(skill: string) {
    setSelectedSkills(prev => {
      const next = new Set(prev)
      if (next.has(skill)) next.delete(skill)
      else next.add(skill)
      return next
    })
  }

  function applyFilters() {
    setLoading(true)
    const skillsParam = selectedSkills.size > 0 ? Array.from(selectedSkills).join(',') : undefined
    portfolioApi.listSpecialists(search, skillsParam)
      .then(res => setSpecialists(res.data))
      .finally(() => setLoading(false))
  }

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-brand-500 animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-brand-500 uppercase">Portfolio Service // Online</span>
            </div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Diretório de Especialistas</h1>
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

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="hidden lg:flex flex-col gap-4 w-56 shrink-0">
            <div className="bg-dark-card border border-dark-border p-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-dark-border">
                <Filter className="w-3.5 h-3.5 text-brand-500" />
                <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">Eye_Filtros</h2>
              </div>

              {/* Skills */}
              <div className="mb-5">
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Stack</p>
                <div className="space-y-1.5">
                  {SKILL_OPTIONS.map(skill => (
                    <label key={skill} className="flex items-center gap-2 cursor-pointer group">
                      <div
                        onClick={() => toggleSkill(skill)}
                        className={`w-3.5 h-3.5 border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          selectedSkills.has(skill)
                            ? 'bg-brand-500 border-brand-500'
                            : 'bg-dark-input border-zinc-700 group-hover:border-zinc-500'
                        }`}
                      >
                        {selectedSkills.has(skill) && (
                          <svg className="w-2.5 h-2.5 text-dark-bg" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10 3L5 8.5L2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                        )}
                      </div>
                      <span className={`font-mono text-[11px] transition-colors ${selectedSkills.has(skill) ? 'text-brand-500' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                        {skill}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rate range */}
              <div className="mb-5">
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Valor / Hora (BRL)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number" value={minRate} onChange={e => setMinRate(e.target.value)}
                    placeholder="Min"
                    className="w-full bg-dark-input border border-dark-border px-2 py-1.5 text-[10px] font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
                  />
                  <span className="text-zinc-600 font-mono text-[10px]">—</span>
                  <input
                    type="number" value={maxRate} onChange={e => setMaxRate(e.target.value)}
                    placeholder="Max"
                    className="w-full bg-dark-input border border-dark-border px-2 py-1.5 text-[10px] font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="mb-5">
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Nível Profissional</p>
                <div className="space-y-1.5">
                  {EXPERIENCE_LEVELS.map(level => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer group">
                      <div
                        onClick={() => setExperience(experience === level ? '' : level)}
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          experience === level
                            ? 'border-brand-500 bg-brand-500'
                            : 'border-zinc-700 group-hover:border-zinc-500'
                        }`}
                      >
                        {experience === level && <div className="w-1.5 h-1.5 rounded-full bg-dark-bg" />}
                      </div>
                      <span className={`font-mono text-[10px] transition-colors ${experience === level ? 'text-brand-500' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={applyFilters}
                className="w-full btn-sharp bg-brand-500 text-dark-bg hover:bg-brand-400 font-mono font-bold text-[10px] py-2.5 border border-brand-500 transition-colors uppercase tracking-widest"
              >
                Aplicar Filtros
              </button>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-16 font-mono text-zinc-500">Carregando especialistas...</div>
            ) : specialists.length === 0 ? (
              <div className="text-center py-16 border border-zinc-800 border-dashed font-mono text-zinc-500">
                Nenhum especialista encontrado.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-[10px] text-zinc-500 uppercase">
                    {specialists.length} resultado{specialists.length !== 1 ? 's' : ''} encontrados
                  </p>
                  <span className="font-mono text-[10px] text-zinc-600">Ordenar por: Relevância</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specialists.map(s => (
                    <SpecialistCard key={s.id} specialist={s} onView={() => navigate(`/profile/specialist/${s.userId}`)} />
                  ))}
                </div>

                {/* Pagination mock */}
                <div className="flex items-center justify-center gap-2 mt-8">
                  {[1, 2, 3, 4, 5].map(p => (
                    <button key={p}
                      className={`w-8 h-8 font-mono text-xs border transition-colors ${p === 1 ? 'bg-brand-500 border-brand-500 text-dark-bg' : 'bg-dark-input border-dark-border text-zinc-400 hover:border-zinc-500'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function SpecialistCard({ specialist: s, onView }: { specialist: PublicProfile; onView: () => void }) {
  return (
    <div className="bg-dark-card border border-dark-border p-5 hover:border-brand-500/40 transition-colors relative group">
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Top: avatar + name + rate */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-dark-input border border-brand-500/30 flex items-center justify-center">
            <User className="w-5 h-5 text-zinc-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{s.name}</p>
            <p className="font-mono text-[10px] text-zinc-500">ID: {s.userId?.slice(0, 8)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs font-bold text-brand-500">R$ —/h</p>
          <div className="flex items-center gap-1 justify-end mt-0.5">
            <Star className="w-3 h-3 text-orange-400" />
            <span className="font-mono text-[10px] text-white">{s.rating != null ? Number(s.rating).toFixed(1) : '—'}</span>
          </div>
        </div>
      </div>

      {s.bio && <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{s.bio}</p>}

      {/* Skills */}
      {s.skills && s.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {s.skills.slice(0, 5).map(skill => (
            <span key={skill} className="text-[9px] font-mono border border-zinc-700 bg-dark-input text-zinc-300 px-1.5 py-0.5">
              {skill}
            </span>
          ))}
          {s.skills.length > 5 && (
            <span className="text-[9px] font-mono text-zinc-600">+{s.skills.length - 5}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-dark-border pt-3">
        <div className="flex items-center gap-1">
          <Briefcase className="w-3 h-3 text-zinc-500" />
          <span className="font-mono text-[10px] text-zinc-400">{s.completedProjects ?? 0} projetos</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="font-mono text-[10px] font-bold text-zinc-400 hover:text-brand-500 border border-dark-border hover:border-brand-500/50 px-3 py-1.5 transition-colors uppercase"
          >
            VER_PERFIL()
          </button>
          <button
            className="font-mono text-[10px] font-bold text-dark-bg bg-brand-500 hover:bg-brand-400 border border-brand-500 px-3 py-1.5 transition-colors uppercase flex items-center gap-1"
          >
            CONTRATAR <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
