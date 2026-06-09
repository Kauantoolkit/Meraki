import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Briefcase, User, Filter, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import { portfolioApi, PublicProfile } from '../api/portfolio'

export default function ExplorarTalentos() {
  const navigate = useNavigate()
  const [allSpecialists, setAllSpecialists] = useState<PublicProfile[]>([])
  const [specialists, setSpecialists] = useState<PublicProfile[]>([])
  const [availableSkills, setAvailableSkills] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set())

  async function fetchAndFilter(searchVal: string, skills: Set<string>) {
    setLoading(true)
    try {
      let pool = allSpecialists
      if (pool.length === 0) {
        const res = await portfolioApi.listSpecialists()
        pool = res.data
        setAllSpecialists(pool)
        const skillSet = new Set<string>()
        pool.forEach(s => s.skills?.forEach(sk => skillSet.add(sk)))
        setAvailableSkills(Array.from(skillSet).sort())
      }
      let result = pool
      if (searchVal.trim()) {
        const q = searchVal.toLowerCase()
        result = result.filter(s => s.name.toLowerCase().includes(q) || s.bio?.toLowerCase().includes(q))
      }
      if (skills.size > 0) {
        result = result.filter(s => Array.from(skills).every(sk => s.skills?.includes(sk)))
      }
      setSpecialists(result)
      setHasSearched(true)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch() {
    fetchAndFilter(search, selectedSkills)
  }

  function toggleSkill(skill: string) {
    setSelectedSkills(prev => {
      const next = new Set(prev)
      if (next.has(skill)) next.delete(skill)
      else next.add(skill)
      fetchAndFilter(search, next)
      return next
    })
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
              <span className="font-mono text-[10px] tracking-widest text-brand-500 uppercase">Meraki // Online</span>
            </div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Diretório de Especialistas</h1>
            <p className="text-sm text-zinc-400 font-mono mt-2">Encontre especialistas qualificados para o seu projeto.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-500" />
              </div>
              <input type="text" maxLength={100} value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="BUSCAR ESPECIALISTA..."
                className="w-full pl-9 pr-3 py-2.5 bg-dark-input border border-dark-border text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand-500 rounded-none" />
            </div>
            <button onClick={handleSearch}
              className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-4 py-2 hover:bg-brand-400 border border-brand-500 transition-colors">
              BUSCAR()
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="hidden lg:flex flex-col gap-4 w-56 shrink-0">
            <div className="bg-dark-card border border-dark-border p-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-dark-border">
                <Filter className="w-3.5 h-3.5 text-brand-500" />
                <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">Filtros</h2>
              </div>

              {/* Skills */}
              <div className="mb-5">
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
                  Habilidades {availableSkills.length > 0 && <span className="text-zinc-600">({availableSkills.length})</span>}
                </p>
                {availableSkills.length === 0 ? (
                  <p className="font-mono text-[10px] text-zinc-600 italic">Nenhuma habilidade cadastrada ainda.</p>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {availableSkills.map(skill => (
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
                )}
              </div>

              {selectedSkills.size > 0 && (
                <button
                  onClick={() => {
                    const empty = new Set<string>()
                    setSelectedSkills(empty)
                    applyFilters(search, empty)
                  }}
                  className="w-full font-mono text-[10px] text-zinc-500 hover:text-zinc-300 py-1.5 border border-transparent hover:border-dark-border transition-colors uppercase tracking-widest"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-16 font-mono text-zinc-500">Carregando especialistas...</div>
            ) : !hasSearched ? (
              <div className="text-center py-16 border border-zinc-800 border-dashed font-mono">
                <Search className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm mb-1">Encontre o especialista certo para o seu projeto.</p>
                <p className="text-zinc-600 text-[10px] uppercase tracking-widest">Digite um nome ou selecione uma habilidade para buscar</p>
              </div>
            ) : specialists.length === 0 ? (
              <div className="text-center py-16 border border-zinc-800 border-dashed font-mono text-zinc-500">
                Nenhum especialista encontrado para os filtros aplicados.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-[10px] text-zinc-500 uppercase">
                    {specialists.length} de {allSpecialists.length} especialista{allSpecialists.length !== 1 ? 's' : ''}
                    {selectedSkills.size > 0 && <span className="text-brand-500 ml-2">({selectedSkills.size} filtro{selectedSkills.size !== 1 ? 's' : ''} ativo{selectedSkills.size !== 1 ? 's' : ''})</span>}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specialists.map(s => (
                    <SpecialistCard key={s.id} specialist={s} onView={() => navigate(`/profile/specialist/${s.userId}`)} />
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
        {s.rating != null && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-orange-400" />
            <span className="font-mono text-[10px] text-white">{Number(s.rating).toFixed(1)}</span>
          </div>
        )}
      </div>

      {s.bio && <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{s.bio}</p>}

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

      <div className="flex items-center justify-between border-t border-dark-border pt-3">
        <div className="flex items-center gap-1">
          <Briefcase className="w-3 h-3 text-zinc-500" />
          <span className="font-mono text-[10px] text-zinc-400">{s.completedProjects ?? 0} projetos concluídos</span>
        </div>
        <button
          onClick={onView}
          className="font-mono text-[10px] font-bold text-dark-bg bg-brand-500 hover:bg-brand-400 border border-brand-500 px-3 py-1.5 transition-colors uppercase flex items-center gap-1"
        >
          VER_PERFIL() <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
