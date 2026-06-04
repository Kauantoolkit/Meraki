import { useState, useEffect } from 'react'
import { Star, Briefcase, User, GitBranch, ExternalLink, ChevronRight, Plus, X, Pencil, CheckCircle, Clock } from 'lucide-react'
import Navbar from '../components/Navbar'
import { portfolioApi, PublicProfile } from '../api/portfolio'
import { extractApiError } from '../api/client'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

type Tab = 'history' | 'skills'

export default function Portfolio() {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('history')
  const [editOpen, setEditOpen] = useState(false)

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
      <Navbar projectTitle="ÁREA DE TRABALHO // PORTFÓLIO" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!profile ? (
          <div className="text-center py-16 border border-dashed border-zinc-700 font-mono text-zinc-500">
            <p className="mb-4">Perfil ainda não configurado.</p>
            <button onClick={() => setEditOpen(true)}
              className="btn-sharp bg-brand-500 text-dark-bg font-mono font-bold text-xs px-6 py-3 border border-brand-500 hover:bg-brand-400 transition-colors">
              Configurar Perfil
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Profile Card */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-dark-card border border-dark-border p-6 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 bg-dark-input border border-brand-500/30 flex items-center justify-center mb-3 relative">
                    <User className="w-10 h-10 text-zinc-600" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-brand-500 border-2 border-dark-card" />
                  </div>
                  <h2 className="text-xl font-bold text-white uppercase">{profile.name}</h2>
                  <p className="font-mono text-[10px] text-brand-500 mt-0.5 tracking-wider">Especialista Técnico</p>
                  <p className="font-mono text-[10px] text-zinc-600 mt-0.5">ID: {profile.userId?.slice(0, 12)}</p>
                </div>

                {profile.bio && (
                  <p className="text-xs text-zinc-400 text-center mb-6 leading-relaxed border-y border-dark-border py-4">
                    {profile.bio}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-dark-input border border-dark-border p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-3 h-3 text-orange-400" />
                      <span className="font-mono font-bold text-white text-sm">{profile.rating?.toFixed(1) ?? '—'}</span>
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
                </div>

                <button
                  onClick={() => setEditOpen(true)}
                  className="w-full btn-sharp bg-dark-input text-zinc-300 hover:text-white hover:border-brand-500 font-mono font-bold text-xs py-3 border border-dark-border transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar Perfil
                </button>
              </div>

              {profile.skills && profile.skills.length > 0 && (
                <div className="bg-dark-card border border-dark-border p-5">
                  <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-brand-500 inline-block" />
                    Habilidades
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map(s => (
                      <span key={s} className="text-[10px] font-mono border border-zinc-700 bg-dark-input text-zinc-300 px-2 py-1">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Tabs */}
            <div className="lg:col-span-2">
              <div className="flex mb-6 border-b border-dark-border">
                <button
                  onClick={() => setTab('history')}
                  className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                    tab === 'history' ? 'text-brand-500 border-brand-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                  }`}
                >
                  Histórico de Projetos
                </button>
                <button
                  onClick={() => setTab('skills')}
                  className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                    tab === 'skills' ? 'text-brand-500 border-brand-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                  }`}
                >
                  Habilidades & Validações
                </button>
              </div>

              {tab === 'history' ? (
                <div className="space-y-4">
                  {!profile.workHistory || profile.workHistory.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-zinc-700 font-mono text-zinc-600">
                      Nenhum projeto concluído ainda.
                    </div>
                  ) : profile.workHistory.map((w, i) => (
                    <div key={i} className="bg-dark-card border border-dark-border p-5 hover:border-brand-500/30 transition-colors">
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
                    </div>
                  ))}
                </div>
              ) : (
                <SkillsTab profile={profile} onUpdate={setProfile} onEditOpen={() => setEditOpen(true)} />
              )}
            </div>
          </div>
        )}
      </main>

      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSave={updated => { setProfile(updated); setEditOpen(false) }}
        />
      )}
    </div>
  )
}

