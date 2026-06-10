import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronDown, ChevronUp, X, BookOpen } from 'lucide-react'
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

export default function GerenciarSkills() {
  const navigate = useNavigate()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const [addQuestionsSkillId, setAddQuestionsSkillId] = useState<string | null>(null)

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
                  onClick={() => setExpandedSkill(expandedSkill === skill.id ? null : skill.id)}
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
          onAdded={() => setAddQuestionsSkillId(null)}
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

  function addQuestion() {
    if (questions.length >= 10) return
    setQuestions(prev => [...prev, emptyQuestion()])
  }

  function removeQuestion(i: number) {
    if (questions.length <= 10) return
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
    if (questions.length < 10) { setError('Mínimo de 10 questões.'); return }
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
      const res = await skillsApi.create({ displayName: displayName.trim(), questions: dto })
      onCreated(res.data)
    } catch (err) {
      setError(extractApiError(err, 'Erro ao criar skill.'))
      setSaving(false)
    }
  }

  return <QuestionFormModal
    title="Criar Nova Skill"
    showNameField
    displayName={displayName}
    onDisplayNameChange={setDisplayName}
    questions={questions}
    onAddQuestion={addQuestion}
    onRemoveQuestion={removeQuestion}
    onUpdateQuestion={updateQuestion}
    onUpdateOption={updateOption}
    onSave={handleSave}
    onClose={onClose}
    saving={saving}
    error={error}
    saveLabel="Criar Skill"
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
    if (questions.length >= 10) return
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
}

function QuestionFormModal({
  title, showNameField, displayName, onDisplayNameChange,
  questions, onAddQuestion, onRemoveQuestion, onUpdateQuestion, onUpdateOption,
  onSave, onClose, saving, error, saveLabel,
}: QuestionFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
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
              <input
                type="text" maxLength={50} value={displayName} onChange={e => onDisplayNameChange?.(e.target.value)}
                placeholder="Ex: React, Spring Boot, Flutter..."
                className="w-full px-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
              />
            </div>
          )}

          <div className="space-y-4">
            <label className="font-mono text-[10px] text-brand-500 uppercase tracking-wider block">
              Questões ({questions.length}/10)
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
            type="button" onClick={onAddQuestion} disabled={questions.length >= 10}
            className="w-full font-mono text-[10px] text-brand-500 border border-dashed border-brand-500/40 py-2 hover:bg-brand-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            <Plus className="w-3 h-3" /> Adicionar Questão {questions.length >= 10 ? '(máximo atingido)' : ''}
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
