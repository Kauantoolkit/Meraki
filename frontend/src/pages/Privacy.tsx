import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'

export default function Privacy() {
  const navigate = useNavigate()
  return (
    <div className="bg-dark-bg bg-grid min-h-screen text-zinc-300 antialiased p-4 sm:p-8">
      {/* FORA DO ESCOPO INICIAL */}
      <div className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2.5 -mx-4 -mt-4 sm:-mx-8 sm:-mt-8 mb-8">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-amber-400 animate-pulse shrink-0" />
          <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest font-bold">
            FORA DO ESCOPO INICIAL — Esta tela não está prevista nos requisitos funcionais (RF01–RF14) do Meraki v1.0
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-mono text-xs text-zinc-500 hover:text-brand-500 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-brand-500" />
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Política de Privacidade</h1>
        </div>
        <div className="bg-dark-card border border-dark-border p-8 space-y-6 font-sans text-sm text-zinc-400 leading-relaxed">
          <section>
            <h2 className="font-mono font-bold text-white uppercase mb-2">1. Coleta de Dados</h2>
            <p>A Meraki coleta apenas os dados estritamente necessários para o funcionamento da plataforma: nome, e-mail, e dados de projetos e transações.</p>
          </section>
          <section>
            <h2 className="font-mono font-bold text-white uppercase mb-2">2. Uso dos Dados</h2>
            <p>Os dados são utilizados exclusivamente para autenticação, gerenciamento de projetos e processamento de pagamentos. Não compartilhamos dados com terceiros sem consentimento.</p>
          </section>
          <section>
            <h2 className="font-mono font-bold text-white uppercase mb-2">3. Segurança</h2>
            <p>Todos os dados são transmitidos via HTTPS e armazenados com criptografia. Senhas nunca são armazenadas em texto plano.</p>
          </section>
          <section>
            <h2 className="font-mono font-bold text-white uppercase mb-2">4. Seus Direitos</h2>
            <p>Você pode solicitar a exclusão da sua conta e dados a qualquer momento através do suporte técnico.</p>
          </section>
          <p className="font-mono text-[10px] text-zinc-600 pt-4 border-t border-dark-border">Última atualização: 2026. Meraki Platform.</p>
        </div>
      </div>
    </div>
  )
}
