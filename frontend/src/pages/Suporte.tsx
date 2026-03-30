import { Headphones, MessageSquare, ExternalLink } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function Suporte() {
  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <Headphones className="w-6 h-6 text-brand-500" /> Suporte Técnico
          </h1>
          <p className="text-sm text-zinc-400 font-mono mt-2">Central de ajuda e resolução de problemas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-dark-card border border-dark-border p-6 hover:border-brand-500/50 transition-colors cursor-pointer group">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageSquare className="w-8 h-8 text-brand-500 mb-3" />
            <h3 className="font-mono font-bold text-white uppercase mb-2">Chat ao Vivo</h3>
            <p className="text-xs text-zinc-400">Fale com um agente de suporte em tempo real.</p>
          </div>
          <div className="bg-dark-card border border-dark-border p-6 hover:border-brand-500/50 transition-colors cursor-pointer group">
            <ExternalLink className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-mono font-bold text-white uppercase mb-2">Documentação</h3>
            <p className="text-xs text-zinc-400">Consulte a documentação da plataforma e tutoriais.</p>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border p-6">
          <h2 className="font-mono text-sm font-bold text-white uppercase mb-4">Abrir Ticket</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Assunto</label>
              <input type="text" placeholder="Descreva brevemente o problema"
                className="w-full px-4 py-3 bg-dark-input border border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 rounded-none placeholder-zinc-700" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Descrição</label>
              <textarea rows={5} placeholder="Detalhe o problema encontrado..."
                className="w-full px-4 py-3 bg-dark-input border border-dark-border text-sm font-mono text-zinc-300 focus:outline-none focus:border-brand-500 rounded-none placeholder-zinc-700 resize-none" />
            </div>
            <button className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-6 py-3 hover:bg-brand-400 border border-brand-500 transition-colors">
              ENVIAR_TICKET()
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
