import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'
import {
  TerminalSquare, Building2, User, Layers, Map, Inbox,
  Wallet, TrendingUp, Briefcase, FileCode, Bell, Settings,
  ShieldAlert, ChevronRight, LogIn,
} from 'lucide-react'

const FEATURES = [
  { icon: Building2,   label: 'Dashboard Empresa',     desc: 'Gerencie projetos, licitações e equipes.' },
  { icon: User,        label: 'Dashboard Especialista', desc: 'Terminal de trabalho e oportunidades.' },
  { icon: Layers,      label: 'Kanban',                 desc: 'Acompanhe milestones em tempo real.' },
  { icon: Briefcase,   label: 'Explorar Talentos',      desc: 'Diretório de especialistas verificados.' },
  { icon: FileCode,    label: 'Bidding',                desc: 'Sistema de propostas com licitação.' },
  { icon: Map,         label: 'Escrow Terminal',        desc: 'Pagamentos garantidos por milestone.' },
  { icon: Inbox,       label: 'Inbox',                  desc: 'Comunicação segura entre partes.' },
  { icon: Wallet,      label: 'Financeiro',             desc: 'Gestão de fundo de garantia.' },
  { icon: TrendingUp,  label: 'Ganhos',                 desc: 'Extrato e saque de recebimentos.' },
  { icon: Bell,        label: 'Eventos',                desc: 'Log de notificações do sistema.' },
  { icon: Settings,    label: 'Settings',               desc: 'Configurações e segurança da conta.' },
  { icon: ShieldAlert, label: 'Admin',                  desc: 'Painel de administração da plataforma.' },
]

export default function LandingPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && user) navigate('/dashboard', { replace: true })
  }, [user, isLoading, navigate])

  if (isLoading) return null

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased overflow-x-hidden">
      <div className="scanline" />

      {/* Glow */}
      <div className="fixed top-[15%] left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-brand-500/5 rounded-full filter blur-[160px] pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500/10 border border-brand-500 flex items-center justify-center">
              <TerminalSquare className="text-brand-500 w-4 h-4" strokeWidth={2} />
            </div>
            <span className="font-mono font-bold text-white tracking-widest uppercase">Meraki</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 bg-dark-input border border-dark-border hover:border-brand-500 hover:text-brand-500 text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" /> Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 border border-brand-500 text-dark-bg hover:bg-brand-400 text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-[4px_4px_0px_rgba(85,202,124,0.15)]"
            >
              Registar <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* FORA DO ESCOPO INICIAL */}
      <div className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-amber-400 animate-pulse shrink-0" />
          <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest font-bold">
            FORA DO ESCOPO INICIAL — Esta tela não está prevista nos requisitos funcionais (RF01–RF14) do Meraki v1.0
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-brand-500 animate-pulse" />
          <span className="font-mono text-[10px] text-brand-500 uppercase tracking-widest">
            v1.0.0 // Plataforma de talentos &amp; projetos
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white uppercase tracking-tight leading-none mb-6">
          TECH FREELANCE{' '}
          <span className="text-brand-500">MARKETPLACE</span>
        </h1>
        <p className="text-zinc-400 font-mono text-sm max-w-xl leading-relaxed mb-10">
          Plataforma segura para conectar empresas e especialistas técnicos. Escrow inteligente,
          milestone rastreáveis e pagamentos garantidos.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="inline-flex items-center gap-2 bg-brand-500 text-dark-bg font-bold uppercase tracking-widest text-sm px-8 py-4 hover:bg-brand-400 border border-brand-500 transition-colors shadow-[4px_4px_0px_rgba(85,202,124,0.2)]"
        >
          INICIAR JORNADA <ChevronRight className="w-4 h-4" />
        </button>

        {/* Stats row */}
        <div className="flex flex-wrap gap-8 mt-12 border-t border-dark-border pt-8">
          {[
            { val: '100%', label: 'Escrow Garantido' },
            { val: 'JWT', label: 'Auth Seguro' },
            { val: 'OPEN', label: 'Sistema de Licitação' },
            { val: 'DDD', label: 'Arquitetura Robusta' },
          ].map(s => (
            <div key={s.label}>
              <p className="font-mono font-bold text-brand-500 text-lg">{s.val}</p>
              <p className="font-mono text-[10px] text-zinc-500 uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-px bg-brand-500 flex-shrink-0" />
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Módulos da Plataforma</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-dark-card border border-dark-border p-4 hover:border-brand-500/50 transition-colors cursor-default group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Icon className="w-5 h-5 text-brand-500 mb-3 opacity-80" strokeWidth={1.5} />
              <p className="font-mono text-xs font-bold text-white uppercase tracking-wide mb-1">{label}</p>
              <p className="font-mono text-[10px] text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">Pronto para começar?</p>
            <p className="text-white font-bold">Crie a sua conta gratuitamente e explore a plataforma.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 border border-dark-border hover:border-zinc-500 text-zinc-300 hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Já tenho conta
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-3 bg-brand-500 border border-brand-500 text-dark-bg hover:bg-brand-400 font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-[4px_4px_0px_rgba(85,202,124,0.2)]"
            >
              SOLICITAR REGISTRO <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border py-4 text-center">
        <p className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
          © 2026 Meraki Platform — Freelance Marketplace
        </p>
      </footer>
    </div>
  )
}
