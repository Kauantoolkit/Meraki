import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, Plus, Trash2, ArrowRight, ArrowLeft, Rocket, Terminal } from 'lucide-react'
import Navbar from '../components/Navbar'
import { projectsApi } from '../api/projects'

interface MilestoneInput { title: string; description: string; amount: string }

export default function CreateProject() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>(['NestJS', 'Microservices'])
  const [budget, setBudget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { title: '', description: '', amount: '' },
    { title: '', description: '', amount: '' },
  ])
  const [deploying, setDeploying] = useState(false)
  const [logs, setLogs] = useState<{ text: string; color: string }[]>([])
  const [deployed, setDeployed] = useState(false)

  function addSkill() {
    const v = skillInput.trim()
    if (v && !skills.includes(v)) setSkills([...skills, v])
    setSkillInput('')
  }

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

  async function handleDeploy(e: FormEvent) {
    e.preventDefault()
    setDeploying(true)
    setLogs([])

    const logLines = [
      { text: '> Iniciar ligação via API Gateway...', color: 'text-zinc-400', delay: 500 },
      { text: '> Autenticar utilizador (Identity Service) -> [OK]', color: 'text-zinc-400', delay: 900 },
      { text: '> Validar Payload (RN01: Requisitos presentes) -> [OK]', color: 'text-zinc-400', delay: 1300 },
      { text: '> Validar Payload (RN04: Milestones definidos) -> [OK]', color: 'text-zinc-400', delay: 1700 },
      { text: '> Invocar POST /api/projects', color: 'text-brand-500', delay: 2100 },
      { text: '> Project Service: A gerar Project Aggregate Root...', color: 'text-zinc-400', delay: 2600 },
      { text: '> Project Service: A guardar na base de dados PostgreSQL...', color: 'text-zinc-400', delay: 3100 },
      { text: '> RabbitMQ: Publicar evento "project.created"', color: 'text-blue-400', delay: 3600 },
      { text: '> Bidding Service: Evento recebido. A preparar listening de Bids.', color: 'text-orange-400', delay: 4100 },
    ]

    logLines.forEach(({ text, color, delay }) => {
      setTimeout(() => setLogs(prev => [...prev, { text, color }]), delay)
    })

    try {
      await projectsApi.create({
        title,
        description,
        budget: Number(budget),
        deadline,
        skills,
        milestones: milestones
          .filter(m => m.title)
          .map(m => ({ title: m.title, description: m.description, amount: Number(m.amount) })),
      })
      setTimeout(() => setDeployed(true), 4600)
    } catch {
      setTimeout(() => {
        setLogs(prev => [...prev, { text: '> ERRO: Falha ao criar projeto. Verifique os dados.', color: 'text-red-400' }])
        setDeploying(false)
      }, 4600)
    }
  }

  const stepConfig = [
    { n: 1, label: 'Configuração Base' },
    { n: 2, label: 'Stack & Requisitos' },
    { n: 3, label: 'Orçamento & Prazos' },
    { n: 4, label: 'Milestones (RN04)' },
  ]

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased flex flex-col">
      <Navbar backUrl="/dashboard" projectTitle="SYS.PROJECT // DEPLOY_WIZARD" />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24">
            <h2 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-6 border-b border-dark-border pb-2">Sequência de Deploy</h2>
            <ul className="space-y-1 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-dark-border">
              {stepConfig.map(({ n, label }) => (
                <li key={n} className="relative flex items-center gap-4 p-2 cursor-pointer" onClick={() => setStep(n)}>
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

            <div className="mt-8 bg-dark-input border border-dark-border p-4">
              <div className="flex items-start gap-2 text-zinc-400">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono leading-relaxed">
                  O projeto entrará no estado <span className="text-brand-500">OPEN</span> imediatamente após o deploy.
                </p>
              </div>
            </div>
          </aside>

          {/* Form */}
          <section className="flex-1 w-full bg-dark-card border border-dark-border p-6 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

            <form onSubmit={handleDeploy}>
              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <div className="mb-6 border-b border-dark-border pb-4">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Configuração Base</h2>
                    <p className="font-mono text-xs text-zinc-500 mt-1">Defina os metadados principais do projeto.</p>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">Título do Projeto</label>
                      <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="Ex: Refatoração de API Gateway para NestJS"
                        className="w-full px-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-none" />
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">Descrição Técnica</label>
                      <div className="absolute left-0 top-7 bottom-0 w-8 border-r border-dark-border bg-dark-input flex flex-col items-center py-2 select-none z-10 pointer-events-none">
                        {[1,2,3,4,5].map(n => <span key={n} className="text-[10px] font-mono text-zinc-700">{n}</span>)}
                      </div>
                      <textarea required value={description} onChange={e => setDescription(e.target.value)}
                        placeholder="Detalhe o problema, a arquitetura atual e o resultado esperado..."
                        className="editor-textarea w-full pl-10 pr-4 py-2 bg-[#000] border border-dark-border text-sm font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-none h-48" />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button type="button" onClick={() => setStep(2)}
                      className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-6 py-3 hover:bg-brand-400 border border-brand-500 transition-colors flex items-center gap-2">
                      AVANÇAR_PASSO() <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div>
                  <div className="mb-6 border-b border-dark-border pb-4">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Stack & Requisitos Técnicos</h2>
                    <p className="font-mono text-xs text-zinc-500 mt-1">Conforme RN01, o projeto deve ter pelo menos um requisito.</p>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">Adicionar Tecnologia</label>
                      <div className="flex gap-2">
                        <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          placeholder="Ex: NestJS, RabbitMQ, Flutter..."
                          className="flex-1 px-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none" />
                        <button type="button" onClick={addSkill}
                          className="bg-dark-input text-white font-mono text-xs px-6 py-3 border border-dark-border hover:border-brand-500 transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-[#000] border border-dark-border p-4 min-h-[120px]">
                      <p className="font-mono text-[10px] text-zinc-600 mb-3 uppercase tracking-widest border-b border-dark-border/50 pb-2">Array de Requisitos []</p>
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
                  <div className="mt-8 flex justify-between">
                    <button type="button" onClick={() => setStep(1)} className="btn-sharp bg-dark-input text-zinc-400 font-bold font-mono text-xs px-6 py-3 border border-dark-border hover:border-zinc-500 transition-colors flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> VOLTAR
                    </button>
                    <button type="button" onClick={() => setStep(3)} className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-6 py-3 hover:bg-brand-400 border border-brand-500 transition-colors flex items-center gap-2">
                      AVANÇAR_PASSO() <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div>
                  <div className="mb-6 border-b border-dark-border pb-4">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Financiamento e Prazos</h2>
                    <p className="font-mono text-xs text-zinc-500 mt-1">Defina o limite orçamental (Escrow) e o prazo limite.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">Orçamento Máximo (BRL)</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="font-mono text-zinc-500 group-focus-within:text-brand-500">R$</span>
                        </div>
                        <input type="number" required min={1} value={budget} onChange={e => setBudget(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-none" />
                      </div>
                      <p className="text-[9px] font-mono text-zinc-500 text-right">Este valor será retido no Payment Service.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider block">Deadline do Projeto</label>
                      <div className="relative group">
                        <input type="date" required value={deadline} onChange={e => setDeadline(e.target.value)}
                          className="w-full px-4 py-3 bg-[#000] border border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-none" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between">
                    <button type="button" onClick={() => setStep(2)} className="btn-sharp bg-dark-input text-zinc-400 font-bold font-mono text-xs px-6 py-3 border border-dark-border hover:border-zinc-500 transition-colors flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> VOLTAR
                    </button>
                    <button type="button" onClick={() => setStep(4)} className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-6 py-3 hover:bg-brand-400 border border-brand-500 transition-colors flex items-center gap-2">
                      AVANÇAR_PASSO() <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <div>
                  <div className="mb-6 border-b border-dark-border pb-4 flex justify-between items-end">
                    <div>
                      <h2 className="text-xl font-bold text-white uppercase tracking-tight">Milestones (Entregáveis)</h2>
                      <p className="font-mono text-xs text-zinc-500 mt-1">RN04: Divida o projeto em entregas lógicas e pagáveis.</p>
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
                          <input type="text" value={m.title} onChange={e => updateMilestone(i, 'title', e.target.value)}
                            placeholder="Nome do Entregável"
                            className="bg-transparent border-b border-dashed border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 w-2/3 pb-1" />
                          <input type="number" value={m.amount} onChange={e => updateMilestone(i, 'amount', e.target.value)}
                            placeholder="Valor (R$)"
                            className="w-1/3 bg-transparent border-b border-dashed border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 pb-1" />
                        </div>
                        <textarea value={m.description} onChange={e => updateMilestone(i, 'description', e.target.value)}
                          placeholder="O que se espera desta entrega?"
                          className="w-full bg-dark-input border border-dark-border p-2 text-xs font-mono text-zinc-400 focus:outline-none focus:border-brand-500 resize-none h-16" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-between items-center border-t border-dark-border pt-6">
                    <button type="button" onClick={() => setStep(3)} className="btn-sharp bg-dark-input text-zinc-400 font-bold font-mono text-xs px-6 py-3 border border-dark-border hover:border-zinc-500 transition-colors flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> VOLTAR
                    </button>
                    <button type="submit"
                      className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-sm px-8 py-4 hover:bg-brand-400 border border-brand-500 transition-colors flex items-center gap-2 shadow-[4px_4px_0px_rgba(85,202,124,0.3)]">
                      <Rocket className="w-5 h-5" /> EXECUTAR_DEPLOY()
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Terminal Overlay */}
            {deploying && (
              <div className="absolute inset-0 bg-dark-bg/95 backdrop-blur-sm z-50 flex flex-col p-8 border border-brand-500">
                <div className="flex items-center gap-2 mb-6 border-b border-dark-border pb-4">
                  <Terminal className="w-5 h-5 text-brand-500" />
                  <span className="font-mono text-sm font-bold text-white uppercase tracking-widest">DEPLOY_SEQUENCE</span>
                </div>
                <div className="font-mono text-xs leading-relaxed space-y-2 flex-1 overflow-y-auto terminal-scroll">
                  {logs.map((log, i) => (
                    <p key={i} className={log.color}>{log.text}</p>
                  ))}
                </div>
                {deployed && (
                  <div className="mt-6 pt-6 border-t border-dark-border">
                    <p className="font-mono text-brand-500 font-bold mb-4">&gt; [201 CREATED] PROJETO PUBLICADO COM SUCESSO.</p>
                    <button onClick={() => navigate('/dashboard')}
                      className="btn-sharp bg-transparent text-white font-mono text-xs px-6 py-2 border border-dark-border hover:border-brand-500 hover:text-brand-500 transition-colors">
                      &lt; Retornar ao Workspace
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
