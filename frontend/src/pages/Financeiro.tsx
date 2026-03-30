import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, Lock, ArrowDownLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import { paymentsApi, Payment } from '../api/payments'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function Financeiro() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [escrow, setEscrow] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([paymentsApi.list(), paymentsApi.getEscrowBalance()])
      .then(([pRes, eRes]) => {
        setPayments(pRes.data)
        setEscrow(eRes.data.balance)
      })
      .finally(() => setLoading(false))
  }, [])

  const released = payments.filter(p => p.status === 'RELEASED').reduce((acc, p) => acc + p.netAmount, 0)
  const totalFees = payments.filter(p => p.status === 'RELEASED').reduce((acc, p) => acc + p.fee, 0)

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-brand-500 animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-brand-500 uppercase">Payment Service // Online</span>
          </div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Financeiro</h1>
          <p className="text-sm text-zinc-400 font-mono mt-2">Controle de escrow, pagamentos liberados e taxas da plataforma.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Em Escrow</span>
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{fmt(escrow)}</span>
          </div>
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Total Liberado</span>
              <ArrowDownLeft className="w-4 h-4 text-brand-500" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{fmt(released)}</span>
          </div>
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Taxas Plataforma</span>
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{fmt(totalFees)}</span>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border">
          <div className="p-4 border-b border-dark-border flex items-center gap-2">
            <Wallet className="w-4 h-4 text-brand-500" />
            <h2 className="font-mono text-sm font-bold text-white uppercase">Histórico de Transações</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center font-mono text-zinc-500">Carregando...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center font-mono text-zinc-500 border-dashed border-zinc-700">Nenhuma transação encontrada.</div>
          ) : (
            <div className="divide-y divide-dark-border">
              {payments.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-dark-hover transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-dark-input border border-dark-border flex items-center justify-center">
                      <ArrowDownLeft className="w-4 h-4 text-brand-500" />
                    </div>
                    <div>
                      <p className="font-mono text-xs text-white">Milestone: {p.milestoneId?.slice(0, 12)}...</p>
                      <p className="font-mono text-[10px] text-zinc-500">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-white">{fmt(p.amount)}</p>
                    <p className="font-mono text-[10px] text-zinc-500">Taxa: {fmt(p.fee)}</p>
                  </div>
                  <span className={`font-mono text-[10px] px-2 py-1 border ml-4 ${p.status === 'RELEASED' ? 'text-brand-500 border-brand-500/30 bg-brand-500/10' : 'text-zinc-500 border-dark-border bg-dark-input'}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
