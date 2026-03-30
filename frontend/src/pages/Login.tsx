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
      const res = await authApi.login({ email, password })
      login(res.data.access_token, res.data.user)
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
            SYS.AUTH // {loginType === 'company' ? 'COMPANY' : 'SPECIALIST'}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-dark-input p-1 flex mb-8 relative border border-dark-border">
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-dark-card border border-dark-border transition-transform duration-300 ease-in-out shadow-sm"
            style={{ transform: loginType === 'specialist' ? 'translateX(100%)' : 'translateX(0)' }}
          />
          <button
            onClick={() => setLoginType('company')}
            className={`flex-1 relative z-10 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${loginType === 'company' ? 'text-brand-500' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            Empresa
          </button>
          <button
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
            <p className="text-xs font-mono text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-sharp w-full bg-brand-500 text-dark-bg font-bold uppercase tracking-widest py-3.5 hover:bg-brand-400 border border-brand-500 transition-colors duration-200 flex justify-center items-center mt-6 shadow-[4px_4px_0px_rgba(85,202,124,0.2)] disabled:opacity-70 disabled:cursor-wait"
          >
            <span>{loading ? 'Processando...' : 'Inicializar'}</span>
            {!loading && <ChevronRight className="w-4 h-4 ml-1" />}
          </button>
        </form>

        <div className="mt-8 mb-6 flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-border" /></div>
          <div className="relative px-4 bg-dark-card">
            <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">External Auth</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" className="flex items-center justify-center w-full px-4 py-2.5 bg-dark-input border border-dark-border hover:border-zinc-600 transition-colors duration-200 group rounded-none">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors">Google</span>
          </button>
          <button type="button" className="flex items-center justify-center w-full px-4 py-2.5 bg-dark-input border border-dark-border hover:border-zinc-600 transition-colors duration-200 group rounded-none">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors">LinkedIn</span>
          </button>
        </div>

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
