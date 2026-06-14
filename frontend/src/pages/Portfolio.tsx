import { useState, useEffect } from 'react'
import { Star, Briefcase, User, ChevronRight, Plus, X, Pencil, CheckCircle, Award, Loader2, AlertCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import { portfolioApi, PublicProfile } from '../api/portfolio'
import { usersApi } from '../api/auth'
import { skillsApi, Skill, SkillQuestion, SkillValidation, QuizResult } from '../api/skills'
import { extractApiError } from '../api/client'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

type Tab = 'history' | 'skills'

export default function Portfolio() {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('history')
  const [editOpen, setEditOpen] = useState(false)
  const [addSkillOpen, setAddSkillOpen] = useState(false)

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
                    {profile.skills.map(s => {
                      const badge = profile.skillBadges?.[s]
                      return (
                        <span key={s} className="flex items-center gap-1 text-[10px] font-mono border border-zinc-700 bg-dark-input text-zinc-300 px-2 py-1">
                          {s}
                          {badge === 'green' && <Award className="w-3 h-3 text-green-400" title="Badge Verde — Projeto entregue" />}
                          {badge === 'yellow' && <Award className="w-3 h-3 text-yellow-400" title="Badge Amarela — Quiz aprovado" />}
                        </span>
                      )
                    })}
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
                <SkillsTab
                  profile={profile}
                  onSkillAdded={(updatedProfile) => setProfile(updatedProfile)}
                  onAddSkillOpen={() => setAddSkillOpen(true)}
                />
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

      {addSkillOpen && profile && (
        <AddSkillModal
          profile={profile}
          onClose={() => setAddSkillOpen(false)}
          onSkillAdded={(skillName: string) => {
            // Optimistic update — badge salvo no identity-service, mas event RabbitMQ
            // para o portfolio-service é async. Atualizamos o estado local imediatamente
            // para não depender do race condition de propagação de evento.
            setAddSkillOpen(false)
            setProfile(prev => prev ? {
              ...prev,
              skills: [...(prev.skills ?? []), skillName],
              skillBadges: { ...(prev.skillBadges ?? {}), [skillName]: 'yellow' },
            } : prev)
          }}
        />
      )}
    </div>
  )
}

// ─── SkillsTab ────────────────────────────────────────────────────────────────

