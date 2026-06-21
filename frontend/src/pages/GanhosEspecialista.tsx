import { useState, useEffect } from 'react'
import { Lock, TrendingUp, ArrowDownLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import { paymentsApi, Payment } from '../api/payments'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const STATUS_CLS: Record<string, string> = {
  RELEASED:    'text-brand-500 border-brand-500/30 bg-brand-500/10',
  ESCROW_HELD: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  PENDING:     'text-orange-400 border-orange-400/30 bg-orange-400/10',
  REFUNDED:    'text-red-400 border-red-400/30 bg-red-400/10',
}

const STATUS_LABEL: Record<string, string> = {
  RELEASED:    'Liberado',
  ESCROW_HELD: 'Em Escrow',
  PENDING:     'Pendente',
  REFUNDED:    'Estornado',
}

export default function GanhosEspecialista() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paymentsApi.list().then(res => setPayments(res.data)).finally(() => setLoading(false))
  }, [])

  const released = payments.filter(p => p.status === 'RELEASED')
  const inEscrow  = payments.filter(p => p.status === 'ESCROW_HELD')

  const totalRecebido  = released.reduce((acc, p) => acc + Number(p.specialistAmount ?? 0), 0)
  const emEscrow       = inEscrow.reduce((acc, p) => acc + Number(p.amount), 0)
  const ganhosBrutos   = payments.filter(p => p.status !== 'REFUNDED').reduce((acc, p) => acc + Number(p.specialistAmount ?? p.amount), 0)

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-brand-500 animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-brand-500 uppercase">Pagamentos // Online</span>
          </div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Meus Pagamentos</h1>
          <p className="text-sm text-zinc-400 font-mono mt-2">Histórico de pagamentos recebidos por milestones aprovados.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-card border border-brand-500/40 p-5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Total Recebido</span>
              <TrendingUp className="w-4 h-4 text-brand-500" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{fmt(totalRecebido)}</span>
            <p className="font-mono text-[10px] text-zinc-600 mt-1">Pagamentos liberados</p>
          </div>
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Aguardando Aprovação</span>
              <Lock className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{fmt(emEscrow)}</span>
            <p className="font-mono text-[10px] text-zinc-600 mt-1">Milestones pendentes de aprovação</p>
          </div>
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Total Bruto (Ano)</span>
              <TrendingUp className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{fmt(ganhosBrutos)}</span>
            <p className="font-mono text-[10px] text-zinc-600 mt-1">Soma de todos os pagamentos</p>
          </div>
        </div>

        {/* Histórico */}
        <div className="bg-dark-card border border-dark-border">
          <div className="p-4 border-b border-dark-border flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4 text-brand-500" />
            <h2 className="font-mono text-sm font-bold text-white uppercase">Histórico de Pagamentos</h2>
          </div>

          <div className="grid grid-cols-5 gap-2 px-4 py-2 border-b border-dark-border bg-dark-input">
            {['Data', 'Referência', 'Projeto / Milestone', 'Valor Líquido', 'Estado'].map(h => (
              <span key={h} className="font-mono text-[9px] text-zinc-600 uppercase">{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="p-8 text-center font-mono text-zinc-500">Carregando...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center font-mono text-zinc-600 border border-dashed border-zinc-700 m-4">
              Nenhum pagamento registrado ainda. Os pagamentos aparecem aqui após a aprovação de milestones.
            </div>
          ) : (
            <div className="divide-y divide-dark-border">
              {payments.map(p => (
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
                      Milestone aprovado
                    </p>
                    <p className="font-mono text-[9px] text-zinc-600 truncate">
                      Ref. {p.milestoneId?.slice(0, 8) ?? '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowDownLeft className="w-3 h-3 text-brand-500" />
                    <span className="font-mono text-sm font-bold text-brand-500">
                      +{fmt(Number(p.specialistAmount ?? p.amount))}
                    </span>
                  </div>
                  <span className={`font-mono text-[9px] px-2 py-0.5 border w-fit ${STATUS_CLS[p.status] ?? 'text-zinc-500 border-dark-border'}`}>
                    {STATUS_LABEL[p.status] ?? p.status}
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
