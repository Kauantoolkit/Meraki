import { ShieldAlert, Users, FolderGit2, Wallet, Activity } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function Admin() {
  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-red-500 animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-red-500 uppercase">Admin Panel // Restricted</span>
          </div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-500" /> Painel Administrativo
          </h1>
          <p className="text-sm text-zinc-400 font-mono mt-2">Visão geral do sistema. Acesso restrito.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Usuários', icon: Users, value: '—', color: 'text-brand-500' },
            { label: 'Projetos', icon: FolderGit2, value: '—', color: 'text-blue-400' },
            { label: 'Volume Financeiro', icon: Wallet, value: '—', color: 'text-purple-400' },
            { label: 'Transações', icon: Activity, value: '—', color: 'text-orange-400' },
          ].map(({ label, icon: Icon, value, color }) => (
            <div key={label} className="bg-dark-card border border-dark-border p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-xs text-zinc-500 uppercase">{label}</span>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className={`text-2xl font-bold font-mono ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        <div className="bg-dark-card border border-dark-border p-6">
          <h2 className="font-mono text-sm font-bold text-white uppercase mb-4">Log do Sistema</h2>
          <div className="bg-[#000] border border-dark-border p-4 font-mono text-[10px] h-64 overflow-y-auto terminal-scroll space-y-2">
            <p className="text-zinc-500">[SYS] Admin panel acessado.</p>
            <p className="text-brand-500">[INFO] Todos os serviços operacionais.</p>
            <p className="text-brand-500 flex items-center">
              <span>&gt; meraki@admin:~$</span>
              <span className="w-2 h-3 bg-brand-500 ml-1 animate-pulse" />
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
