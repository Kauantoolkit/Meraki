import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TerminalSquare, Mail, ArrowLeft } from 'lucide-react'

export default function PasswordRecovery() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="bg-dark-bg bg-grid min-h-screen flex items-center justify-center p-4 relative overflow-hidden antialiased text-zinc-300">
      <div className="fixed top-[10%] right-[20%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-brand-500/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[420px] bg-dark-card/90 backdrop-blur-md border border-dark-border p-8 sm:p-10 relative z-10 shadow-2xl">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-500" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-500" />

        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 bg-dark-input border border-brand-500 flex items-center justify-center mb-4 shadow-[4px_4px_0px_rgba(85,202,124,0.2)]">
            <TerminalSquare className="text-brand-500 w-6 h-6" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase font-mono">Recuperar Acesso</h1>
          <p className="text-xs text-zinc-500 mt-1 font-mono tracking-wider">SYS.AUTH // PASSWORD_RESET</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="bg-brand-500/10 border border-brand-500/30 p-4 mb-6">
              <p className="text-xs font-mono text-brand-500">Link de recuperação enviado.</p>
              <p className="text-xs text-zinc-400 mt-1">Verifique o seu e-mail: <span className="text-white">{email}</span></p>
            </div>
            <button onClick={() => navigate('/login')} className="w-full text-xs font-mono text-brand-500 hover:text-brand-400 flex items-center justify-center gap-2">
              <ArrowLeft className="w-3 h-3" /> Retornar ao login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-xs font-mono text-zinc-400 mb-4">Insira o e-mail associado à sua conta. Enviaremos um link para redefinir a senha.</p>
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-zinc-600 group-focus-within:text-brand-500 transition-colors" strokeWidth={1.5} />
                </div>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-dark-input border border-dark-border text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all rounded-none" />
              </div>
            </div>
            <button type="submit"
              className="btn-sharp w-full bg-brand-500 text-dark-bg font-bold uppercase tracking-widest py-3.5 hover:bg-brand-400 border border-brand-500 transition-colors mt-6 shadow-[4px_4px_0px_rgba(85,202,124,0.2)]">
              ENVIAR_LINK()
            </button>
            <button type="button" onClick={() => navigate('/login')} className="w-full text-xs font-mono text-zinc-500 hover:text-zinc-300 flex items-center justify-center gap-2 mt-2">
              <ArrowLeft className="w-3 h-3" /> Voltar ao login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
