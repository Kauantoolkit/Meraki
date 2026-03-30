import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, Star, ArrowDownLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import { paymentsApi, Payment } from '../api/payments'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function GanhosEspecialista() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paymentsApi.list().then(res => setPayments(res.data)).finally(() => setLoading(false))
  }, [])

  const totalGanhos = payments.filter(p => p.status === 'RELEASED').reduce((acc, p) => acc + p.netAmount, 0)

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-brand-500 animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-brand-500 uppercase">Wallet // Online</span>
          </div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Ganhos</h1>
          <p className="text-sm text-zinc-400 font-mono mt-2">Histórico de pagamentos recebidos por milestone aprovado.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-card border border-brand-500/30 p-5 relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Total Recebido</span>
              <Wallet className="w-4 h-4 text-brand-500" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{fmt(totalGanhos)}</span>
          </div>
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Projetos Pagos</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{payments.filter(p => p.status === 'RELEASED').length}</span>
          </div>
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Reputação</span>
              <Star className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">—</span>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border">
          <div className="p-4 border-b border-dark-border">
            <h2 className="font-mono text-sm font-bold text-white uppercase">Histórico de Recebimentos</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center font-mono text-zinc-500">Carregando...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center font-mono text-zinc-500 border border-dashed border-zinc-700 m-4">Nenhum pagamento recebido ainda.</div>
          ) : (
            <div className="divide-y divide-dark-border">
              {payments.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-dark-hover transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                      <ArrowDownLeft className="w-4 h-4 text-brand-500" />
                    </div>
                    <div>
                      <p className="font-mono text-xs text-white">Pagamento recebido</p>
                      <p className="font-mono text-[10px] text-zinc-500">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-brand-500">{fmt(p.netAmount)}</p>
                    <p className="font-mono text-[10px] text-zinc-500">Taxa: {fmt(p.fee)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
