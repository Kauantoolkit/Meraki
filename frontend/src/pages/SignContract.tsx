import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FileCheck, CheckCircle2, Clock, AlertCircle, ArrowLeft, Loader2, Shield, QrCode, Copy, Check } from 'lucide-react'
import Navbar from '../components/Navbar'
import { projectsApi, Project } from '../api/projects'
import { paymentsApi, HiringPaymentResponse } from '../api/payments'
import { useAuth } from '../contexts/AuthContext'
import { extractApiError } from '../api/client'

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

/** Gera hash SHA-256 hex a partir de uma string (Web Crypto API). */
async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Monta o conteúdo canônico do contrato para gerar o hash. */
function buildContractContent(p: Project): string {
  const milestones = (p.milestones ?? [])
    .map((m, i) => `M${i + 1}|${m.title}|${m.amount}`)
    .join(';')
  return [
    `project:${p.id}`,
    `title:${p.title}`,
    `budget:${p.budget}`,
    `deadline:${p.deadline}`,
    `company:${p.companyId}`,
    `specialist:${p.specialistId}`,
    `milestones:[${milestones}]`,
  ].join('|')
}

export default function SignContract() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [contractHash, setContractHash] = useState('')

  const isCompany = user?.userType === 'COMPANY' || (user as any)?.type === 'COMPANY'
  const role = isCompany ? 'COMPANY' : 'SPECIALIST'

  const alreadySigned = project
    ? (isCompany ? !!project.companySignedAt : !!project.specialistSignedAt)
    : false

  const otherSigned = project
    ? (isCompany ? !!project.specialistSignedAt : !!project.companySignedAt)
    : false

  // Conteúdo canônico do contrato (para exibição e hash)
  const contractContent = useMemo(() => project ? buildContractContent(project) : '', [project])

  // Gera o hash SHA-256 quando o projeto é carregado
  useEffect(() => {
    if (!contractContent) return
    sha256(contractContent).then(setContractHash)
  }, [contractContent])

  useEffect(() => {
    if (!projectId) return
    projectsApi.getById(projectId)
      .then(r => setProject(r.data))
      .catch(() => setError('Projeto não encontrado.'))
      .finally(() => setLoading(false))
  }, [projectId])

  async function handleSign() {
    if (!projectId || !project || !contractHash) return
    setSigning(true)
    setError('')
    try {
      const updated = await projectsApi.signContract(projectId, { contractHash, role })
      setProject(updated.data)
    } catch (err) {
      setError(extractApiError(err, 'Erro ao assinar contrato.'))
    } finally {
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-dark-bg min-h-screen text-zinc-300 antialiased">
        <Navbar backUrl="/dashboard" projectTitle="CONTRATO" />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center font-mono text-zinc-500">Carregando...</div>
      </div>
    )
  }

  if (!project || project.status !== 'SIGNING') {
    if (project?.status === 'IN_PROGRESS') {
      return <PostSigningFlow project={project} projectId={projectId!} isCompany={isCompany} navigate={navigate} />
    }

    return (
      <div className="bg-dark-bg min-h-screen text-zinc-300 antialiased">
        <Navbar backUrl="/dashboard" projectTitle="CONTRATO" />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center font-mono text-red-400">
          {error || 'Este projeto não está em fase de assinatura.'}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <Navbar backUrl="/dashboard" projectTitle="CONTRATO" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 font-mono text-xs text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Voltar ao painel
        </button>

        <div className="bg-dark-card border border-dark-border p-6 relative">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-yellow-500" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-yellow-500" />

          {/* Header */}
          <div className="flex items-center gap-3 mb-6 border-b border-dark-border pb-4">
            <FileCheck className="w-6 h-6 text-yellow-500" />
            <div>
              <h1 className="text-xl font-bold text-white uppercase tracking-tight">Contrato do Projeto</h1>
              <p className="font-mono text-[10px] text-zinc-500 mt-0.5">{projectId}</p>
            </div>
          </div>

          {/* Status das assinaturas */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 border ${project.companySignedAt ? 'border-brand-500/50 bg-brand-500/5' : 'border-dark-border'}`}>
              <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">Empresa</p>
              {project.companySignedAt ? (
                <div>
                  <div className="flex items-center gap-2 text-brand-500 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-mono text-xs font-bold">Assinado</span>
                  </div>
                  <p className="font-mono text-[9px] text-zinc-600">
                    {new Date(project.companySignedAt).toLocaleString('pt-BR')}
                  </p>
                  {project.companySignedIp && (
                    <p className="font-mono text-[9px] text-zinc-700">IP: {project.companySignedIp}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-xs">Pendente</span>
                </div>
              )}
            </div>
            <div className={`p-4 border ${project.specialistSignedAt ? 'border-brand-500/50 bg-brand-500/5' : 'border-dark-border'}`}>
              <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">Especialista</p>
              {project.specialistSignedAt ? (
                <div>
                  <div className="flex items-center gap-2 text-brand-500 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-mono text-xs font-bold">Assinado</span>
                  </div>
                  <p className="font-mono text-[9px] text-zinc-600">
                    {new Date(project.specialistSignedAt).toLocaleString('pt-BR')}
                  </p>
                  {project.specialistSignedIp && (
                    <p className="font-mono text-[9px] text-zinc-700">IP: {project.specialistSignedIp}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-xs">Pendente</span>
                </div>
              )}
            </div>
          </div>

          {/* Termos do contrato */}
          <div className="bg-[#000] border border-dark-border p-5 mb-4 font-mono text-xs leading-relaxed text-zinc-400">
            <p className="text-brand-500 font-bold uppercase tracking-wider mb-4">Termos do Contrato</p>

            <p className="mb-3">
              <span className="text-zinc-500">Projeto:</span>{' '}
              <span className="text-white font-bold">{project.title}</span>
            </p>
            <p className="mb-3">
              <span className="text-zinc-500">Orçamento Total:</span>{' '}
              <span className="text-white font-bold">{fmt(project.budget)}</span>
            </p>
            <p className="mb-3">
              <span className="text-zinc-500">Prazo de Entrega:</span>{' '}
              <span className="text-white">{project.deadline ? new Date(project.deadline).toLocaleDateString('pt-BR') : '—'}</span>
            </p>
            <p className="mb-3">
              <span className="text-zinc-500">Empresa (contratante):</span>{' '}
              <span className="text-white">{project.companyId}</span>
            </p>
            <p className="mb-3">
              <span className="text-zinc-500">Especialista (contratado):</span>{' '}
              <span className="text-white">{(project as any).specialistName || project.specialistId}</span>
            </p>

            {project.milestones && project.milestones.length > 0 && (
              <div className="mt-4 pt-4 border-t border-dark-border/50">
                <p className="text-zinc-500 uppercase tracking-wider mb-2">Milestones e Valores</p>
                {project.milestones.map((m, i) => (
                  <div key={m.id} className="flex justify-between py-1.5 border-b border-dark-border/30">
                    <span className="text-zinc-300">M{i + 1}. {m.title}</span>
                    <span className="text-white font-bold">{fmt(m.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-dark-border/50 text-[10px] text-zinc-500 space-y-1.5">
              <p className="text-zinc-400 font-bold uppercase tracking-wider mb-2">Cláusulas</p>
              <p>1. O especialista compromete-se a entregar cada milestone conforme os critérios de aceitação definidos.</p>
              <p>2. A empresa compromete-se a revisar e aprovar/rejeitar cada entrega em até 7 dias úteis.</p>
              <p>3. O valor de cada milestone fica retido em escrow até a sua aprovação pela empresa (RN05).</p>
              <p>4. A plataforma Meraki retém uma taxa de 10% sobre cada pagamento liberado (RN06).</p>
              <p>5. Ambas as partes devem assinar este contrato para que o projeto entre em execução.</p>
              <p>6. O cancelamento unilateral após início de execução pode resultar em penalidades conforme os termos da plataforma.</p>
            </div>
          </div>

          {/* Hash do contrato */}
          {contractHash && (
            <div className="bg-dark-input border border-dark-border p-3 mb-6 flex items-start gap-2">
              <Shield className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Hash SHA-256 do Contrato</p>
                <p className="font-mono text-[10px] text-zinc-400 break-all">{contractHash}</p>
                <p className="font-mono text-[8px] text-zinc-700 mt-1">
                  Este hash garante a integridade dos termos — qualquer alteração geraria um hash diferente.
                </p>
              </div>
            </div>
          )}

          {/* Ação */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2 mb-4 font-mono text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {alreadySigned ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-8 h-8 text-brand-500 mx-auto mb-2" />
              <p className="font-mono text-sm text-brand-500 font-bold">Você já assinou este contrato.</p>
              {!otherSigned && (
                <p className="font-mono text-[10px] text-zinc-500 mt-1">
                  Aguardando a assinatura da outra parte para o projeto entrar em andamento.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                  className="mt-0.5 accent-brand-500"
                />
                <span className="font-mono text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  Li e aceito integralmente os termos do contrato acima. Declaro estar ciente dos valores,
                  prazos, cláusulas e condições estabelecidos. Entendo que meu IP e timestamp serão registrados
                  como comprovação de aceite (MP 2.200-2/2001).
                </span>
              </label>

              <button
                onClick={handleSign}
                disabled={!accepted || signing || !contractHash}
                className="w-full btn-sharp bg-yellow-500 text-dark-bg font-bold font-mono text-sm px-6 py-4 hover:bg-yellow-400 border border-yellow-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {signing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> REGISTRANDO ASSINATURA...</>
                ) : (
                  <><FileCheck className="w-4 h-4" /> ASSINAR_CONTRATO({role})</>
                )}
              </button>

              <p className="font-mono text-[9px] text-zinc-600 text-center">
                Ao clicar, seu endereço IP, navegador e horário serão registrados junto ao hash SHA-256 dos termos.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

/* ─── Fluxo pós-assinatura: Pix (empresa) ou aguardar (especialista) ───── */

function PostSigningFlow({
  project,
  projectId,
  isCompany,
  navigate,
}: {
  project: Project
  projectId: string
  isCompany: boolean
  navigate: ReturnType<typeof useNavigate>
}) {
  const [pixData, setPixData] = useState<HiringPaymentResponse | null>(null)
  const [loadingPix, setLoadingPix] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [escrowPaid, setEscrowPaid] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const totalBudget = project.budget

  // Verifica se já existe escrow pago para este projeto
  useEffect(() => {
    paymentsApi.listByProject(projectId)
      .then(res => {
        const payments = Array.isArray(res.data) ? res.data : (res as any).data?.data ?? []
        const hasEscrow = payments.some((p: any) => p.status === 'ESCROW_HELD' || p.status === 'RELEASED')
        if (hasEscrow) setEscrowPaid(true)
      })
      .catch(() => {})
  }, [projectId])

  async function handleGeneratePix() {
    setLoadingPix(true)
    setError('')
    try {
      const res = await paymentsApi.createHiringPayment({
        projectId,
        specialistId: project.specialistId!,
        amount: totalBudget,
      })
      setPixData(res.data)
    } catch (err) {
      setError(extractApiError(err, 'Erro ao gerar pagamento Pix.'))
    } finally {
      setLoadingPix(false)
    }
  }

  async function handleConfirmPayment() {
    if (!pixData) return
    setConfirming(true)
    setError('')
    try {
      await paymentsApi.confirmHiringPayment(pixData.payment.id)
      setEscrowPaid(true)
    } catch (err) {
      setError(extractApiError(err, 'Pagamento ainda não confirmado. Tente novamente.'))
    } finally {
      setConfirming(false)
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  // Escrow já pago → pode ir pro Kanban
  if (escrowPaid) {
    return (
      <div className="bg-dark-bg min-h-screen text-zinc-300 antialiased">
        <Navbar backUrl="/dashboard" projectTitle="CONTRATO" />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <CheckCircle2 className="w-12 h-12 text-brand-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Tudo pronto!</h2>
          <p className="font-mono text-sm text-zinc-400 mb-2">Contrato assinado e escrow depositado.</p>
          <p className="font-mono text-[10px] text-zinc-500 mb-6">O valor de {fmt(totalBudget)} está retido em escrow e será liberado conforme as milestones forem aprovadas.</p>
          <button
            onClick={() => navigate(`/kanban/${projectId}`)}
            className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-6 py-3 hover:bg-brand-400 border border-brand-500 transition-colors"
          >
            ABRIR_KANBAN()
          </button>
        </div>
      </div>
    )
  }

  // Especialista: aguardar empresa depositar
  if (!isCompany) {
    return (
      <div className="bg-dark-bg min-h-screen text-zinc-300 antialiased">
        <Navbar backUrl="/dashboard" projectTitle="CONTRATO" />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <CheckCircle2 className="w-12 h-12 text-brand-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Contrato firmado!</h2>
          <p className="font-mono text-sm text-zinc-400 mb-2">Ambas as partes assinaram.</p>
          <div className="bg-dark-card border border-yellow-500/30 p-4 mt-4 inline-block">
            <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <p className="font-mono text-xs text-yellow-400 font-bold">Aguardando depósito em escrow</p>
            <p className="font-mono text-[10px] text-zinc-500 mt-1">A empresa precisa depositar {fmt(totalBudget)} para o projeto iniciar.</p>
          </div>
        </div>
      </div>
    )
  }

  // Empresa: depositar escrow via Pix
  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <Navbar backUrl="/dashboard" projectTitle="DEPÓSITO ESCROW" />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-dark-card border border-dark-border p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-dark-border pb-4">
            <QrCode className="w-6 h-6 text-brand-500" />
            <div>
              <h1 className="text-lg font-bold text-white uppercase tracking-tight">Depósito em Escrow</h1>
              <p className="font-mono text-[10px] text-zinc-500 mt-0.5">Pague via Pix para garantir o projeto</p>
            </div>
          </div>

          <div className="bg-dark-input border border-dark-border p-4 mb-6">
            <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">Projeto</p>
            <p className="font-mono text-sm text-white font-bold">{project.title}</p>
            <div className="flex justify-between mt-3 pt-3 border-t border-dark-border/50">
              <span className="font-mono text-[10px] text-zinc-500">Valor do Escrow</span>
              <span className="font-mono text-sm text-brand-500 font-bold">{fmt(totalBudget)}</span>
            </div>
            <p className="font-mono text-[9px] text-zinc-600 mt-2">
              Este valor fica retido na plataforma e é liberado por milestone conforme aprovação (RN05).
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2 mb-4 font-mono text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {!pixData ? (
            <button
              onClick={handleGeneratePix}
              disabled={loadingPix}
              className="w-full btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-sm px-6 py-4 hover:bg-brand-400 border border-brand-500 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loadingPix ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> GERANDO PIX...</>
              ) : (
                <><QrCode className="w-4 h-4" /> GERAR_PIX({fmt(totalBudget)})</>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              {/* QR Code */}
              {pixData.paymentMethod.qrCode && (
                <div className="flex flex-col items-center py-4">
                  <img
                    src={`data:image/png;base64,${pixData.paymentMethod.qrCode}`}
                    alt="QR Code Pix"
                    className="w-48 h-48 border border-dark-border"
                  />
                  <p className="font-mono text-[9px] text-zinc-600 mt-2">Escaneie com o app do banco</p>
                </div>
              )}

              {/* Copia e cola */}
              {pixData.paymentMethod.qrCodeText && (
                <div className="bg-dark-input border border-dark-border p-3">
                  <p className="font-mono text-[9px] text-zinc-500 uppercase mb-2">Pix Copia e Cola</p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={pixData.paymentMethod.qrCodeText}
                      className="flex-1 bg-[#000] border border-dark-border px-3 py-2 font-mono text-[10px] text-zinc-300 truncate"
                    />
                    <button
                      onClick={() => handleCopy(pixData.paymentMethod.qrCodeText!)}
                      className="shrink-0 btn-sharp bg-dark-input border border-dark-border px-3 py-2 hover:border-brand-500 hover:text-brand-500 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-brand-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmar pagamento */}
              <button
                onClick={handleConfirmPayment}
                disabled={confirming}
                className="w-full btn-sharp bg-yellow-500 text-dark-bg font-bold font-mono text-sm px-6 py-4 hover:bg-yellow-400 border border-yellow-500 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {confirming ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> VERIFICANDO PAGAMENTO...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> JÁ_PAGUEI() — VERIFICAR</>
                )}
              </button>

              <p className="font-mono text-[9px] text-zinc-600 text-center">
                Após pagar, clique em "Já paguei" para confirmar. O sistema verificará o pagamento automaticamente.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
