import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, User, Mail, Key, UserPlus, Building2, Braces } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../api/auth'

export default function Signup() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [type, setType] = useState<'company' | 'specialist'>('company')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.register({ name, email, password, type })
      login(res.data.access_token, res.data.user)
      navigate('/dashboard')
    } catch {
      setError('Erro ao criar conta. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark-bg bg-grid min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden antialiased text-zinc-300">
      <div className="fixed top-[10%] left-[60%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-brand-500/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[480px] bg-dark-card/90 backdrop-blur-md border border-dark-border p-8 sm:p-10 relative z-10 shadow-2xl">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-500" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 bg-dark-input border border-brand-500 flex items-center justify-center mb-4 shadow-[4px_4px_0px_rgba(85,202,124,0.2)]">
            <ShieldCheck className="text-brand-500 w-6 h-6" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase font-mono">Registo</h1>
          <p className="text-xs text-zinc-500 mt-1 font-mono tracking-wider">SYS.ONBOARDING // INITIALIZE</p>
        </div>

        {/* Type selector */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setType('company')}
            className={`flex flex-col items-center justify-center p-4 bg-dark-input border transition-colors ${type === 'company' ? 'border-brand-500 text-brand-500' : 'border-dark-border text-zinc-500 hover:border-zinc-500 hover:text-zinc-400'}`}
          >
            <Building2 className="w-6 h-6 mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest">Empresa</span>
          </button>
          <button
            type="button"
            onClick={() => setType('specialist')}
            className={`flex flex-col items-center justify-center p-4 bg-dark-input border transition-colors ${type === 'specialist' ? 'border-brand-500 text-brand-500' : 'border-dark-border text-zinc-500 hover:border-zinc-500 hover:text-zinc-400'}`}
          >
            <Braces className="w-6 h-6 mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest">Especialista</span>
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
              {type === 'company' ? 'Nome da Empresa' : 'Nome / Handle Desenvolvedor'}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-zinc-600 group-focus-within:text-brand-500 transition-colors" strokeWidth={1.5} />
              </div>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder={type === 'company' ? 'Nova Corp S/A' : 'dev.username'}
                className="w-full pl-11 pr-4 py-3 bg-dark-input border border-dark-border text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all rounded-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">E-mail Profissional</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-zinc-600 group-focus-within:text-brand-500 transition-colors" strokeWidth={1.5} />
              </div>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder={type === 'company' ? 'admin@empresa.com' : 'dev@especialista.com'}
                className="w-full pl-11 pr-4 py-3 bg-dark-input border border-dark-border text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all rounded-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">Senha Segura</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="h-4 w-4 text-zinc-600 group-focus-within:text-brand-500 transition-colors" strokeWidth={1.5} />
              </div>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" minLength={6}
                className="w-full pl-11 pr-4 py-3 bg-dark-input border border-dark-border text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all rounded-none" />
            </div>
          </div>

          {error && <p className="text-xs font-mono text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="btn-sharp w-full bg-brand-500 text-dark-bg font-bold uppercase tracking-widest py-3.5 hover:bg-brand-400 border border-brand-500 transition-colors duration-200 flex justify-center items-center mt-6 shadow-[4px_4px_0px_rgba(85,202,124,0.2)] disabled:opacity-70 disabled:cursor-wait">
            <span>{loading ? 'Criando Nodo...' : 'Criar Conta'}</span>
            {!loading && <UserPlus className="w-4 h-4 ml-2" />}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-500 font-mono">
          JÁ TEM ACESSO?{' '}
          <button onClick={() => navigate('/login')} className="font-bold text-brand-500 hover:text-brand-400 transition-colors ml-1 border-b border-brand-500/30 hover:border-brand-500">
            RETORNAR AO LOGIN
          </button>
        </p>
      </div>
    </div>
  )
}
