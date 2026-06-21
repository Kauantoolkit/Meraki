import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TerminalSquare, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { passwordApi } from '../api/auth'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }
    passwordApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

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
          <p className="text-xs text-zinc-500 mt-1 font-mono tracking-wider">VERIFICAÇÃO.EMAIL</p>
        </div>

        <div className="text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-brand-500 mx-auto animate-spin" strokeWidth={1.5} />
              <p className="text-sm text-zinc-300 font-mono">Verificando seu email...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-brand-500 mx-auto" strokeWidth={1.5} />
              <p className="text-sm text-zinc-300 font-mono">Email verificado com sucesso!</p>
              <p className="text-xs text-zinc-500 font-mono">Sua conta está ativa. Faça login para continuar.</p>
              <button
                onClick={() => navigate('/login')}
                className="btn-sharp w-full bg-brand-500 text-dark-bg font-bold uppercase tracking-widest py-3.5 hover:bg-brand-400 border border-brand-500 transition-colors duration-200 mt-4 shadow-[4px_4px_0px_rgba(85,202,124,0.2)]"
              >
                Fazer Login
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-red-400 mx-auto" strokeWidth={1.5} />
              <p className="text-sm text-red-400 font-mono">Token inválido ou já utilizado.</p>
              <button
                onClick={() => navigate('/signup')}
                className="btn-sharp w-full bg-dark-input text-zinc-300 font-bold uppercase tracking-widest py-3.5 hover:bg-dark-card border border-dark-border transition-colors duration-200 mt-4"
              >
                Criar nova conta
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
