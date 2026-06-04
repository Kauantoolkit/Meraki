import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TerminalSquare, Mail, Key, Eye, EyeOff, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../api/auth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loginType, setLoginType] = useState<'company' | 'specialist'>('company')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { token, user } = await authApi.login({ email, password })
      login(token, user)
      navigate('/dashboard')
    } catch {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.')
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

        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 bg-dark-input border border-brand-500 flex items-center justify-center mb-4 shadow-[4px_4px_0px_rgba(85,202,124,0.2)]">
            <TerminalSquare className="text-brand-500 w-6 h-6" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase font-mono">Meraki</h1>
          <p className="text-xs text-zinc-500 mt-1 font-mono tracking-wider">
            SISTEMA.AUTENTICAÇÃO // {loginType === 'company' ? 'EMPRESA' : 'ESPECIALISTA'}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-dark-input p-1 flex mb-8 relative border border-dark-border">
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-dark-card border border-dark-border transition-transform duration-300 ease-in-out shadow-sm"
            style={{ transform: loginType === 'specialist' ? 'translateX(100%)' : 'translateX(0)' }}
          />
          <button
            data-testid="login-tab-company"
            onClick={() => setLoginType('company')}
            className={`flex-1 relative z-10 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${loginType === 'company' ? 'text-brand-500' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            Empresa
          </button>
          <button
            data-testid="login-tab-specialist"
            onClick={() => setLoginType('specialist')}
            className={`flex-1 relative z-10 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${loginType === 'specialist' ? 'text-brand-500' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            Especialista
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
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
                data-testid="login-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={loginType === 'company' ? 'admin@empresa.com' : 'dev@especialista.com'}
                className="w-full pl-11 pr-4 py-3 bg-dark-input border border-dark-border text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all rounded-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Senha</label>
              <button type="button" onClick={() => navigate('/password-recovery')} className="text-xs font-mono text-brand-500 hover:text-brand-400 transition-colors">
                Esqueceu?
              </button>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="h-4 w-4 text-zinc-600 group-focus-within:text-brand-500 transition-colors" strokeWidth={1.5} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                maxLength={64}
                data-testid="login-password"
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

          {error && (
            <p data-testid="login-error" className="text-xs font-mono text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit"
            className="btn-sharp w-full bg-brand-500 text-dark-bg font-bold uppercase tracking-widest py-3.5 hover:bg-brand-400 border border-brand-500 transition-colors duration-200 flex justify-center items-center mt-6 shadow-[4px_4px_0px_rgba(85,202,124,0.2)] disabled:opacity-70 disabled:cursor-wait"
          >
            <span>{loading ? 'Processando...' : 'Inicializar'}</span>
            {!loading && <ChevronRight className="w-4 h-4 ml-1" />}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-500 font-mono">
          SEM ACESSO?{' '}
          <button onClick={() => navigate('/signup')} className="font-bold text-brand-500 hover:text-brand-400 transition-colors ml-1 border-b border-brand-500/30 hover:border-brand-500">
            SOLICITAR REGISTRO
          </button>
        </p>
      </div>
    </div>
  )
}
