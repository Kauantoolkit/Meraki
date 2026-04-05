import { useState, useEffect } from 'react'
import { Lock, ArrowDownLeft, Clock, Filter, Download, ShieldCheck } from 'lucide-react'
import Navbar from '../components/Navbar'
import { paymentsApi, Payment } from '../api/payments'
import { projectsApi, Milestone } from '../api/projects'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function Financeiro() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [pendingMilestones, setPendingMilestones] = useState<Milestone[]>([])
  const [escrow] = useState(0)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)

  useEffect(() => {
    paymentsApi.list()
      .then(res => setPayments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const released = payments.filter(p => p.status === 'RELEASED').reduce((acc, p) => acc + p.netAmount, 0)
  const totalFund = payments.filter(p => p.status === 'RELEASED').reduce((acc, p) => acc + p.amount, 0)

  async function handleApprove(milestoneId: string) {
    setApproving(milestoneId)
    try {
      await paymentsApi.releaseMilestone(milestoneId)
      const updated = await paymentsApi.list()
      setPayments(updated.data)
      setPendingMilestones(prev => prev.filter(m => m.id !== milestoneId))
    } catch {
      alert('Erro ao aprovar pagamento.')
    } finally {
      setApproving(null)
    }
  }

  const STATUS_CLS: Record<string, string> = {
    RELEASED: 'text-brand-500 border-brand-500/30 bg-brand-500/10',
    PENDING:  'text-orange-400 border-orange-400/30 bg-orange-400/10',
    ESCROW:   'text-blue-400 border-blue-400/30 bg-blue-400/10',
  }

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-orange-400 animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-orange-400 uppercase">Payment Service // Online</span>
            </div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Gestão de Fundo de Garantia</h1>
            <p className="text-sm text-zinc-400 font-mono mt-2">
              Controlo de depósitos de Escrow e a liberação de pagamentos por Milestone.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-dark-input border border-dark-border hover:border-zinc-600 text-zinc-400 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 border border-orange-500 text-dark-bg hover:bg-orange-400 font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-[4px_4px_0px_rgba(249,115,22,0.2)]">
              APORTAR FUNDOS
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-card border border-orange-400/30 p-5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400" />
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Saldo Retido (Escrow)</span>
              <Lock className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{fmt(escrow)}</span>
            <p className="font-mono text-[10px] text-zinc-600 mt-1 uppercase">Em custódia pelo sistema</p>
          </div>
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Total Liberado (Fund)</span>
              <ArrowDownLeft className="w-4 h-4 text-brand-500" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{fmt(released)}</span>
            <p className="font-mono text-[10px] text-zinc-600 mt-1 uppercase">Milestones aprovados</p>
          </div>
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Aguardando Utilização</span>
              <Clock className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{fmt(totalFund - released)}</span>
            <p className="font-mono text-[10px] text-zinc-600 mt-1 uppercase">A aguardar milestone</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ledger */}
          <div className="lg:col-span-2">
            <div className="bg-dark-card border border-dark-border">
              <div className="p-4 border-b border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-orange-400" />
                  <h2 className="font-mono text-sm font-bold text-white uppercase">Livro-Razão de Transações</h2>
                </div>
                <button className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors">
                  <Filter className="w-3 h-3" /> Filtrar
                </button>
              </div>

              {loading ? (
                <div className="p-8 text-center font-mono text-zinc-500">Carregando...</div>
              ) : payments.length === 0 ? (
                <div className="p-8 text-center font-mono text-zinc-600 border border-dashed border-zinc-700 m-4">
                  Nenhuma transação registada.
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div className="grid grid-cols-5 gap-2 px-4 py-2 border-b border-dark-border bg-dark-input">
                    {['TX_ID', 'DATA/HORA', 'TIPO', 'NET (REF)', 'STATUS'].map(h => (
                      <span key={h} className="font-mono text-[9px] text-zinc-600 uppercase">{h}</span>
                    ))}
                  </div>
                  <div className="divide-y divide-dark-border">
                    {payments.map(p => (
                      <div key={p.id} className="grid grid-cols-5 gap-2 px-4 py-3 items-center hover:bg-dark-hover transition-colors">
                        <span className="font-mono text-[10px] text-zinc-400 truncate">{p.id.slice(0, 8)}</span>
                        <span className="font-mono text-[10px] text-zinc-500">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                        <span className="font-mono text-[10px] text-zinc-400">ESCROW_REL</span>
                        <span className="font-mono text-xs font-bold text-white">{fmt(p.netAmount)}</span>
                        <span className={`font-mono text-[9px] px-2 py-0.5 border w-fit ${STATUS_CLS[p.status] ?? 'text-zinc-500 border-dark-border'}`}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pending Actions */}
          <div className="lg:col-span-1">
            <div className="bg-dark-card border border-orange-400/30">
              <div className="p-4 border-b border-orange-400/30 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 animate-pulse" />
                <h2 className="font-mono text-sm font-bold text-orange-400 uppercase">Ações Pendentes</h2>
              </div>

              {pendingMilestones.length === 0 ? (
                <div className="p-6">
                  <div className="border border-dashed border-orange-400/20 p-4 text-center">
                    <ShieldCheck className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                    <p className="font-mono text-[10px] text-zinc-600 uppercase">Nenhuma ação pendente</p>
                    <p className="font-mono text-[10px] text-zinc-700 mt-1">Todas as milestones estão em dia.</p>
                  </div>
                  {/* Demo card */}
                  <div className="mt-4 border border-orange-400/30 bg-orange-400/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-[9px] text-orange-400 border border-orange-400/30 bg-orange-400/10 px-2 py-0.5 uppercase">PRÉ-VISUALIZAÇÃO</span>
                    </div>
                    <p className="font-mono text-xs font-bold text-white mb-1">Autorizar Pagamento: Módulo de Rastreamento</p>
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-zinc-500">Especialista:</span>
                        <span className="text-white">Kauan Silva</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-zinc-500">Valor:</span>
                        <span className="text-orange-400 font-bold">R$ 8.000,00</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-zinc-500">Taxa (M1):</span>
                        <span className="text-zinc-400">R$ 400,00</span>
                      </div>
                    </div>
                    <button disabled className="w-full btn-sharp bg-orange-500/50 text-dark-bg font-bold font-mono text-[10px] py-2.5 border border-orange-500/50 uppercase cursor-not-allowed opacity-50">
                      APROVAR RELEASE
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-orange-400/20">
                  {pendingMilestones.map(m => (
                    <div key={m.id} className="p-4">
                      <p className="font-mono text-xs font-bold text-white mb-1">{m.title}</p>
                      <p className="font-mono text-sm font-bold text-orange-400 mb-3">{fmt(m.amount)}</p>
                      <button
                        onClick={() => handleApprove(m.id)}
                        disabled={approving === m.id}
                        className="w-full btn-sharp bg-orange-500 text-dark-bg font-bold font-mono text-[10px] py-2.5 border border-orange-500 hover:bg-orange-400 transition-colors uppercase disabled:opacity-70"
                      >
                        {approving === m.id ? 'Processando...' : 'APROVAR RELEASE'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
