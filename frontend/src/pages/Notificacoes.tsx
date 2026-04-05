import { useState } from 'react'
import { CheckCircle, Wallet, FileText, Trash2 } from 'lucide-react'
import Navbar from '../components/Navbar'

type EventType = 'bid' | 'payment' | 'project' | 'system'

interface SysEvent {
  id: number
  type: EventType
  title: string
  desc: string
  time: string
  read: boolean
}

const MOCK_EVENTS: SysEvent[] = [
  {
    id: 1, type: 'bid', read: false,
    title: 'A sua proposta para [PRJ-8C3X] foi aceite!',
    desc: 'A TechCorp aceitou o seu Bid. O valor de R$8.000 foi movido para o Escrow.',
    time: 'Há 2 horas',
  },
  {
    id: 2, type: 'payment', read: false,
    title: 'Pagamento Libertado (M1)',
    desc: 'O cliente validou a sua entrega e libertou R$2.500 no seu Wallet. O saldo actualizará em 10 minutos.',
    time: 'Antes de 2h:30',
  },
  {
    id: 3, type: 'project', read: true,
    title: 'Novo Projeto Publicado (Recomendação)',
    desc: 'Um projeto à procura da stack NestJS+PostgreSQL foi publicado. Veja se é o fit ideal.',
    time: 'Semana passada',
  },
]

const TYPE_META: Record<EventType, { icon: React.ElementType; color: string; border: string; bg: string }> = {
  bid:     { icon: CheckCircle, color: 'text-brand-500',  border: 'border-brand-500/40',  bg: 'bg-brand-500/5' },
  payment: { icon: Wallet,      color: 'text-blue-400',   border: 'border-blue-500/40',   bg: 'bg-blue-500/5' },
  project: { icon: FileText,    color: 'text-zinc-400',   border: 'border-dark-border',   bg: '' },
  system:  { icon: FileText,    color: 'text-zinc-400',   border: 'border-dark-border',   bg: '' },
}

export default function Notificacoes() {
  const [events, setEvents] = useState<SysEvent[]>(MOCK_EVENTS)

  function markRead(id: number) {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, read: true } : e))
  }

  function purgeAll() {
    setEvents([])
  }

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-brand-500 animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-brand-500 uppercase">
                MERAKI // SYS_EVENTS
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Eventos do Sistema</h1>
            <p className="text-sm text-zinc-400 font-mono mt-2">Log de notificações, alertas e pagamentos.</p>
          </div>
          <button
            onClick={purgeAll}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-dark-input border border-dark-border hover:border-red-500/50 hover:text-red-400 text-zinc-400 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> PURGE_ALL
          </button>
        </div>

        {events.length === 0 ? (
          <div className="border border-dashed border-zinc-700 py-16 text-center font-mono text-zinc-600 text-sm">
            &gt; Nenhum evento no sistema. Queue limpa.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(ev => {
              const meta = TYPE_META[ev.type]
              const Icon = meta.icon
              return (
                <div
                  key={ev.id}
                  className={`border ${meta.border} ${meta.bg} p-5 flex gap-4 transition-colors ${ev.read ? 'opacity-60' : ''}`}
                >
                  <div className={`shrink-0 mt-0.5 ${meta.color}`}>
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className={`font-mono text-xs font-bold ${ev.read ? 'text-zinc-400' : 'text-white'}`}>
                        {ev.title}
                      </p>
                      <span className="font-mono text-[10px] text-zinc-600 shrink-0">{ev.time}</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{ev.desc}</p>
                    {!ev.read && (
                      <button
                        onClick={() => markRead(ev.id)}
                        className={`mt-3 font-mono text-[10px] font-bold ${meta.color} hover:underline uppercase tracking-wider`}
                      >
                        Marcar como lido
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