function SkillsTab({ profile, onSkillAdded, onAddSkillOpen }: {
  profile: PublicProfile
  onSkillAdded: (p: PublicProfile) => void
  onAddSkillOpen: () => void
}) {
  const [validations, setValidations] = useState<SkillValidation[]>([])
  const [loadingValidations, setLoadingValidations] = useState(true)

  useEffect(() => {
    skillsApi.getMyValidations()
      .then(res => setValidations(res.data))
      .catch(() => {})
      .finally(() => setLoadingValidations(false))
  }, [profile.skills])

  const skills = profile.skills ?? []
  const badges = profile.skillBadges ?? {}

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-zinc-500">
          {skills.length === 0
            ? 'Nenhuma habilidade validada.'
            : `${skills.length} habilidade${skills.length !== 1 ? 's' : ''} no perfil.`}
        </p>
        <button onClick={onAddSkillOpen}
          className="font-mono text-[10px] text-brand-500 border border-brand-500/50 hover:border-brand-500 px-3 py-1.5 transition-colors flex items-center gap-1">
          <Plus className="w-3 h-3" /> Adicionar Skill
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-zinc-700 font-mono text-zinc-600">
          <p className="mb-3">Adicione suas habilidades validadas por quiz para aparecer nas buscas.</p>
          <button onClick={onAddSkillOpen}
            className="btn-sharp bg-brand-500 text-dark-bg font-mono font-bold text-xs px-6 py-2 border border-brand-500 hover:bg-brand-400 transition-colors">
            Adicionar Habilidade
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {skills.map(skill => {
            const badge = badges[skill]
            return (
              <div key={skill} className="bg-dark-card border border-dark-border p-4 flex items-center justify-between hover:border-brand-500/30 transition-colors">
                <span className="font-mono text-sm text-white font-bold">{skill}</span>
                <div className="flex items-center gap-2">
                  {badge === 'green' ? (
                    <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-400/30 px-2 py-1">
                      <Award className="w-3 h-3 text-green-400" />
                      <span className="font-mono text-[10px] text-green-400">Badge Verde</span>
                    </div>
                  ) : badge === 'yellow' ? (
                    <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-400/30 px-2 py-1">
                      <Award className="w-3 h-3 text-yellow-400" />
                      <span className="font-mono text-[10px] text-yellow-400">Badge Amarela</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-dark-input border border-zinc-700 px-2 py-1">
                      <CheckCircle className="w-3 h-3 text-zinc-500" />
                      <span className="font-mono text-[10px] text-zinc-500">Adicionada</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="bg-dark-input border border-dark-border p-4 mt-4">
        <p className="font-mono text-xs text-white font-bold mb-2">Legenda de Badges</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-yellow-400" />
            <p className="font-mono text-[10px] text-zinc-400">
              <span className="text-yellow-400 font-bold">Amarelo</span> — Quiz aprovado (≥70%). Skill validada teoricamente.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-green-400" />
            <p className="font-mono text-[10px] text-zinc-400">
              <span className="text-green-400 font-bold">Verde</span> — Projeto entregue. Skill validada na prática.
            </p>
          </div>
        </div>
      </div>

      {/* Recent attempts */}
      {!loadingValidations && validations.length > 0 && (
        <div className="mt-4">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-3">Tentativas Recentes</p>
          <div className="space-y-1.5">
            {validations.slice(0, 5).map(v => (
              <div key={v.id} className="flex items-center justify-between bg-dark-input border border-dark-border px-3 py-2">
                <span className="font-mono text-xs text-white">{v.skillName}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-zinc-500">{v.score}%</span>
                  <span className={`font-mono text-[10px] px-2 py-0.5 border ${
                    v.passed
                      ? 'text-brand-500 border-brand-500/30 bg-brand-500/10'
                      : 'text-red-400 border-red-500/30 bg-red-500/10'
                  }`}>
                    {v.passed ? 'APROVADO' : 'REPROVADO'}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-600">
                    {new Date(v.attemptedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── AddSkillModal ────────────────────────────────────────────────────────────

type AddSkillStep = 'pick' | 'quiz' | 'result'

function AddSkillModal({ profile, onClose, onSkillAdded }: {
  profile: PublicProfile
  onClose: () => void
  onSkillAdded: (skillName: string) => void
}) {
  const [step, setStep] = useState<AddSkillStep>('pick')
  const [catalog, setCatalog] = useState<Skill[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [questions, setQuestions] = useState<SkillQuestion[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [error, setError] = useState('')

  const existingSkills = new Set(profile.skills ?? [])

  useEffect(() => {
    skillsApi.getAll()
      .then(res => setCatalog(res.data))
      .catch(() => setError('Erro ao carregar catálogo de skills'))
      .finally(() => setLoadingCatalog(false))
  }, [])

  async function pickSkill(skill: Skill) {
    setSelectedSkill(skill)
    setLoadingQuestions(true)
    setError('')
    try {
      const res = await skillsApi.getRandomQuestions(skill.id)
      if (!res.data || res.data.length === 0) {
        setError('Esta skill não possui questões disponíveis ainda.')
        return
      }
      setQuestions(res.data)
      setAnswers(new Array(res.data.length).fill(-1))
      setStep('quiz')
    } catch {
      setError('Erro ao carregar questões.')
    } finally {
      setLoadingQuestions(false)
    }
  }

  async function submitQuiz() {
    if (answers.some(a => a === -1)) {
      setError('Responda todas as questões antes de enviar.')
      return
    }
    if (!selectedSkill) return
    setSubmitting(true)
    setError('')
    try {
      const questionIds = questions.map(q => q.id)
      const res = await skillsApi.attemptProfile(selectedSkill.id, answers, questionIds)
      setResult(res.data)
      setStep('result')
    } catch (err) {
      setError(extractApiError(err, 'Erro ao processar respostas.'))
    } finally {
      setSubmitting(false)
    }
  }

  const availableSkills = catalog.filter(s => !existingSkills.has(s.name))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-dark-card border border-dark-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl z-10">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
            {step === 'pick' && 'Selecionar Habilidade'}
            {step === 'quiz' && `Quiz — ${selectedSkill?.displayName}`}
            {step === 'result' && 'Resultado do Quiz'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {/* Step: Pick skill */}
          {step === 'pick' && (
            <div className="space-y-3">
              <p className="font-mono text-xs text-zinc-500 mb-4">
                Escolha uma skill do catálogo. Você fará um quiz para validar seu conhecimento.
              </p>
              {loadingCatalog ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                </div>
              ) : availableSkills.length === 0 ? (
                <p className="font-mono text-xs text-zinc-500 text-center py-8">
                  Nenhuma skill disponível para adicionar.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableSkills.map(skill => (
                    <button
                      key={skill.id}
                      onClick={() => pickSkill(skill)}
                      disabled={loadingQuestions}
                      className="text-left bg-dark-input border border-dark-border p-3 hover:border-brand-500 transition-colors disabled:opacity-50"
                    >
                      <p className="font-mono text-sm text-white font-bold">{skill.displayName}</p>
                    </button>
                  ))}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs mt-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step: Quiz */}
          {step === 'quiz' && (
            <div className="space-y-6">
              <p className="font-mono text-xs text-zinc-500">
                Responda as {questions.length} questões abaixo. É necessário acertar ≥70% para adicionar a skill ao perfil.
              </p>
              {questions.map((q, qi) => (
                <div key={q.id} className="bg-dark-input border border-dark-border p-4">
                  <p className="font-mono text-xs text-white font-bold mb-3">
                    <span className="text-brand-500 mr-2">{qi + 1}.</span>{q.text}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <label
                        key={oi}
                        className={`flex items-center gap-3 p-2 border cursor-pointer transition-colors ${
                          answers[qi] === oi
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-dark-border hover:border-zinc-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${qi}`}
                          checked={answers[qi] === oi}
                          onChange={() => setAnswers(prev => {
                            const next = [...prev]
                            next[qi] = oi
                            return next
                          })}
                          className="sr-only"
                        />
                        <div className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                          answers[qi] === oi ? 'bg-brand-500 border-brand-500' : 'border-zinc-600'
                        }`} />
                        <span className="font-mono text-xs text-zinc-300">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {error && (
                <div className="flex items-center gap-2 text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-dark-border">
                <button onClick={() => { setStep('pick'); setError('') }}
                  className="font-mono text-xs text-zinc-400 border border-dark-border px-4 py-2 hover:border-zinc-500 transition-colors uppercase">
                  Voltar
                </button>
                <button onClick={submitQuiz} disabled={submitting}
                  className="btn-sharp bg-brand-500 text-dark-bg font-mono font-bold text-xs px-6 py-2 border border-brand-500 hover:bg-brand-400 transition-colors disabled:opacity-60 flex items-center gap-2">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  {submitting ? 'Processando...' : 'Enviar Respostas'}
                </button>
              </div>
            </div>
          )}

          {/* Step: Result */}
          {step === 'result' && result && (
            <div className="text-center py-4">
              {result.passed ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-400/30 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="font-mono text-lg font-bold text-white mb-1">APROVADO!</h3>
                  <p className="font-mono text-xs text-yellow-400 mb-4">
                    Você acertou {result.correctAnswers}/{result.totalQuestions} ({result.score}%)
                  </p>
                  <p className="font-mono text-xs text-zinc-400 mb-6">
                    A skill <span className="text-white font-bold">{selectedSkill?.displayName}</span> foi adicionada ao seu perfil com badge amarela.
                    Entregue projetos com esta skill para conquistar o badge verde!
                  </p>
                  <button onClick={() => onSkillAdded(selectedSkill!.name)}
                    className="btn-sharp bg-brand-500 text-dark-bg font-mono font-bold text-xs px-8 py-3 border border-brand-500 hover:bg-brand-400 transition-colors">
                    Ver Perfil Atualizado
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-400/30 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="font-mono text-lg font-bold text-white mb-1">REPROVADO</h3>
                  <p className="font-mono text-xs text-red-400 mb-4">
                    Você acertou {result.correctAnswers}/{result.totalQuestions} ({result.score}%). Necessário ≥70%.
                  </p>
                  <p className="font-mono text-xs text-zinc-400 mb-6">
                    A skill não foi adicionada ao seu perfil. Estude mais e tente novamente.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button onClick={() => { setStep('pick'); setResult(null); setError('') }}
                      className="font-mono text-xs text-zinc-400 border border-dark-border px-4 py-2 hover:border-zinc-500 transition-colors uppercase">
                      Tentar Outra
                    </button>
                    <button onClick={() => { setStep('quiz'); setAnswers(new Array(questions.length).fill(-1)); setResult(null); setError('') }}
                      className="btn-sharp bg-dark-input text-brand-500 font-mono text-xs px-4 py-2 border border-brand-500/50 hover:border-brand-500 transition-colors">
                      Tentar Novamente
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── EditProfileModal ─────────────────────────────────────────────────────────

function EditProfileModal({ profile, onClose, onSave }: {
  profile: PublicProfile | null
  onClose: () => void
  onSave: (updated: PublicProfile) => void
}) {
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await Promise.all([
        portfolioApi.updateProfile({ bio }),
        usersApi.updateProfile({ bio }),
      ])
      const fresh = await portfolioApi.getMyProfile()
      onSave(fresh.data)
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

          <div className="bg-dark-input border border-dark-border p-3">
            <p className="font-mono text-[10px] text-zinc-500">
              Para gerenciar habilidades, use o botão "Adicionar Skill" na aba Habilidades & Validações.
              Cada skill deve ser validada via quiz.
            </p>
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
