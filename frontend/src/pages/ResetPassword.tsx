import { useState, FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TerminalSquare, Key, Eye, EyeOff, CheckCircle, ChevronRight } from 'lucide-react'
import { passwordApi } from '../api/auth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await passwordApi.resetPassword(token, password)
      setSuccess(true)
    } catch {
      setError('Token inválido ou expirado. Solicite um novo link.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="bg-dark-bg bg-grid min-h-screen flex items-center justify-center p-4 antialiased text-zinc-300">
        <div className="w-full max-w-[420px] bg-dark-card/90 backdrop-blur-md border border-dark-border p-8 sm:p-10 relative z-10 shadow-2xl text-center">
          <p className="text-sm text-red-400 font-mono mb-4">Link inválido — token não encontrado.</p>
          <button
            onClick={() => navigate('/password-recovery')}
            className="btn-sharp bg-brand-500 text-dark-bg font-bold uppercase tracking-widest py-3 px-6 hover:bg-brand-400 border border-brand-500 transition-colors"
          >
            Solicitar novo link
          </button>
        </div>
      </div>
    )
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
          <p className="text-xs text-zinc-500 mt-1 font-mono tracking-wider">REDEFINIR.SENHA</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-brand-500 mx-auto" strokeWidth={1.5} />
            <p className="text-sm text-zinc-300 font-mono">Senha redefinida com sucesso!</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-sharp w-full bg-brand-500 text-dark-bg font-bold uppercase tracking-widest py-3.5 hover:bg-brand-400 border border-brand-500 transition-colors duration-200 mt-4 shadow-[4px_4px_0px_rgba(85,202,124,0.2)] flex justify-center items-center"
            >
              <span>Fazer Login</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">Nova Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-zinc-600 group-focus-within:text-brand-500 transition-colors" strokeWidth={1.5} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  maxLength={64}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-dark-input border border-dark-border text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all rounded-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-600 hover:text-zinc-400 outline-none">
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">Confirmar Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-zinc-600 group-focus-within:text-brand-500 transition-colors" strokeWidth={1.5} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  maxLength={64}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
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
              {loading ? 'Processando...' : 'Redefinir Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
