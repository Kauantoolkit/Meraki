import { useState, useEffect } from 'react'
import { Wallet, Lock, TrendingUp, ArrowDownLeft, ArrowUpRight, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import { paymentsApi, Payment } from '../api/payments'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const STATUS_CLS: Record<string, string> = {
  RELEASED: 'text-brand-500 border-brand-500/30 bg-brand-500/10',
  PENDING:  'text-orange-400 border-orange-400/30 bg-orange-400/10',
  REFUNDED: 'text-red-400 border-red-400/30 bg-red-400/10',
}

export default function GanhosEspecialista() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paymentsApi.list().then(res => setPayments(res.data)).finally(() => setLoading(false))
  }, [])

  const released = payments.filter(p => p.status === 'RELEASED')
  const inEscrow  = payments.filter(p => p.status === 'PENDING')

  const saldoDisponivel = released.reduce((acc, p) => acc + p.netAmount, 0)
  const emEscrow        = inEscrow.reduce((acc, p) => acc + p.amount, 0)
  const ganhosTotais    = payments.reduce((acc, p) => acc + p.netAmount, 0)

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-brand-500 animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-brand-500 uppercase">Wallet // Online</span>
            </div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Dashboard de Ganhos</h1>
            <p className="text-sm text-zinc-400 font-mono mt-2">Visão analítica de fluxo de caixa e saldos disponíveis.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-brand-500 border border-brand-500 text-dark-bg hover:bg-brand-400 font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-[4px_4px_0px_rgba(85,202,124,0.2)]">
            Solicitar Saque <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-card border border-brand-500/40 p-5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Saldo Disponível</span>
              <Wallet className="w-4 h-4 text-brand-500" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{fmt(saldoDisponivel)}</span>
            <p className="font-mono text-[10px] text-brand-500 mt-1">+ Último release hoje</p>
          </div>
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Em Escrow (Seguro)</span>
              <Lock className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{fmt(emEscrow)}</span>
            <p className="font-mono text-[10px] text-zinc-600 mt-1">A aguardar entrega (Milestones)</p>
          </div>
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Ganhos Totais (Ano)</span>
              <TrendingUp className="w-4 h-4 text-brand-500" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{fmt(ganhosTotais)}</span>
            <p className="font-mono text-[10px] text-zinc-600 mt-1">Total taxas deduzidas</p>
          </div>
        </div>

        {/* Extrato */}
        <div className="bg-dark-card border border-dark-border">
          <div className="p-4 border-b border-dark-border flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4 text-brand-500" />
            <h2 className="font-mono text-sm font-bold text-white uppercase">Extrato Detalhado</h2>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-5 gap-2 px-4 py-2 border-b border-dark-border bg-dark-input">
            {['Data/Hora', 'Transação ID', 'Descrição', 'Valor Líquido', 'Estado'].map(h => (
              <span key={h} className="font-mono text-[9px] text-zinc-600 uppercase">{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="p-8 text-center font-mono text-zinc-500">Carregando...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center font-mono text-zinc-600 border border-dashed border-zinc-700 m-4">
              Nenhum pagamento recebido ainda.
            </div>
          ) : (
            <div className="divide-y divide-dark-border">
              {payments.map(p => {
                const isRelease = p.status === 'RELEASED'
                return (
                  <div key={p.id} className="grid grid-cols-5 gap-2 px-4 py-3 items-center hover:bg-dark-hover transition-colors">
                    <div>
                      <p className="font-mono text-[10px] text-zinc-300">
                        {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="font-mono text-[9px] text-zinc-600">
                        {new Date(p.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-500 truncate">
                      TX-{p.id.slice(0, 6).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-mono text-[10px] text-white font-bold">
                        {isRelease ? 'Liberação Escrow (Milestone)' : 'Saque Efetuado (PIX)'}
                      </p>
                      <p className="font-mono text-[9px] text-zinc-600 truncate">
                        Ref. {p.milestoneId?.slice(0, 8) ?? '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {isRelease
                        ? <ArrowDownLeft className="w-3 h-3 text-brand-500" />
                        : <ArrowUpRight className="w-3 h-3 text-red-400" />
                      }
                      <span className={`font-mono text-sm font-bold ${isRelease ? 'text-brand-500' : 'text-red-400'}`}>
                        {isRelease ? '+' : '-'}{fmt(p.netAmount)}
                      </span>
                    </div>
                    <span className={`font-mono text-[9px] px-2 py-0.5 border w-fit ${STATUS_CLS[p.status] ?? 'text-zinc-500 border-dark-border'}`}>
                      {p.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
