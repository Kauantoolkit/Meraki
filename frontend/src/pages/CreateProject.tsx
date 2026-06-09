import { useState, useEffect, useRef, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, Plus, Trash2, ArrowRight, ArrowLeft, Send, Terminal, AlertCircle, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import { projectsApi } from '../api/projects'
import { extractApiError } from '../api/client'
import { skillsApi, Skill, QuestionInput } from '../api/skills'

interface MilestoneInput { title: string; description: string; amount: string }

export default function CreateProject() {
  const navigate = useNavigate()
  const submittingRef = useRef(false)
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillCatalog, setSkillCatalog] = useState<Skill[]>([])
  const [createSkillOpen, setCreateSkillOpen] = useState(false)
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { title: '', description: '', amount: '' },
    { title: '', description: '', amount: '' },
  ])
  const [budget, setBudget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [logs, setLogs] = useState<{ text: string; color: string }[]>([])
  const [published, setPublished] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [stepError, setStepError] = useState('')

  const milestonesTotal = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0)

  useEffect(() => {
    if (step === 4 && milestonesTotal > 0) {
      setBudget(String(milestonesTotal))
    }
  }, [step])

  useEffect(() => {
    skillsApi.listAll().then(res => setSkillCatalog(res.data)).catch(() => {})
  }, [])

  function addSkill() {
    const v = skillInput.trim()
    if (!v) return
    if (!skills.includes(v)) setSkills([...skills, v])
    setSkillInput('')
  }

  function handleSkillCreated(newSkill: Skill) {
    setSkillCatalog(prev => [...prev, newSkill])
    if (!skills.includes(newSkill.displayName)) {
      setSkills(prev => [...prev, newSkill.displayName])
    }
    setCreateSkillOpen(false)
  }

  const skillInputLower = skillInput.trim().toLowerCase()
  const skillNotInCatalog = skillInputLower.length > 0 &&
    !skillCatalog.some(s => s.name === skillInputLower)

  function addMilestone() {
    setMilestones([...milestones, { title: '', description: '', amount: '' }])
  }

  function removeMilestone(i: number) {
    setMilestones(milestones.filter((_, idx) => idx !== i))
  }

  function updateMilestone(i: number, field: keyof MilestoneInput, value: string) {
    const updated = [...milestones]
    updated[i][field] = value
    setMilestones(updated)
  }

  function goToStep(n: number) {
    setStepError('')
    setStep(n)
  }

  function advanceToStep4() {
    const filled = milestones.filter(m => m.title.trim())
    if (filled.length === 0) {
      setStepError('Adicione pelo menos um milestone antes de avançar.')
      return
    }
    goToStep(4)
  }

  function advanceToMilestones() {
    if (skills.length === 0) {
      setStepError('Adicione pelo menos uma tecnologia ou requisito.')
      return
    }
    goToStep(3)
  }

  async function handlePublish(e: FormEvent) {
    e.preventDefault()
    if (submittingRef.current) return
    const budgetNum = Number(budget)
    if (budgetNum < milestonesTotal) {
      setStepError(`O orçamento (R$ ${budgetNum.toFixed(2)}) não pode ser menor que a soma das milestones (R$ ${milestonesTotal.toFixed(2)}).`)
      return
    }
    submittingRef.current = true
    setStepError('')
    setPublishing(true)
    setLogs([])

    const progressLogs = [
      { text: '> Validando dados do projeto...', color: 'text-zinc-400', delay: 200 },
      { text: '> Enviando projeto para o servidor...', color: 'text-zinc-400', delay: 600 },
    ]
    progressLogs.forEach(({ text, color, delay }) => {
      setTimeout(() => setLogs(prev => [...prev, { text, color }]), delay)
    })

    try {
      await projectsApi.create({
        title,
        description,
        budget: budgetNum,
        deadline,
        requirements: skills,
        milestones: milestones
          .filter(m => m.title.trim())
          .map(m => ({ title: m.title, description: m.description, amount: Number(m.amount) })),
      })
      setLogs(prev => [
        ...prev,
        { text: '> Milestones criados.', color: 'text-zinc-400' },
        { text: '> [201] Projeto publicado com sucesso.', color: 'text-brand-500' },
      ])
      setTimeout(() => setPublished(true), 600)
    } catch (err: unknown) {
      const status = (err as any)?.response?.status
      const msg = extractApiError(err)
      setLogs(prev => [...prev, { text: `> ERRO: ${msg}`, color: 'text-red-400' }])
      // Erros de validação (400/422): nada foi criado no backend, pode retentar
      // Erros de servidor/rede (5xx, timeout, sem status): pode ter criado — não libera retry
      if (status === 400 || status === 422) {
        setPublishError(msg)
        submittingRef.current = false
      } else {
        setPublishError(
          msg + '\n\nVerifique o painel antes de tentar novamente — o projeto pode ter sido criado.',
        )
        // submittingRef permanece true: botão fica bloqueado nesta instância da página
      }
    }
  }

  const stepConfig = [
    { n: 1, label: 'Configuração Base' },
    { n: 2, label: 'Tecnologias & Requisitos' },
    { n: 3, label: 'Milestones' },
    { n: 4, label: 'Orçamento & Prazo' },
  ]

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased flex flex-col">
      <Navbar backUrl="/dashboard" projectTitle="CRIAR_PROJETO" />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24">
            <h2 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-6 border-b border-dark-border pb-2">Etapas do Projeto</h2>
            <ul className="space-y-1 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-dark-border">
              {stepConfig.map(({ n, label }) => (
                <li key={n} className="relative flex items-center gap-4 p-2 cursor-pointer" onClick={() => goToStep(n)}>
                  <div className={`w-6 h-6 flex items-center justify-center relative z-10 transition-colors ${
                    n === step ? 'bg-brand-500 border border-brand-500 text-dark-bg' :
                    n < step ? 'bg-dark-card border border-brand-500 text-brand-500' :
                    'bg-dark-input border border-dark-border text-zinc-500'
                  }`}>
                    {n < step ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <span className="font-mono text-[10px] font-bold">{n}</span>
                    )}
                  </div>
                  <span className={`font-mono text-xs transition-colors ${n === step ? 'font-bold text-white' : n < step ? 'text-brand-500' : 'text-zinc-500'}`}>{label}</span>
                </li>
              ))}
            </ul>

            {step === 3 && milestonesTotal > 0 && (
              <div className="mt-8 bg-dark-input border border-brand-500/30 p-4">
                <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Total Milestones</p>
                <p className="font-mono text-sm font-bold text-brand-500">
                  R$ {milestonesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="font-mono text-[9px] text-zinc-600 mt-1">Este valor será sugerido como orçamento.</p>
              </div>
            )}

            {step === 4 && milestonesTotal > 0 && (
              <div className="mt-8 bg-dark-input border border-dark-border p-4">
                <div className="flex items-start gap-2 text-zinc-400">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-mono leading-relaxed">
                    O orçamento foi preenchido com a soma das milestones. Pode ajustar, mas não pode ser menor que <span className="text-brand-500">R$ {milestonesTotal.toFixed(2)}</span>.
                  </p>
                </div>
              </div>
            )}
          </aside>

          {/* Form */}
          <section className="flex-1 w-full bg-dark-card border border-dark-border p-6 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

            <form onSubmit={handlePublish}>
              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <div className="mb-6 border-b border-dark-border pb-4">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Configuração Base</h2>
                    <p className="font-mono text-xs text-zinc-500 mt-1">Defina o título e a descrição do projeto.</p>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">Título do Projeto</label>
                      <input type="text" required maxLength={120} data-testid="cp-title" value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="Ex: Desenvolvimento de API de Pagamentos"
                        className="w-full px-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-none" />
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">Descrição do Projeto</label>
                      <div className="absolute left-0 top-7 bottom-0 w-8 border-r border-dark-border bg-dark-input flex flex-col items-center py-2 select-none z-10 pointer-events-none">
                        {[1,2,3,4,5].map(n => <span key={n} className="text-[10px] font-mono text-zinc-700">{n}</span>)}
                      </div>
                      <textarea required maxLength={2000} data-testid="cp-description" value={description} onChange={e => setDescription(e.target.value)}
                        placeholder="Descreva o problema, o escopo e o resultado esperado..."
                        className="editor-textarea w-full pl-10 pr-4 py-2 bg-[#000] border border-dark-border text-sm font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-none h-48" />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button type="button" data-testid="cp-next-1" onClick={() => goToStep(2)}
                      className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-6 py-3 hover:bg-brand-400 border border-brand-500 transition-colors flex items-center gap-2">
                      PRÓXIMA ETAPA <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div>
                  <div className="mb-6 border-b border-dark-border pb-4">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Tecnologias & Requisitos Técnicos</h2>
                    <p className="font-mono text-xs text-zinc-500 mt-1">Defina as tecnologias e habilidades necessárias.</p>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">Adicionar Tecnologia / Habilidade</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          list="skills-catalog"
                          maxLength={80}
                          data-testid="cp-skill-input"
                          value={skillInput}
                          onChange={e => setSkillInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          placeholder="Buscar no catálogo ou digitar..."
                          className="flex-1 px-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
                        />
                        <datalist id="skills-catalog">
                          {skillCatalog.map(s => (
                            <option key={s.id} value={s.displayName} />
                          ))}
                        </datalist>
                        <button type="button" data-testid="cp-skill-add" onClick={addSkill}
                          className="bg-dark-input text-white font-mono text-xs px-6 py-3 border border-dark-border hover:border-brand-500 transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {skillNotInCatalog && (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-zinc-500">
                            "{skillInput.trim()}" não está no catálogo.
                          </span>
                          <button
                            type="button"
                            onClick={() => setCreateSkillOpen(true)}
                            className="font-mono text-[10px] text-brand-500 border border-brand-500/50 hover:border-brand-500 px-3 py-1 transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Criar skill + quiz
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="bg-[#000] border border-dark-border p-4 min-h-[120px]">
                      <p className="font-mono text-[10px] text-zinc-600 mb-3 uppercase tracking-widest border-b border-dark-border/50 pb-2">Requisitos Técnicos []</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map(s => (
                          <span key={s} onClick={() => setSkills(skills.filter(sk => sk !== s))}
                            className="group flex items-center gap-1 text-[10px] font-mono border border-zinc-700 bg-dark-input text-zinc-300 px-2 py-1 hover:border-red-500 transition-colors cursor-pointer">
                            {s} <span className="text-zinc-600 group-hover:text-red-500">×</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {stepError && (
                    <div className="flex items-center gap-2 text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2 mt-4 font-mono text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {stepError}
                    </div>
                  )}

                  <div className="mt-8 flex justify-between">
                    <button type="button" onClick={() => goToStep(1)} className="btn-sharp bg-dark-input text-zinc-400 font-bold font-mono text-xs px-6 py-3 border border-dark-border hover:border-zinc-500 transition-colors flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> VOLTAR
                    </button>
                    <button type="button" data-testid="cp-next-2" onClick={advanceToMilestones} className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-6 py-3 hover:bg-brand-400 border border-brand-500 transition-colors flex items-center gap-2">
                      PRÓXIMA ETAPA <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 — Milestones */}
              {step === 3 && (
                <div>
                  <div className="mb-6 border-b border-dark-border pb-4 flex justify-between items-end">
                    <div>
                      <h2 className="text-xl font-bold text-white uppercase tracking-tight">Milestones (Entregáveis)</h2>
                      <p className="font-mono text-xs text-zinc-500 mt-1">Divida o projeto em entregas lógicas e pagáveis.</p>
                    </div>
                    <button type="button" onClick={addMilestone}
                      className="bg-dark-input hover:bg-dark-hover text-brand-500 font-mono text-xs px-4 py-2 border border-brand-500/50 hover:border-brand-500 transition-colors flex items-center gap-2">
                      <Plus className="w-3 h-3" /> NOVO MILESTONE
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    {milestones.map((m, i) => (
                      <div key={i} className="bg-[#000] border border-dark-border p-4 relative group">
                        <button type="button" onClick={() => removeMilestone(i)}
                          className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-mono text-[10px] text-zinc-400 bg-dark-input px-2 py-0.5 border border-dark-border">M{i + 1}</span>
                          <input type="text" maxLength={80} data-testid={`cp-mtitle-${i}`} value={m.title} onChange={e => updateMilestone(i, 'title', e.target.value)}
                            placeholder="Nome do Entregável"
                            className="bg-transparent border-b border-dashed border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 w-2/3 pb-1" />
                          <div className="relative w-1/3">
                            <span className="absolute left-0 top-0 font-mono text-zinc-500 text-sm">R$</span>
                            <input type="number" min={0} data-testid={`cp-mamount-${i}`} value={m.amount} onChange={e => updateMilestone(i, 'amount', e.target.value)}
                              placeholder="0,00"
                              className="w-full pl-6 bg-transparent border-b border-dashed border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 pb-1" />
                          </div>
                        </div>
                        <textarea maxLength={500} value={m.description} onChange={e => updateMilestone(i, 'description', e.target.value)}
                          placeholder="O que será entregue nesta etapa?"
                          className="w-full bg-dark-input border border-dark-border p-2 text-xs font-mono text-zinc-400 focus:outline-none focus:border-brand-500 resize-none h-16" />
                      </div>
                    ))}
                  </div>

                  {milestonesTotal > 0 && (
                    <div className="flex justify-end mb-4">
                      <div className="bg-dark-input border border-brand-500/30 px-4 py-2 font-mono text-xs">
                        <span className="text-zinc-500 uppercase tracking-wider">Total: </span>
                        <span className="text-brand-500 font-bold">R$ {milestonesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}

                  {stepError && (
                    <div className="flex items-center gap-2 text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2 mb-4 font-mono text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {stepError}
                    </div>
                  )}

                  <div className="mt-4 flex justify-between">
                    <button type="button" onClick={() => goToStep(2)} className="btn-sharp bg-dark-input text-zinc-400 font-bold font-mono text-xs px-6 py-3 border border-dark-border hover:border-zinc-500 transition-colors flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> VOLTAR
                    </button>
                    <button type="button" data-testid="cp-next-3" onClick={advanceToStep4} className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-6 py-3 hover:bg-brand-400 border border-brand-500 transition-colors flex items-center gap-2">
                      PRÓXIMA ETAPA <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4 — Budget & Deadline */}
              {step === 4 && (
                <div>
                  <div className="mb-6 border-b border-dark-border pb-4">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Orçamento & Prazo</h2>
                    <p className="font-mono text-xs text-zinc-500 mt-1">Confirme o orçamento total e defina o prazo do projeto.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">Orçamento Total (BRL)</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="font-mono text-zinc-500 group-focus-within:text-brand-500">R$</span>
                        </div>
                        <input
                          type="number"
                          required
                          data-testid="cp-budget"
                          min={milestonesTotal > 0 ? milestonesTotal : 1}
                          step="0.01"
                          value={budget}
                          onChange={e => {
                            setBudget(e.target.value)
                            setStepError('')
                          }}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-none" />
                      </div>
                      {milestonesTotal > 0 && (
                        <p className="text-[9px] font-mono text-zinc-500">
                          Mínimo: <span className="text-brand-500">R$ {milestonesTotal.toFixed(2)}</span> (soma das milestones)
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">Prazo de Entrega</label>
                      <div className="relative group">
                        <input type="date" required data-testid="cp-deadline" value={deadline} onChange={e => setDeadline(e.target.value)}
                          className="w-full px-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-none" />
                      </div>
                    </div>
                  </div>

                  {stepError && (
                    <div className="flex items-center gap-2 text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2 mt-4 font-mono text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {stepError}
                    </div>
                  )}

                  <div className="mt-8 flex justify-between items-center border-t border-dark-border pt-6">
                    <button type="button" onClick={() => goToStep(3)} className="btn-sharp bg-dark-input text-zinc-400 font-bold font-mono text-xs px-6 py-3 border border-dark-border hover:border-zinc-500 transition-colors flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> VOLTAR
                    </button>
                    <button type="submit" data-testid="cp-publish"
                      className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-sm px-8 py-4 hover:bg-brand-400 border border-brand-500 transition-colors flex items-center gap-2 shadow-[4px_4px_0px_rgba(85,202,124,0.3)]">
                      <Send className="w-5 h-5" /> PUBLICAR_PROJETO()
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Terminal Overlay */}
            {publishing && (
              <div className={`absolute inset-0 bg-dark-bg/95 backdrop-blur-sm z-50 flex flex-col p-8 border ${publishError ? 'border-red-500' : 'border-brand-500'}`}>
                <div className="flex items-center gap-2 mb-6 border-b border-dark-border pb-4">
                  <Terminal className={`w-5 h-5 ${publishError ? 'text-red-400' : 'text-brand-500'}`} />
                  <span className="font-mono text-sm font-bold text-white uppercase tracking-widest">PUBLICANDO PROJETO</span>
                </div>
                <div className="font-mono text-xs leading-relaxed space-y-2 flex-1 overflow-y-auto terminal-scroll">
                  {logs.map((log, i) => (
                    <p key={i} className={log.color}>{log.text}</p>
                  ))}
                  {!published && !publishError && logs.length > 0 && (
                    <span className="inline-flex items-center text-brand-500">
                      <span className="w-1.5 h-2.5 bg-brand-500 animate-pulse ml-1" />
                    </span>
                  )}
                </div>
                {publishError && (
                  <div className="mt-6 pt-6 border-t border-red-500/30">
                    <div className="flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 mb-4 font-mono text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span data-testid="cp-error" className="whitespace-pre-line">{publishError}</span>
                    </div>
                    {!submittingRef.current ? (
                      <button onClick={() => { setPublishing(false); setPublishError('') }}
                        className="btn-sharp bg-transparent text-white font-mono text-xs px-6 py-2 border border-dark-border hover:border-red-500 hover:text-red-400 transition-colors">
                        &lt; Corrigir e tentar novamente
                      </button>
                    ) : (
                      <button onClick={() => navigate('/dashboard')}
                        className="btn-sharp bg-transparent text-white font-mono text-xs px-6 py-2 border border-dark-border hover:border-brand-500 hover:text-brand-500 transition-colors">
                        &lt; Verificar no painel
                      </button>
                    )}
                  </div>
                )}
                {published && (
                  <div className="mt-6 pt-6 border-t border-dark-border">
                    <p data-testid="cp-published" className="font-mono text-brand-500 font-bold mb-4">&gt; Projeto publicado. A receber propostas de especialistas.</p>
                    <button onClick={() => navigate('/dashboard')}
                      className="btn-sharp bg-transparent text-white font-mono text-xs px-6 py-2 border border-dark-border hover:border-brand-500 hover:text-brand-500 transition-colors">
                      &lt; Voltar ao Painel
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {createSkillOpen && (
        <CreateSkillModal
          initialName={skillInput.trim()}
          onClose={() => setCreateSkillOpen(false)}
          onCreated={handleSkillCreated}
        />
      )}
    </div>
  )
}

// ─── CreateSkillModal ─────────────────────────────────────────────────────────

interface CreateSkillModalProps {
  initialName: string
  onClose: () => void
  onCreated: (skill: Skill) => void
}

function emptyQuestion(): QuestionInput & { id: number } {
  return { id: Date.now() + Math.random(), text: '', options: ['', '', '', ''], correctIndex: 0 }
}

function CreateSkillModal({ initialName, onClose, onCreated }: CreateSkillModalProps) {
  const [displayName, setDisplayName] = useState(initialName)
  const [questions, setQuestions] = useState([emptyQuestion(), emptyQuestion(), emptyQuestion()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function addQuestion() {
    setQuestions(prev => [...prev, emptyQuestion()])
  }

  function removeQuestion(idx: number) {
    if (questions.length <= 3) return
    setQuestions(prev => prev.filter((_, i) => i !== idx))
  }

  function updateQuestion(idx: number, field: 'text' | 'correctIndex', value: string | number) {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q))
  }

  function updateOption(qIdx: number, oIdx: number, value: string) {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q
      const options = [...q.options]
      options[oIdx] = value
      return { ...q, options }
    }))
  }

  async function handleSave() {
    setError('')
    if (!displayName.trim()) { setError('Nome da skill é obrigatório.'); return }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text.trim()) { setError(`Questão ${i + 1}: texto obrigatório.`); return }
      if (q.options.some(o => !o.trim())) { setError(`Questão ${i + 1}: todas as 4 opções devem ser preenchidas.`); return }
    }
    setSaving(true)
    try {
      const res = await skillsApi.createSkill({
        displayName: displayName.trim(),
        questions: questions.map(({ text, options, correctIndex }) => ({ text, options, correctIndex })),
      })
      onCreated(res.data.skill)
    } catch (err: unknown) {
      setError(extractApiError(err, 'Erro ao criar skill.'))
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-dark-card border border-dark-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl z-10">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

        <div className="sticky top-0 bg-dark-card border-b border-dark-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">Criar Nova Skill + Quiz</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-brand-500 uppercase tracking-wider block">Nome da Skill</label>
            <input
              type="text"
              maxLength={60}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Ex: React, NestJS, Docker..."
              className="w-full px-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] text-brand-500 uppercase tracking-wider">Questões do Quiz (mínimo 3)</label>
              <button type="button" onClick={addQuestion}
                className="font-mono text-[10px] text-brand-500 border border-brand-500/50 hover:border-brand-500 px-3 py-1 transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> Adicionar Questão
              </button>
            </div>

            {questions.map((q, qi) => (
              <div key={q.id} className="bg-[#000] border border-dark-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-zinc-500 border border-dark-border px-2 py-0.5">Q{qi + 1}</span>
                  {questions.length > 3 && (
                    <button type="button" onClick={() => removeQuestion(qi)}
                      className="text-zinc-600 hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={300}
                  value={q.text}
                  onChange={e => updateQuestion(qi, 'text', e.target.value)}
                  placeholder="Texto da questão..."
                  className="w-full px-3 py-2 bg-dark-input border border-dark-border text-xs font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={q.correctIndex === oi}
                        onChange={() => updateQuestion(qi, 'correctIndex', oi)}
                        className="accent-brand-500 shrink-0"
                        title="Marcar como correta"
                      />
                      <input
                        type="text"
                        maxLength={200}
                        value={opt}
                        onChange={e => updateOption(qi, oi, e.target.value)}
                        placeholder={`Opção ${oi + 1}${q.correctIndex === oi ? ' (correta)' : ''}`}
                        className="flex-1 px-3 py-1.5 bg-dark-input border border-dark-border text-xs font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
                      />
                    </div>
                  ))}
                </div>
                <p className="font-mono text-[9px] text-zinc-600">Selecione o radio ao lado da opção correta.</p>
              </div>
            ))}
          </div>

          {error && (
            <p className="font-mono text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2">{error}</p>
          )}
        </div>

        <div className="sticky bottom-0 bg-dark-card border-t border-dark-border px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose}
            className="font-mono text-xs text-zinc-400 border border-dark-border px-4 py-2 hover:border-zinc-500 transition-colors uppercase">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="btn-sharp bg-brand-500 text-dark-bg font-mono font-bold text-xs px-6 py-2 border border-brand-500 hover:bg-brand-400 transition-colors uppercase disabled:opacity-60 flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" />
            {saving ? 'Criando...' : 'Criar Skill'}
          </button>
        </div>
      </div>
    </div>
  )
}
