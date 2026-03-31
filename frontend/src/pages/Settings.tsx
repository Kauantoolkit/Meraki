import { useState } from 'react'
import { Settings, User, Lock, Bell } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <Settings className="w-6 h-6 text-brand-500" /> Configurações
          </h1>
          <p className="text-sm text-zinc-400 font-mono mt-2">Gerencie as suas preferências de conta.</p>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <div className="bg-dark-card border border-dark-border p-6">
            <h2 className="font-mono text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-500" /> Perfil
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Nome</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-input border border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 rounded-none" />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">E-mail</label>
                <input type="email" defaultValue={user?.email ?? ''} disabled
                  className="w-full px-4 py-3 bg-dark-input border border-dark-border text-sm font-mono text-zinc-500 rounded-none cursor-not-allowed" />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Tipo de Conta</label>
                <div className="px-4 py-3 bg-dark-input border border-dark-border text-sm font-mono text-brand-500">
                  {(user?.userType ?? user?.type)?.toUpperCase() ?? '—'}
                </div>
              </div>
              <button onClick={handleSave}
                className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-6 py-3 hover:bg-brand-400 border border-brand-500 transition-colors">
                {saved ? 'SALVO ✓' : 'SALVAR_ALTERAÇÕES()'}
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-dark-card border border-dark-border p-6">
            <h2 className="font-mono text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" /> Segurança
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Senha Atual</label>
                <input type="password" placeholder="••••••••"
                  className="w-full px-4 py-3 bg-dark-input border border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 rounded-none" />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Nova Senha</label>
                <input type="password" placeholder="••••••••"
                  className="w-full px-4 py-3 bg-dark-input border border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 rounded-none" />
              </div>
              <button className="btn-sharp bg-dark-input text-zinc-300 font-bold font-mono text-xs px-6 py-3 border border-dark-border hover:border-zinc-500 transition-colors">
                ALTERAR_SENHA()
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-dark-card border border-dark-border p-6">
            <h2 className="font-mono text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-400" /> Notificações
            </h2>
            <div className="space-y-3">
              {['Pagamentos liberados', 'Milestones aprovados', 'Novas propostas', 'Atualizações do projeto'].map(item => (
                <label key={item} className="flex items-center justify-between cursor-pointer group">
                  <span className="font-mono text-xs text-zinc-300">{item}</span>
                  <div className="w-10 h-5 bg-brand-500/30 border border-brand-500/50 relative">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-brand-500" />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