function SkillsTab({ profile, onUpdate, onEditOpen }: {
  profile: PublicProfile
  onUpdate: (p: PublicProfile) => void
  onEditOpen: () => void
}) {
  const skills = profile.skills ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-zinc-500">
          {skills.length === 0
            ? 'Nenhuma habilidade cadastrada.'
            : `${skills.length} habilidade${skills.length !== 1 ? 's' : ''} cadastrada${skills.length !== 1 ? 's' : ''}.`}
        </p>
        <button onClick={onEditOpen}
          className="font-mono text-[10px] text-brand-500 border border-brand-500/50 hover:border-brand-500 px-3 py-1.5 transition-colors flex items-center gap-1">
          <Plus className="w-3 h-3" /> Gerenciar Habilidades
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-zinc-700 font-mono text-zinc-600">
          <p className="mb-3">Adicione suas habilidades para aparecer nas buscas das empresas.</p>
          <button onClick={onEditOpen}
            className="btn-sharp bg-brand-500 text-dark-bg font-mono font-bold text-xs px-6 py-2 border border-brand-500 hover:bg-brand-400 transition-colors">
            Adicionar Habilidades
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {skills.map(skill => (
            <div key={skill} className="bg-dark-card border border-dark-border p-4 flex items-center justify-between hover:border-brand-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-white font-bold">{skill}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-dark-input border border-orange-400/30 px-2 py-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  <span className="font-mono text-[10px] text-orange-400">Validação em breve</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-dark-input border border-dark-border p-4 mt-4">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-mono text-xs text-white font-bold mb-1">Sistema de Validação por Provas</p>
            <p className="font-mono text-[10px] text-zinc-500 leading-relaxed">
              Em breve, cada habilidade poderá ser validada através de um teste técnico. Especialistas aprovados recebem um badge de verificação, aumentando a visibilidade nas buscas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditProfileModal({ profile, onClose, onSave }: {
  profile: PublicProfile | null
  onClose: () => void
  onSave: (updated: PublicProfile) => void
}) {
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? [])
  const [skillInput, setSkillInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function addSkill() {
    const v = skillInput.trim()
    if (v && !skills.includes(v)) setSkills(prev => [...prev, v])
    setSkillInput('')
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await portfolioApi.updateProfile({ bio, skills })
      onSave(res.data)
    } catch (err: unknown) {
      setError(extractApiError(err, 'Erro ao salvar. Tente novamente.'))
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-dark-card border border-dark-border w-full max-w-lg p-6 shadow-2xl z-10">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

        <div className="flex items-center justify-between mb-6 border-b border-dark-border pb-4">
          <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">Editar Perfil</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-brand-500 uppercase tracking-wider block">Bio / Apresentação</label>
            <textarea
              maxLength={1000}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Conte sobre sua experiência, especialidades e o que você pode oferecer..."
              className="w-full px-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none h-28 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] text-brand-500 uppercase tracking-wider block">Habilidades</label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={40}
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Ex: React, NestJS, Docker..."
                className="flex-1 px-4 py-2 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
              />
              <button type="button" onClick={addSkill}
                className="bg-dark-input text-white font-mono text-xs px-4 py-2 border border-dark-border hover:border-brand-500 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-[#000] border border-dark-border p-3 min-h-[60px] flex flex-wrap gap-2">
              {skills.length === 0 && (
                <span className="font-mono text-[10px] text-zinc-600">Nenhuma habilidade adicionada.</span>
              )}
              {skills.map(s => (
                <span key={s}
                  onClick={() => setSkills(skills.filter(sk => sk !== s))}
                  className="group flex items-center gap-1 text-[10px] font-mono border border-zinc-700 bg-dark-input text-zinc-300 px-2 py-1 hover:border-red-500 transition-colors cursor-pointer">
                  {s} <X className="w-2.5 h-2.5 text-zinc-600 group-hover:text-red-500" />
                </span>
              ))}
            </div>
            <p className="font-mono text-[9px] text-zinc-600">Clique em uma habilidade para removê-la.</p>
          </div>

          {error && (
            <p className="font-mono text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-dark-border">
          <button onClick={onClose}
            className="font-mono text-xs text-zinc-400 border border-dark-border px-4 py-2 hover:border-zinc-500 transition-colors uppercase">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="btn-sharp bg-brand-500 text-dark-bg font-mono font-bold text-xs px-6 py-2 border border-brand-500 hover:bg-brand-400 transition-colors uppercase disabled:opacity-60 flex items-center gap-2">
            <ChevronRight className="w-3.5 h-3.5" />
            {saving ? 'Salvando...' : 'Salvar Perfil'}
          </button>
        </div>
      </div>
    </div>
  )
}
