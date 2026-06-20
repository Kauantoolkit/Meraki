import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TerminalSquare, Mail, ChevronLeft, CheckCircle } from 'lucide-react'
import { passwordApi } from '../api/auth'

export default function PasswordRecovery() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await passwordApi.forgotPassword(email)
      setSent(true)
    } catch {
      setError('Erro ao enviar e-mail. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark-bg bg-grid min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden antialiased text-zinc-300">
      <div className="fixed top-[10%] left-[20%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-brand-500/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[420px] bg-dark-card/90 backdrop-blur-md border border-dark-border p-8 sm:p-10 relative z-10 shadow-2xl">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-500" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 bg-dark-input border border-brand-500 flex items-center justify-center mb-4 shadow-[4px_4px_0px_rgba(85,202,124,0.2)]">
            <TerminalSquare className="text-brand-500 w-6 h-6" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase font-mono">Meraki</h1>
          <p className="text-xs text-zinc-500 mt-1 font-mono tracking-wider">RECUPERAÇÃO.SENHA</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-brand-500 mx-auto" strokeWidth={1.5} />
            <p className="text-sm text-zinc-300 font-mono">
              Se o e-mail <span className="text-brand-500">{email}</span> estiver cadastrado, você receberá um link para redefinir sua senha.
            </p>
            <p className="text-xs text-zinc-500 font-mono">Verifique também a pasta de spam.</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-sharp w-full bg-brand-500 text-dark-bg font-bold uppercase tracking-widest py-3.5 hover:bg-brand-400 border border-brand-500 transition-colors duration-200 mt-4 shadow-[4px_4px_0px_rgba(85,202,124,0.2)]"
            >
              Voltar ao Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-xs text-zinc-500 font-mono text-center mb-4">
              Informe seu e-mail para receber o link de redefinição.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-zinc-600 group-focus-within:text-brand-500 transition-colors" strokeWidth={1.5} />
                </div>
                <input
                  type="email"
                  required
                  maxLength={120}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-dark-input border border-dark-border text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all rounded-none"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-mono text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-sharp w-full bg-brand-500 text-dark-bg font-bold uppercase tracking-widest py-3.5 hover:bg-brand-400 border border-brand-500 transition-colors duration-200 flex justify-center items-center mt-6 shadow-[4px_4px_0px_rgba(85,202,124,0.2)] disabled:opacity-70 disabled:cursor-wait"
            >
              {loading ? 'Enviando...' : 'Enviar Link'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center">
          <button onClick={() => navigate('/login')} className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1">
            <ChevronLeft className="w-3 h-3" /> Voltar ao login
          </button>
        </p>
      </div>
    </div>
  )
}
