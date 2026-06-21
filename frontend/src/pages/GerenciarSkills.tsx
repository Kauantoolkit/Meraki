import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronDown, ChevronUp, X, BookOpen, Pencil, Trash2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import { skillsApi, Skill, CreateQuestionDto } from '../api/skills'
import { extractApiError } from '../api/client'

interface QuestionInput {
  text: string
  options: [string, string, string, string]
  correctIndex: number
}

function emptyQuestion(): QuestionInput {
  return { text: '', options: ['', '', '', ''], correctIndex: 0 }
}

interface SkillQuestionFull {
  id: string
  text: string
  options: string[]
  correctIndex: number
}

export default function GerenciarSkills() {
  const navigate = useNavigate()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, SkillQuestionFull[]>>({})
  const [loadingQuestions, setLoadingQuestions] = useState<string | null>(null)
  const [addQuestionsSkillId, setAddQuestionsSkillId] = useState<string | null>(null)

  const [editingQuestion, setEditingQuestion] = useState<SkillQuestionFull | null>(null)

  function toggleExpand(skillId: string) {
    if (expandedSkill === skillId) {
      setExpandedSkill(null)
      return
    }
    setExpandedSkill(skillId)
    if (!expandedQuestions[skillId]) {
      setLoadingQuestions(skillId)
      skillsApi.getQuestions(skillId)
        .then(r => setExpandedQuestions(prev => ({ ...prev, [skillId]: r.data })))
        .finally(() => setLoadingQuestions(null))
    }
  }

  function handleQuestionUpdated(updated: SkillQuestionFull) {
    setExpandedQuestions(prev => {
      const entries = Object.entries(prev)
      const next: Record<string, SkillQuestionFull[]> = {}
      for (const [sid, qs] of entries) {
        next[sid] = qs.map(q => q.id === updated.id ? updated : q)
      }
      return next
    })
    setEditingQuestion(null)
  }

  function handleQuestionDeleted(questionId: string) {
    setExpandedQuestions(prev => {
      const entries = Object.entries(prev)
      const next: Record<string, SkillQuestionFull[]> = {}
      for (const [sid, qs] of entries) {
        next[sid] = qs.filter(q => q.id !== questionId)
      }
      return next
    })
  }

  useEffect(() => {
    skillsApi.getAll()
      .then(r => setSkills(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased flex flex-col">
      <Navbar backUrl="/dashboard" projectTitle="GERENCIAR_SKILLS" />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Catálogo de Skills</h1>
            <p className="font-mono text-xs text-zinc-500 mt-1">Crie skills e questionários que serão usados para validar especialistas.</p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-5 py-3 hover:bg-brand-400 border border-brand-500 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nova Skill
          </button>
        </div>

        {loading ? (
          <div className="font-mono text-xs text-zinc-500 text-center py-12">Carregando...</div>
        ) : skills.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-zinc-700 font-mono text-zinc-600">
            <BookOpen className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
            <p>Nenhuma skill cadastrada ainda.</p>
            <p className="text-xs mt-1">Crie a primeira skill para começar a validar especialistas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {skills.map(skill => (
              <div key={skill.id} className="bg-dark-card border border-dark-border">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:border-brand-500/30 transition-colors"
                  onClick={() => toggleExpand(skill.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-brand-500" />
                    <span className="font-mono text-sm font-bold text-white">{skill.displayName}</span>
                    <span className="font-mono text-[10px] text-zinc-500 border border-zinc-700 px-2 py-0.5">{skill.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={e => { e.stopPropagation(); setAddQuestionsSkillId(skill.id) }}
                      className="font-mono text-[10px] text-brand-500 border border-brand-500/40 px-3 py-1 hover:bg-brand-500/10 transition-colors"
                    >
                      + Questões
                    </button>
                    {expandedSkill === skill.id ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                  </div>
                </div>

                {expandedSkill === skill.id && (
                  <div className="border-t border-dark-border px-4 pb-4 pt-3 space-y-3">
                    {loadingQuestions === skill.id ? (
                      <p className="font-mono text-xs text-zinc-500">Carregando questões...</p>
                    ) : (expandedQuestions[skill.id] ?? []).length === 0 ? (
                      <p className="font-mono text-xs text-zinc-600">Nenhuma questão cadastrada.</p>
                    ) : (expandedQuestions[skill.id] ?? []).map((q, i) => (
                      <div key={q.id} className="bg-dark-input border border-dark-border p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-mono text-xs text-white"><span className="text-zinc-500">{i + 1}. </span>{q.text}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => setEditingQuestion(q)} className="text-zinc-500 hover:text-brand-400 transition-colors">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm('Remover esta questão?')) return
                                await skillsApi.deleteQuestion(q.id)
                                handleQuestionDeleted(q.id)
                              }}
                              className="text-zinc-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {q.options.map((opt, oi) => (
                            <span key={oi} className={`font-mono text-[10px] px-2 py-1 border ${oi === q.correctIndex ? 'border-brand-500 text-brand-400 bg-brand-500/10' : 'border-zinc-700 text-zinc-500'}`}>
                              {String.fromCharCode(65 + oi)}) {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {createOpen && (
        <CreateSkillModal
          onClose={() => setCreateOpen(false)}
          onCreated={skill => {
            setSkills(prev => [...prev, skill])
            setCreateOpen(false)
          }}
        />
      )}

      {addQuestionsSkillId && (
        <AddQuestionsModal
          skillId={addQuestionsSkillId}
          skillName={skills.find(s => s.id === addQuestionsSkillId)?.displayName ?? ''}
          onClose={() => setAddQuestionsSkillId(null)}
          onAdded={() => {
            const skillId = addQuestionsSkillId
            setAddQuestionsSkillId(null)
            // Invalida cache e re-fetcha se a skill estiver expandida
            setExpandedQuestions(prev => { const next = { ...prev }; delete next[skillId]; return next })
            if (expandedSkill === skillId) {
              setLoadingQuestions(skillId)
              skillsApi.getQuestions(skillId)
                .then(r => setExpandedQuestions(prev => ({ ...prev, [skillId]: r.data })))
                .finally(() => setLoadingQuestions(null))
            }
          }}
        />
      )}

      {editingQuestion && (
        <EditQuestionModal
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSaved={handleQuestionUpdated}
        />
      )}
    </div>
  )
}

// ─── CreateSkillModal ─────────────────────────────────────────────────────────

function CreateSkillModal({ onClose, onCreated }: {
  onClose: () => void
  onCreated: (skill: Skill) => void
}) {
  const [displayName, setDisplayName] = useState('')
  const [questions, setQuestions] = useState<QuestionInput[]>(Array.from({ length: 10 }, emptyQuestion))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<Skill[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedExistingSkill, setSelectedExistingSkill] = useState<Skill | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null!)

  const handleNameChange = useCallback((value: string) => {
    setDisplayName(value)
    setSelectedExistingSkill(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await skillsApi.search(value.trim())
        setSuggestions(res.data)
        setShowSuggestions(res.data.length > 0)
      } catch {
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setSearchLoading(false)
      }
    }, 300)
  }, [])

  function selectExistingSkill(skill: Skill) {
    setSelectedExistingSkill(skill)
    setDisplayName(skill.displayName)
    setShowSuggestions(false)
    setSuggestions([])
    setQuestions([emptyQuestion()])
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function addQuestion() {
    if (questions.length >= 20) return
    setQuestions(prev => [...prev, emptyQuestion()])
  }

  function removeQuestion(i: number) {
    if (questions.length <= (selectedExistingSkill ? 1 : 10)) return
    setQuestions(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateQuestion(i: number, field: 'text' | 'correctIndex', value: string | number) {
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q))
  }

  function updateOption(qi: number, oi: number, value: string) {
    setQuestions(prev => prev.map((q, idx) => {
      if (idx !== qi) return q
      const opts = [...q.options] as [string, string, string, string]
      opts[oi] = value
      return { ...q, options: opts }
    }))
  }

  async function handleSave() {
    if (!displayName.trim()) { setError('Nome da skill é obrigatório.'); return }
    const minQuestions = selectedExistingSkill ? 1 : 10
    if (questions.length < minQuestions) { setError(`Mínimo de ${minQuestions} questão(ões).`); return }
    for (const q of questions) {
      if (!q.text.trim()) { setError('Todas as questões devem ter enunciado.'); return }
      if (q.options.some(o => !o.trim())) { setError('Todas as opções devem ser preenchidas.'); return }
    }
    setSaving(true)
    setError('')
    try {
      const dto: CreateQuestionDto[] = questions.map(q => ({
        text: q.text.trim(),
        options: q.options.map(o => o.trim()),
        correctIndex: q.correctIndex,
      }))

      if (selectedExistingSkill) {
        // Add questions to existing skill
        await skillsApi.addQuestions(selectedExistingSkill.id, dto)
        onCreated(selectedExistingSkill)
      } else {
        const res = await skillsApi.create({ displayName: displayName.trim(), questions: dto })
        onCreated(res.data)
      }
    } catch (err) {
      setError(extractApiError(err, 'Erro ao criar skill.'))
      setSaving(false)
    }
  }

  return <QuestionFormModal
    title={selectedExistingSkill ? `Adicionar Questões — ${selectedExistingSkill.displayName}` : 'Criar Nova Skill'}
    showNameField
    displayName={displayName}
    onDisplayNameChange={handleNameChange}
    questions={questions}
    onAddQuestion={addQuestion}
    onRemoveQuestion={removeQuestion}
    onUpdateQuestion={updateQuestion}
    onUpdateOption={updateOption}
    onSave={handleSave}
    onClose={onClose}
    saving={saving}
    error={error}
    saveLabel={selectedExistingSkill ? 'Adicionar Questões' : 'Criar Skill'}
    autocomplete={{
      suggestions,
      showSuggestions,
      searchLoading,
      selectedExistingSkill,
      onSelect: selectExistingSkill,
      onClearSelection: () => { setSelectedExistingSkill(null); setDisplayName(''); setQuestions(Array.from({ length: 10 }, emptyQuestion)) },
      dropdownRef,
    }}
  />
}

// ─── AddQuestionsModal ────────────────────────────────────────────────────────

function AddQuestionsModal({ skillId, skillName, onClose, onAdded }: {
  skillId: string
  skillName: string
  onClose: () => void
  onAdded: () => void
}) {
  const [questions, setQuestions] = useState<QuestionInput[]>([emptyQuestion()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function addQuestion() {
    if (questions.length >= 20) return
    setQuestions(prev => [...prev, emptyQuestion()])
  }

  function removeQuestion(i: number) {
    if (questions.length <= 1) return
    setQuestions(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateQuestion(i: number, field: 'text' | 'correctIndex', value: string | number) {
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q))
  }

  function updateOption(qi: number, oi: number, value: string) {
    setQuestions(prev => prev.map((q, idx) => {
      if (idx !== qi) return q
      const opts = [...q.options] as [string, string, string, string]
      opts[oi] = value
      return { ...q, options: opts }
    }))
  }

  async function handleSave() {
    for (const q of questions) {
      if (!q.text.trim()) { setError('Todas as questões devem ter enunciado.'); return }
      if (q.options.some(o => !o.trim())) { setError('Todas as opções devem ser preenchidas.'); return }
    }
    setSaving(true)
    setError('')
    try {
      const dto: CreateQuestionDto[] = questions.map(q => ({
        text: q.text.trim(),
        options: q.options.map(o => o.trim()),
        correctIndex: q.correctIndex,
      }))
      await skillsApi.addQuestions(skillId, dto)
      onAdded()
    } catch (err) {
      setError(extractApiError(err, 'Erro ao adicionar questões.'))
      setSaving(false)
    }
  }

  return <QuestionFormModal
    title={`Adicionar Questões — ${skillName}`}
    questions={questions}
    onAddQuestion={addQuestion}
    onRemoveQuestion={removeQuestion}
    onUpdateQuestion={updateQuestion}
    onUpdateOption={updateOption}
    onSave={handleSave}
    onClose={onClose}
    saving={saving}
    error={error}
    saveLabel="Salvar Questões"
  />
}

// ─── QuestionFormModal (shared UI) ───────────────────────────────────────────

interface AutocompleteProps {
  suggestions: Skill[]
  showSuggestions: boolean
  searchLoading: boolean
  selectedExistingSkill: Skill | null
  onSelect: (skill: Skill) => void
  onClearSelection: () => void
  dropdownRef: React.RefObject<HTMLDivElement>
}

interface QuestionFormModalProps {
  title: string
  showNameField?: boolean
  displayName?: string
  onDisplayNameChange?: (v: string) => void
  questions: QuestionInput[]
  onAddQuestion: () => void
  onRemoveQuestion: (i: number) => void
  onUpdateQuestion: (i: number, field: 'text' | 'correctIndex', value: string | number) => void
  onUpdateOption: (qi: number, oi: number, value: string) => void
  onSave: () => void
  onClose: () => void
  saving: boolean
  error: string
  saveLabel: string
  autocomplete?: AutocompleteProps
}

function QuestionFormModal({
  title, showNameField, displayName, onDisplayNameChange,
  questions, onAddQuestion, onRemoveQuestion, onUpdateQuestion, onUpdateOption,
  onSave, onClose, saving, error, saveLabel, autocomplete,
}: QuestionFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative bg-dark-card border border-dark-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl z-10">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-6">
          {showNameField && (
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-brand-500 uppercase tracking-wider block">Nome da Skill</label>
              <div className="relative" ref={autocomplete?.dropdownRef}>
                {autocomplete?.selectedExistingSkill ? (
                  <div className="flex items-center gap-2 w-full px-4 py-3 bg-brand-500/10 border border-brand-500 text-sm font-mono text-white">
                    <span className="flex-1">{autocomplete.selectedExistingSkill.displayName}</span>
                    <span className="text-[10px] text-brand-400 border border-brand-500/40 px-2 py-0.5">EXISTENTE</span>
                    <button
                      type="button"
                      onClick={autocomplete.onClearSelection}
                      className="text-zinc-400 hover:text-white ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <input
                    type="text" maxLength={50} value={displayName} onChange={e => onDisplayNameChange?.(e.target.value)}
                    placeholder="Ex: React, Spring Boot, Flutter..."
                    className="w-full px-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
                  />
                )}
                {autocomplete?.searchLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                  </div>
                )}
                {autocomplete?.showSuggestions && autocomplete.suggestions.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-dark-card border border-dark-border shadow-xl max-h-48 overflow-y-auto">
                    <div className="px-3 py-1.5 border-b border-dark-border">
                      <span className="font-mono text-[10px] text-zinc-500 uppercase">Skills existentes</span>
                    </div>
                    {autocomplete.suggestions.map(skill => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => autocomplete.onSelect(skill)}
                        className="w-full text-left px-4 py-2.5 font-mono text-sm text-zinc-300 hover:bg-brand-500/10 hover:text-white transition-colors flex items-center gap-2 border-b border-dark-border last:border-b-0"
                      >
                        <div className="w-1.5 h-1.5 bg-brand-500 shrink-0" />
                        <span>{skill.displayName}</span>
                        <span className="text-[10px] text-zinc-600 ml-auto">{skill.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {autocomplete?.selectedExistingSkill && (
                <p className="font-mono text-[10px] text-brand-400">
                  Skill existente selecionada. As questoes abaixo serao adicionadas a ela.
                </p>
              )}
              {!autocomplete?.selectedExistingSkill && (displayName ?? '').trim().length >= 2 && !autocomplete?.searchLoading && autocomplete?.suggestions.length === 0 && (
                <p className="font-mono text-[10px] text-zinc-500">
                  Nenhuma skill existente encontrada. Uma nova sera criada.
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <label className="font-mono text-[10px] text-brand-500 uppercase tracking-wider block">
              Questões ({questions.length}/20)
            </label>

            {questions.map((q, qi) => (
              <div key={qi} className="bg-dark-input border border-dark-border p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase">Questão {qi + 1}</span>
                  <button
                    type="button" onClick={() => onRemoveQuestion(qi)}
                    disabled={questions.length <= (showNameField ? 10 : 1)}
                    className="text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text" maxLength={200} value={q.text}
                  onChange={e => onUpdateQuestion(qi, 'text', e.target.value)}
                  placeholder="Enunciado da questão..."
                  className="w-full px-3 py-2 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className={`flex items-center gap-2 border px-3 py-2 cursor-pointer transition-colors ${q.correctIndex === oi ? 'border-brand-500 bg-brand-500/10' : 'border-zinc-700 hover:border-zinc-500'}`}>
                      <input
                        type="radio" name={`correct-${qi}`} checked={q.correctIndex === oi}
                        onChange={() => onUpdateQuestion(qi, 'correctIndex', oi)}
                        className="accent-brand-500"
                      />
                      <input
                        type="text" maxLength={100} value={opt}
                        onChange={e => onUpdateOption(qi, oi, e.target.value)}
                        placeholder={`Opção ${oi + 1}`}
                        className="flex-1 bg-transparent text-xs font-mono text-white placeholder-zinc-600 focus:outline-none min-w-0"
                      />
                    </label>
                  ))}
                </div>
                <p className="font-mono text-[10px] text-zinc-600">Selecione o radio da opção correta.</p>
              </div>
            ))}
          </div>

          <button
            type="button" onClick={onAddQuestion} disabled={questions.length >= 20}
            className="w-full font-mono text-[10px] text-brand-500 border border-dashed border-brand-500/40 py-2 hover:bg-brand-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            <Plus className="w-3 h-3" /> Adicionar Questão {questions.length >= 20 ? '(máximo: 20)' : ''}
          </button>

          {error && (
            <p className="font-mono text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-dark-border">
            <button onClick={onClose} className="font-mono text-xs text-zinc-400 px-5 py-2 border border-dark-border hover:border-zinc-500 transition-colors">
              Cancelar
            </button>
            <button
              onClick={onSave} disabled={saving}
              className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-6 py-2 hover:bg-brand-400 border border-brand-500 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : saveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── EditQuestionModal ────────────────────────────────────────────────────────

function EditQuestionModal({ question, onClose, onSaved }: {
  question: SkillQuestionFull
  onClose: () => void
  onSaved: (updated: SkillQuestionFull) => void
}) {
  const [text, setText] = useState(question.text)
  const [options, setOptions] = useState<[string, string, string, string]>([...question.options] as [string, string, string, string])
  const [correctIndex, setCorrectIndex] = useState(question.correctIndex)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!text.trim()) { setError('Enunciado obrigatório.'); return }
    if (options.some(o => !o.trim())) { setError('Todas as opções devem ser preenchidas.'); return }
    setSaving(true)
    setError('')
    try {
      await skillsApi.updateQuestion(question.id, {
        text: text.trim(),
        options: options.map(o => o.trim()),
        correctIndex,
      })
      onSaved({ ...question, text: text.trim(), options: options.map(o => o.trim()), correctIndex })
    } catch (err) {
      setError(extractApiError(err, 'Erro ao salvar questão.'))
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative bg-dark-card border border-dark-border w-full max-w-lg shadow-2xl z-10">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">Editar Questão</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-brand-500 uppercase tracking-wider block">Enunciado</label>
            <textarea
              maxLength={200} rows={3} value={text}
              onChange={e => setText(e.target.value)}
              className="w-full px-3 py-2 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] text-brand-500 uppercase tracking-wider block">Opções</label>
            <div className="grid grid-cols-2 gap-2">
              {options.map((opt, oi) => (
                <label key={oi} className={`flex items-center gap-2 border px-3 py-2 cursor-pointer transition-colors ${correctIndex === oi ? 'border-brand-500 bg-brand-500/10' : 'border-zinc-700 hover:border-zinc-500'}`}>
                  <input
                    type="radio" checked={correctIndex === oi}
                    onChange={() => setCorrectIndex(oi)}
                    className="accent-brand-500"
                  />
                  <input
                    type="text" maxLength={100} value={opt}
                    onChange={e => { const o = [...options] as typeof options; o[oi] = e.target.value; setOptions(o) }}
                    className="flex-1 bg-transparent text-xs font-mono text-white placeholder-zinc-600 focus:outline-none min-w-0"
                  />
                </label>
              ))}
            </div>
            <p className="font-mono text-[10px] text-zinc-600">Selecione o radio da opção correta.</p>
          </div>

          {error && <p className="font-mono text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2">{error}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t border-dark-border">
            <button onClick={onClose} className="font-mono text-xs text-zinc-400 px-5 py-2 border border-dark-border hover:border-zinc-500 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave} disabled={saving}
              className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-6 py-2 hover:bg-brand-400 border border-brand-500 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
