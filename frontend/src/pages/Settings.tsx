import { useState } from 'react'
import { User, Shield, CreditCard, AlertTriangle, Download, TerminalSquare, LogOut, Bell } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

type Tab = 'account' | 'security' | 'billing'

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5 transition-colors duration-200 focus:outline-none ${enabled ? 'bg-brand-500' : 'bg-zinc-700'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-dark-bg transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('account')
  const [name, setName] = useState(user?.name ?? '')
  const [bio, setBio] = useState('')
  const [saved, setSaved] = useState(false)
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  // Alertas
  const [alertMessages, setAlertMessages] = useState(true)
  const [alertFinanceiro, setAlertFinanceiro] = useState(true)
  const [alertRecomendacoes, setAlertRecomendacoes] = useState(false)

  const isSpecialist = user?.type === 'specialist'

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'account',  label: 'Conta Básica', icon: User },
    { key: 'security', label: 'Segurança',     icon: Shield },
    { key: 'billing',  label: 'Faturação',     icon: CreditCard },
  ]

  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased">
      <div className="scanline" />
      <Navbar backUrl="/dashboard" projectTitle="MERAKI // ACCOUNT_SETTINGS" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-dark-card border border-dark-border">
              {TABS.map(t => {
                const Icon = t.icon
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-dark-border transition-colors ${
                      tab === t.key
                        ? 'bg-brand-500/5 border-l-2 border-l-brand-500 text-brand-500'
                        : 'text-zinc-400 hover:text-white hover:bg-dark-hover'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono text-xs uppercase tracking-wider">{t.label}</span>
                  </button>
                )
              })}
              <div className="border-t border-dark-border mt-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="font-mono text-xs uppercase tracking-wider">Encerrar Sessão</span>
              </button>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">

            {/* Account Tab */}
            {tab === 'account' && (
              <div className="space-y-5">
                <div className="bg-dark-card border border-dark-border p-6">
                  <h2 className="font-mono text-sm font-bold text-white uppercase mb-1">Definições da Conta</h2>
                  <p className="font-mono text-[10px] text-zinc-500 mb-6">
                    Ajusta os parâmetros primários do seu perfil no ecossistema MERAKI.
                  </p>

                  {/* IDENTIDADE */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-dark-border">
                      <TerminalSquare className="w-3.5 h-3.5 text-brand-500" />
                      <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">Identidade</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">Nome de Visualização</label>
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full px-4 py-3 bg-dark-input border border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 rounded-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">Identificador Único</label>
                        <div className="px-4 py-3 bg-dark-input border border-dark-border text-sm font-mono text-zinc-500 cursor-not-allowed">
                          {isSpecialist ? 'DEV-' : 'EMP-'}{user?.id?.slice(0, 4).toUpperCase() ?? '99X1'}
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">E-mail Principal</label>
                      <input
                        type="email"
                        defaultValue={user?.email ?? ''}
                        disabled
                        className="w-full px-4 py-3 bg-dark-input border border-dark-border text-sm font-mono text-zinc-600 rounded-none cursor-not-allowed"
                      />
                      <p className="font-mono text-[9px] text-zinc-700 mt-1">O e-mail não pode ser alterado. Contacte o suporte.</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">Bio / Apresentação Resumida</label>
                      <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="Apresente-se à comunidade..."
                        rows={4}
                        className="w-full px-4 py-3 bg-dark-input border border-dark-border text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 rounded-none resize-none"
                      />
                    </div>
                  </div>

                  {/* ALERTAS DO SISTEMA */}
                  <div>
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-dark-border">
                      <Bell className="w-3.5 h-3.5 text-brand-500" />
                      <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">Alertas do Sistema</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-xs font-bold text-white">Mensagens Diretas</p>
                          <p className="font-mono text-[10px] text-zinc-500 mt-0.5">Notificar quando receber mensagens de clientes/especialistas.</p>
                        </div>
                        <Toggle enabled={alertMessages} onChange={() => setAlertMessages(!alertMessages)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-xs font-bold text-white">Atualizações Financeiras</p>
                          <p className="font-mono text-[10px] text-zinc-500 mt-0.5">Liberação de escrow, pagamentos aprovados e faturas.</p>
                        </div>
                        <Toggle enabled={alertFinanceiro} onChange={() => setAlertFinanceiro(!alertFinanceiro)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-xs font-bold text-white">Recomendações de Projetos</p>
                          <p className="font-mono text-[10px] text-zinc-500 mt-0.5">
                            Projetos baseados nos seus skills {!isSpecialist && <span className="text-zinc-700">(Apenas Especialistas).</span>}
                          </p>
                        </div>
                        <Toggle
                          enabled={isSpecialist ? alertRecomendacoes : false}
                          onChange={() => isSpecialist && setAlertRecomendacoes(!alertRecomendacoes)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save/Discard */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => { setName(user?.name ?? ''); setBio('') }}
                    className="px-6 py-3 bg-dark-input border border-dark-border font-mono font-bold text-xs text-zinc-300 hover:border-zinc-500 hover:text-white uppercase tracking-wider transition-colors"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-sharp bg-brand-500 text-dark-bg font-bold font-mono text-xs px-6 py-3 hover:bg-brand-400 border border-brand-500 transition-colors shadow-[4px_4px_0px_rgba(85,202,124,0.15)]"
                  >
                    {saved ? 'SALVO ✓' : 'SALVAR ALTERAÇÕES'}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {tab === 'security' && (
              <div className="space-y-5">
                <div className="bg-dark-card border border-dark-border p-6">
                  <h2 className="font-mono text-sm font-bold text-white uppercase mb-1">Segurança e Privacidade</h2>
                  <p className="font-mono text-[10px] text-zinc-500 mb-6">Gira o acesso à conta e proteja os seus dados sensíveis no Ecossistema Meraki.</p>

                  {/* 2FA */}
                  <div className="border border-dark-border bg-dark-input p-5 mb-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <TerminalSquare className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                        <div>
                          <h3 className="font-mono text-xs font-bold text-white uppercase mb-1">Autenticação de 2 Fatores (2FA)</h3>
                          <p className="font-mono text-[10px] text-zinc-500 leading-relaxed">
                            Aumente a segurança exigindo um código de um app autenticador ao fazer login.
                          </p>
                          <span className={`inline-block mt-2 font-mono text-[9px] px-2 py-0.5 border uppercase ${twoFAEnabled ? 'text-brand-500 border-brand-500/30 bg-brand-500/10' : 'text-red-400 border-red-400/30 bg-red-400/10'}`}>
                            Status: {twoFAEnabled ? 'ATIVADO' : 'DESATIVADO'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                        className={`shrink-0 px-4 py-2 font-mono font-bold text-xs uppercase border transition-colors ${
                          twoFAEnabled
                            ? 'bg-dark-input border-zinc-600 text-zinc-300 hover:border-zinc-400'
                            : 'bg-brand-500 border-brand-500 text-dark-bg hover:bg-brand-400'
                        }`}
                      >
                        {twoFAEnabled ? 'Desativar 2FA' : 'Ativar 2FA'}
                      </button>
                    </div>
                  </div>

                  {/* Change Password */}
                  <div className="border border-dark-border p-5">
                    <h3 className="font-mono text-xs font-bold text-white uppercase mb-4 flex items-center gap-2">
                      ↻ Atualizar Senha
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Senha Atual</label>
                        <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-dark-input border border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 rounded-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Nova Senha</label>
                          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-dark-input border border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 rounded-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Confirmar Nova Senha</label>
                          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-dark-input border border-dark-border text-sm font-mono text-white focus:outline-none focus:border-brand-500 rounded-none" />
                        </div>
                      </div>
                      <button className="btn-sharp bg-dark-input text-zinc-300 font-bold font-mono text-xs px-5 py-2.5 border border-dark-border hover:border-zinc-500 transition-colors uppercase">
                        Modificar Chave
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-dark-card border border-red-500/30 p-6">
                  <h3 className="font-mono text-xs font-bold text-red-400 uppercase mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" /> Zona de Perigo
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border border-dark-border p-4">
                      <div>
                        <p className="font-mono text-xs font-bold text-white">Exportação de Dados</p>
                        <p className="font-mono text-[10px] text-zinc-500 mt-0.5">Download completo do seu histórico, faturas e logs no formato JSON.</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-dark-input border border-dark-border hover:border-zinc-500 font-mono text-xs text-zinc-300 hover:text-white transition-colors uppercase">
                        <Download className="w-3.5 h-3.5" /> Exportar
                      </button>
                    </div>
                    <div className="flex items-center justify-between border border-red-500/20 bg-red-500/5 p-4">
                      <div>
                        <p className="font-mono text-xs font-bold text-red-400">Apagar Conta</p>
                        <p className="font-mono text-[10px] text-zinc-500 mt-0.5">Ação irreversível. Todos os dados associados serão removidos do sistema.</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-red-500 border border-red-500 hover:bg-red-400 font-mono text-xs font-bold text-dark-bg transition-colors uppercase">
                        Iniciar Purga
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {tab === 'billing' && (
              <div className="bg-dark-card border border-dark-border p-6">
                <h2 className="font-mono text-sm font-bold text-white uppercase mb-1">Faturação</h2>
                <p className="font-mono text-[10px] text-zinc-500 mb-6">Métodos de pagamento e histórico de faturas.</p>
                <div className="py-12 text-center border border-dashed border-zinc-700 font-mono text-zinc-600">
                  Sem faturas ou métodos de pagamento configurados.
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
