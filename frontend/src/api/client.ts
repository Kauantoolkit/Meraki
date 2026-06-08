import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Injeta JWT em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('meraki_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/**
 * Mapeia mensagens de erro do class-validator para campos específicos.
 * Exemplo: "proposal must be longer than or equal to 20 characters" → "Proposta: deve ter no mínimo 20 caracteres"
 */
function mapValidationError(msg: string): string {
  // Mapeamento de campos
  const fieldMap: Record<string, string> = {
    proposal: 'Proposta',
    proposedBudget: 'Valor proposto',
    estimatedDuration: 'Prazo em dias',
    projectId: 'ID do projeto',
    milestoneId: 'ID do milestone',
    deliveredFiles: 'Arquivos entregues',
    deliveryNotes: 'Notas da entrega',
    milestoneProposals: 'Propostas por milestone',
  }

  // Mapeamento de mensagens de erro
  const errorMap: Record<string, (field: string) => string> = {
    'must be longer than or equal to': (f) => `${fieldMap[f] || f}: mínimo de caracteres requerido`,
    'must be shorter than or equal to': (f) => `${fieldMap[f] || f}: máximo de caracteres excedido`,
    'must be a UUID': (f) => `${fieldMap[f] || f}: formato inválido`,
    'must be a string': (f) => `${fieldMap[f] || f}: deve ser texto`,
    'must be a number': (f) => `${fieldMap[f] || f}: deve ser um número`,
    'must not be less than': (f) => `${fieldMap[f] || f}: valor muito baixo`,
    'must be a valid integer': (f) => `${fieldMap[f] || f}: deve ser um número inteiro`,
    'array must contain no more than': (f) => `${fieldMap[f] || f}: muitos itens`,
  }

  // Extrai o campo da mensagem (ex: "proposal must be..." → "proposal")
  const fieldMatch = msg.match(/^(\w+)\s/) || []
  const field = fieldMatch[1] || 'Campo'

  // Procura pelo tipo de erro e mapeia
  for (const [errorKey, formatter] of Object.entries(errorMap)) {
    if (msg.includes(errorKey)) {
      return formatter(field)
    }
  }

  // Se não encontrar mapeamento, retorna a mensagem original (em português se possível)
  return msg
}

/** 
 * Extrai e formata erros da API de forma clara e por campo.
 * Suporta: string simples, array de strings (class-validator), ou objeto com campos específicos.
 */
export function extractApiError(err: unknown, fallback = 'Verifique os dados e tente novamente.'): string {
  const data = (err as any)?.response?.data

  // Caso 1: Array de mensagens (validação do class-validator)
  if (Array.isArray(data?.message)) {
    const mapped = data.message
      .map(mapValidationError)
      .join(' | ')
    return mapped || fallback
  }

  // Caso 2: String única
  if (typeof data?.message === 'string') {
    return mapValidationError(data.message)
  }

  // Caso 3: Erro genérico
  if (typeof data?.error === 'string') {
    return data.error
  }

  return fallback
}

// Notifica o AuthContext quando o token expirar (sem hard reload)
// Ignora rotas de auth para não interferir com credenciais inválidas
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url: string = error.config?.url ?? ''
    const isAuthRoute = url.includes('/auth/')
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('meraki_token')
      localStorage.removeItem('meraki_user')
      window.dispatchEvent(new CustomEvent('meraki:unauthorized'))
    }
    return Promise.reject(error)
  },
)
