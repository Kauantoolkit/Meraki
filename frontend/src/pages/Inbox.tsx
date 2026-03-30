import { Mail, Send } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function Inbox() {
  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Inbox</h1>
          <p className="text-sm text-zinc-400 font-mono mt-2">Mensagens diretas entre empresa e especialista.</p>
        </div>

        <div className="bg-dark-card border border-dark-border flex" style={{ height: 'calc(100vh - 260px)' }}>
          {/* Conversations list */}
          <div className="w-64 border-r border-dark-border flex flex-col shrink-0">
            <div className="p-3 border-b border-dark-border">
              <p className="font-mono text-[10px] text-zinc-500 uppercase">Conversas</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <Mail className="w-8 h-8 text-zinc-700 mb-2" />
              <p className="font-mono text-[10px] text-zinc-600 text-center">Nenhuma conversa ativa.</p>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <Mail className="w-12 h-12 text-zinc-700 mb-4" />
              <p className="font-mono text-sm text-zinc-500">Selecione uma conversa para começar.</p>
            </div>
            <div className="p-3 border-t border-dark-border">
              <div className="flex gap-2">
                <input type="text" placeholder="Escrever mensagem..."
                  className="flex-1 px-3 py-2 bg-dark-input border border-dark-border text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand-500 rounded-none" />
                <button className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-4 py-2 border border-brand-500 hover:bg-brand-400 transition-colors flex items-center gap-1">
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
