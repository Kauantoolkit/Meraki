import { useState } from 'react'
import { Search, Send, Paperclip, MoreVertical, Image as ImageIcon } from 'lucide-react'
import Navbar from '../components/Navbar'

interface Contact {
  id: string
  name: string
  lastMessage: string
  time: string
  online: boolean
  unread: number
  isSystem?: boolean
}

interface Message {
  id: string
  from: 'me' | 'other'
  text: string
  time: string
}

const CONTACTS: Contact[] = [
  { id: '1', name: 'TechCorp Inc.', lastMessage: 'Pode explicar um pouco melhor a arqui...', time: 'Agora', online: true, unread: 0 },
  { id: '2', name: 'Meraki System', lastMessage: 'O projeto PRJ-J671 foi atualizado...', time: '1 dia', online: false, unread: 1, isSystem: true },
]

const INITIAL_MESSAGES: Message[] = [
  { id: '1', from: 'other', text: 'Olá! Analisámos a sua proposta para o desenvolvimento em NestJS.', time: '14:20' },
  { id: '2', from: 'other', text: 'Gostaríamos de saber um pouco mais sobre a sua abordagem à arquitetura da Database. Tencionamos usar Prisma para agilizar o ORM.', time: '14:22' },
  { id: '3', from: 'me', text: 'Sem dúvida. O Prisma é uma excelente escolha, especialmente pela geração de tipos estáticos (Type-safe). Proponho usar PostgreSQL para lidarmos com as relações de forma robusta e otimizada.', time: '14:31' },
]

export default function Inbox() {
  const [activeContact, setActiveContact] = useState<Contact>(CONTACTS[0])
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [contactSearch, setContactSearch] = useState('')

  function sendMessage() {
    if (!input.trim()) return
    setMessages(prev => [...prev, {
      id: String(Date.now()),
      from: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }])
    setInput('')
  }

  const filtered = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase())
  )

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased flex flex-col">
      <div className="scanline" />
      <Navbar projectTitle="MERAKI // SECURE_INBOX" />

      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

        {/* Contacts sidebar */}
        <aside className="w-64 border-r border-dark-border flex flex-col shrink-0">
          <div className="p-3 border-b border-dark-border">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-3.5 h-3.5 text-zinc-600" />
              </div>
              <input
                type="text"
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
                placeholder="Procurar contacto..."
                className="w-full pl-9 pr-3 py-2 bg-dark-input border border-dark-border text-[10px] font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveContact(c)}
                className={`w-full flex items-center gap-3 px-3 py-3 border-b border-dark-border transition-colors text-left ${
                  activeContact.id === c.id ? 'bg-brand-500/5 border-l-2 border-l-brand-500' : 'hover:bg-dark-hover'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-8 h-8 bg-dark-input border border-dark-border flex items-center justify-center">
                    {c.isSystem
                      ? <span className="font-mono text-[9px] text-brand-500 font-bold">SYS</span>
                      : <span className="font-mono text-[10px] text-zinc-400 font-bold">{c.name.slice(0, 2).toUpperCase()}</span>
                    }
                  </div>
                  {c.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-brand-500 border border-dark-bg rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] font-bold text-white truncate">{c.name}</p>
                    <span className="font-mono text-[9px] text-zinc-600 shrink-0 ml-1">{c.time}</span>
                  </div>
                  <p className="font-mono text-[9px] text-zinc-500 truncate mt-0.5">{c.lastMessage}</p>
                </div>
                {c.unread > 0 && (
                  <div className="w-4 h-4 bg-brand-500 flex items-center justify-center shrink-0">
                    <span className="font-mono text-[8px] text-dark-bg font-bold">{c.unread}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="px-5 py-3 border-b border-dark-border bg-dark-card flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-mono text-sm font-bold text-white">{activeContact.name}</p>
                <p className={`font-mono text-[9px] ${activeContact.online ? 'text-brand-500' : 'text-zinc-600'} uppercase`}>
                  {activeContact.online ? '● ONLINE' : '○ OFFLINE'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-7 h-7 flex items-center justify-center border border-dark-border hover:border-zinc-600 transition-colors text-zinc-500 hover:text-white">
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center border border-dark-border hover:border-zinc-600 transition-colors text-zinc-500 hover:text-white">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Encrypted badge */}
          <div className="flex justify-center py-2 border-b border-dark-border bg-dark-bg shrink-0">
            <span className="font-mono text-[9px] text-brand-500 border border-brand-500/20 bg-brand-500/5 px-3 py-1 uppercase tracking-wider">
              CONEXÃO_SEGURA_ESTABELECIDA
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {m.from === 'other' && (
                  <div className="w-6 h-6 bg-dark-input border border-dark-border flex items-center justify-center shrink-0 mb-0.5">
                    <span className="font-mono text-[8px] text-zinc-400">{activeContact.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${m.from === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {m.from === 'other' && (
                    <span className="font-mono text-[9px] text-zinc-500 ml-1">{activeContact.name} · {m.time}</span>
                  )}
                  <div className={`px-4 py-3 font-mono text-xs leading-relaxed ${
                    m.from === 'me'
                      ? 'bg-brand-500/10 border border-brand-500/30 text-zinc-200'
                      : 'bg-dark-card border border-dark-border text-zinc-300'
                  }`}>
                    {m.text}
                  </div>
                  {m.from === 'me' && (
                    <span className="font-mono text-[9px] text-zinc-600 mr-1">{m.time} · Você</span>
                  )}
                </div>
                {m.from === 'me' && (
                  <div className="w-6 h-6 bg-brand-500/10 border border-brand-500/30 flex items-center justify-center shrink-0 mb-0.5">
                    <span className="font-mono text-[8px] text-brand-500">EU</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-dark-border bg-dark-card shrink-0">
            <div className="flex items-center gap-2">
              <button className="text-zinc-600 hover:text-zinc-400 transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Transmite a sua mensagem... (ENTER para enviar)"
                  className="w-full px-4 py-2.5 bg-dark-input border border-dark-border text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none"
                />
              </div>
              <button
                onClick={sendMessage}
                className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-4 py-2.5 hover:bg-brand-400 border border-brand-500 transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> SEND()
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
