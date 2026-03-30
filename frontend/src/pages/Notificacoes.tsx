import { Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import Navbar from '../components/Navbar'

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'success', title: 'Pagamento Liberado!', desc: 'R$ 3.500 foram adicionados à sua carteira após aprovação do Milestone 1.', time: 'Há 2h' },
  { id: 2, type: 'warning', title: 'Milestone Próximo do Prazo', desc: 'O Milestone 2 vence em 2 dias. Submeta a entrega para evitar penalizações.', time: 'Há 5h' },
  { id: 3, type: 'info', title: 'Nova Proposta Recebida', desc: 'Você recebeu uma nova proposta para o projeto PRJ-8C3X.', time: 'Há 1 dia' },
  { id: 4, type: 'success', title: 'Proposta Aceite', desc: 'Sua proposta para o projeto "App Mobile de Logística" foi aceite!', time: 'Há 3 dias' },
]

export default function Notificacoes() {
  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Notificações</h1>
            <p className="text-sm text-zinc-400 font-mono mt-2">Alertas do sistema e atualizações em tempo real.</p>
          </div>
          <Bell className="w-6 h-6 text-brand-500" />
        </div>

        <div className="space-y-3">
          {MOCK_NOTIFICATIONS.map(n => (
            <div key={n.id} className="bg-dark-card border border-dark-border p-4 hover:border-zinc-600 transition-colors flex gap-4">
              <div className={`shrink-0 mt-0.5 ${n.type === 'success' ? 'text-brand-500' : n.type === 'warning' ? 'text-orange-400' : 'text-blue-400'}`}>
                {n.type === 'success' ? <CheckCircle className="w-5 h-5" /> : n.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-mono text-xs font-bold text-white">{n.title}</p>
                  <span className="font-mono text-[10px] text-zinc-600 shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{n.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
