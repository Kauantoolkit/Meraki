import { useState, useEffect } from 'react'
import { Lock, ArrowDownLeft, Clock, Filter, Download, ShieldCheck, Copy, CheckCircle, QrCode } from 'lucide-react'
import Navbar from '../components/Navbar'
import { paymentsApi, Payment, PaymentMethodResponse } from '../api/payments'
import { projectsApi, Milestone } from '../api/projects'
import { paymentStatusLabel } from '../lib/labels'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function Financeiro() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [pendingMilestones, setPendingMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)
  const [pixData, setPixData] = useState<PaymentMethodResponse | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    Promise.all([
      paymentsApi.listByCompany(),
      projectsApi.listByCompany(),
    ]).then(async ([paymentsRes, projectsRes]) => {
      const pyms = paymentsRes.data?.data ?? paymentsRes.data ?? []
      setPayments(Array.isArray(pyms) ? pyms : [])

      const projects = projectsRes.data.data.filter(p => p.status === 'IN_PROGRESS')

      const milestoneArrays = await Promise.all(
        projects.map(p =>
          projectsApi.getMilestones(p.id)
            .then(r => (r.data ?? []) as Milestone[])
            .catch(() => [] as Milestone[])
        )
      )
      setPendingMilestones(milestoneArrays.flat().filter(m => m.status === 'SUBMITTED'))
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [])

  const escrow = payments.filter(p => p.status === 'ESCROW_HELD').reduce((acc, p) => acc + Number(p.amount), 0)
  const released = payments.filter(p => p.status === 'RELEASED').reduce((acc, p) => acc + Number(p.amount), 0)
  const totalPago = payments.filter(p => p.status !== 'REFUNDED').reduce((acc, p) => acc + Number(p.amount), 0)

  function exportCsv() {
    const header = 'ID,Projeto,Milestone,Valor Bruto,Taxa (10%),Valor Líquido,Status,Data'
    const rows = payments.map(p => [
      p.id,
      p.projectId,
      p.milestoneId,
      p.amount.toFixed(2),
      Number(p.platformFee ?? 0).toFixed(2),
      Number(p.specialistAmount ?? p.amount).toFixed(2),
      p.status,
      new Date(p.createdAt).toLocaleDateString('pt-BR'),
    ].join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meraki-financeiro-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleApprove(milestoneId: string) {
    setApproving(milestoneId)
    try {
      await paymentsApi.releaseMilestone(milestoneId)
      const updated = await paymentsApi.listByCompany()
      setPayments(updated.data.data)
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
    ESCROW_HELD: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
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
              <span className="font-mono text-[10px] tracking-widest text-orange-400 uppercase">Meraki // Online</span>
            </div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Gestão de Fundo de Garantia</h1>
            <p className="text-sm text-zinc-400 font-mono mt-2">
              Controle de depósitos de Escrow e a liberação de pagamentos por Milestone.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportCsv}
              disabled={payments.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-dark-input border border-dark-border hover:border-zinc-600 text-zinc-400 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" /> Exportar CSV
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
              <span className="font-mono text-xs text-zinc-500 uppercase">Total Liberado</span>
              <ArrowDownLeft className="w-4 h-4 text-brand-500" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{fmt(released)}</span>
            <p className="font-mono text-[10px] text-zinc-600 mt-1 uppercase">Milestones aprovados</p>
          </div>
          <div className="bg-dark-card border border-dark-border p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-zinc-500 uppercase">Total Investido</span>
              <Clock className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{fmt(totalPago)}</span>
            <p className="font-mono text-[10px] text-zinc-600 mt-1 uppercase">Soma de todos os pagamentos</p>
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
                  Nenhuma transação registrada.
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div className="grid grid-cols-5 gap-2 px-4 py-2 border-b border-dark-border bg-dark-input">
                    {['TX_ID', 'DATA/HORA', 'TIPO', 'LÍQUIDO', 'ESTADO'].map(h => (
                      <span key={h} className="font-mono text-[9px] text-zinc-600 uppercase">{h}</span>
                    ))}
                  </div>
                  <div className="divide-y divide-dark-border">
                    {payments.map(p => (
                      <div key={p.id} className="grid grid-cols-5 gap-2 px-4 py-3 items-center hover:bg-dark-hover transition-colors">
                        <span className="font-mono text-[10px] text-zinc-400 truncate">{p.id.slice(0, 8)}</span>
                        <span className="font-mono text-[10px] text-zinc-500">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                        <span className="font-mono text-[10px] text-zinc-400">ESCROW_REL</span>
                        <span className="font-mono text-xs font-bold text-white">{fmt(Number(p.specialistAmount ?? p.amount))}</span>
                        <span className={`font-mono text-[9px] px-2 py-0.5 border w-fit ${STATUS_CLS[p.status] ?? 'text-zinc-500 border-dark-border'}`}>
                          {paymentStatusLabel[p.status] ?? p.status}
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
                        {approving === m.id ? 'Processando...' : 'APROVAR PAGAMENTO'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pix QR Code Modal */}
        {pixData && pixData.qrCode && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card border border-orange-400/30 max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-orange-400" />
                  <h3 className="font-mono text-sm font-bold text-white uppercase">Pagamento via Pix</h3>
                </div>
                <button
                  onClick={() => { setPixData(null); setCopied(false); }}
                  className="text-zinc-500 hover:text-white font-mono text-xs"
                >
                  FECHAR
                </button>
              </div>

              <div className="flex flex-col items-center gap-4">
                <img
                  src={`data:image/png;base64,${pixData.qrCode}`}
                  alt="QR Code Pix"
                  className="w-48 h-48 border border-dark-border"
                />
                <p className="font-mono text-2xl font-bold text-orange-400">{fmt(pixData.amount)}</p>
                <p className="font-mono text-[10px] text-zinc-500 uppercase">Escaneie o QR code ou copie o codigo abaixo</p>

                {pixData.qrCodeText && (
                  <div className="w-full flex items-center gap-2">
                    <input
                      readOnly
                      value={pixData.qrCodeText}
                      className="flex-1 bg-dark-input border border-dark-border px-3 py-2 font-mono text-[10px] text-zinc-400 truncate"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(pixData.qrCodeText || '')
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-orange-500 text-dark-bg font-mono text-[10px] font-bold uppercase border border-orange-500 hover:bg-orange-400 transition-colors"
                    >
                      {copied ? <><CheckCircle className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                    </button>
                  </div>
                )}

                <p className="font-mono text-[9px] text-zinc-600 text-center">
                  O pagamento sera confirmado automaticamente apos a transferencia.
                  <br />Expira em {new Date(pixData.expiresAt).toLocaleTimeString('pt-BR')}.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
