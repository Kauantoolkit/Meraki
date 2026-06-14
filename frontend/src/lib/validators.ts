/**
 * Validadores reutilizáveis para formulários de bidding e delivery
 */

export interface ValidationError {
  field: string
  message: string
}

/**
 * Valida proposta de bidding antes de enviar
 */
export function validateBidForm(data: {
  projectId: string
  coverLetter: string
  amount: string | number
  duration: string | number
  milestoneProposals?: Array<{ proposedAmount: number }>
}): ValidationError[] {
  const errors: ValidationError[] = []

  // Validar proposta (cover letter)
  const proposal = String(data.coverLetter).trim()
  if (!proposal) {
    errors.push({ field: 'proposal', message: 'Proposta é obrigatória' })
  } else if (proposal.length < 20) {
    errors.push({ field: 'proposal', message: 'Proposta deve ter no mínimo 20 caracteres' })
  } else if (proposal.length > 2000) {
    errors.push({ field: 'proposal', message: 'Proposta não pode exceder 2000 caracteres' })
  }

  // Validar valor proposto
  const amount = Number(data.amount)
  if (!amount || amount <= 0) {
    errors.push({ field: 'proposedBudget', message: 'Valor proposto deve ser maior que 0' })
  } else if (amount < 0.01) {
    errors.push({ field: 'proposedBudget', message: 'Valor proposto deve ser no mínimo R$ 0.01' })
  }

  // Validar prazo
  const duration = Number(data.duration)
  if (!duration || duration <= 0) {
    errors.push({ field: 'estimatedDuration', message: 'Prazo deve ser um número positivo' })
  } else if (!Number.isInteger(duration)) {
    errors.push({ field: 'estimatedDuration', message: 'Prazo deve ser um número inteiro' })
  } else if (duration < 1) {
    errors.push({ field: 'estimatedDuration', message: 'Prazo mínimo é 1 dia' })
  } else if (duration > 3650) {
    errors.push({ field: 'estimatedDuration', message: 'Prazo máximo é 3650 dias (10 anos)' })
  }

  // Validar milestoneProposals se existem
  if (data.milestoneProposals && data.milestoneProposals.length > 0) {
    data.milestoneProposals.forEach((mp, idx) => {
      if (!mp.proposedAmount || mp.proposedAmount < 0.01) {
        errors.push({
          field: 'milestoneProposals',
          message: `Milestone ${idx + 1}: valor deve ser no mínimo R$ 0.01`,
        })
      }
    })
  }

  return errors
}

/**
 * Valida entrega (delivery) antes de enviar
 */
export function validateDeliveryForm(data: {
  projectId: string
  milestoneId: string
  deliveredFiles?: string[]
  deliveryNotes?: string
}): ValidationError[] {
  const errors: ValidationError[] = []

  // Validar que pelo menos arquivo ou nota foi preenchido
  const hasFiles = data.deliveredFiles && data.deliveredFiles.length > 0
  const hasNotes = data.deliveryNotes && String(data.deliveryNotes).trim().length > 0

  if (!hasFiles && !hasNotes) {
    errors.push({
      field: 'deliveredFiles',
      message: 'Adicione pelo menos um arquivo ou uma nota de entrega',
    })
  }

  // Validar quantidade de arquivos
  if (hasFiles && data.deliveredFiles!.length > 20) {
    errors.push({
      field: 'deliveredFiles',
      message: `Máximo 20 arquivos (você tem ${data.deliveredFiles!.length})`,
    })
  }

  // Validar notes
  if (hasNotes) {
    const notes = String(data.deliveryNotes).trim()
    if (notes.length > 2000) {
      errors.push({
        field: 'deliveryNotes',
        message: 'Notas não podem exceder 2000 caracteres',
      })
    }
  }

  return errors
}

/**
 * Formata array de ValidationError em string legível
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return ''
  if (errors.length === 1) return errors[0].message
  return errors.map(e => `• ${e.message}`).join('\n')
}

/**
 * Retorna erros de um campo específico
 */
export function getFieldErrors(errors: ValidationError[], field: string): string[] {
  return errors.filter(e => e.field === field).map(e => e.message)
}

/**
 * Valida um campo individual e retorna mensagem de erro
 */
export function validateField(
  field: 'proposal' | 'proposedBudget' | 'estimatedDuration' | 'deliveredFiles' | 'deliveryNotes',
  value: any,
): string {
  switch (field) {
    case 'proposal': {
      const text = String(value).trim()
      if (!text) return 'Campo obrigatório'
      if (text.length < 20) return 'Mínimo 20 caracteres'
      if (text.length > 2000) return 'Máximo 2000 caracteres'
      return ''
    }

    case 'proposedBudget': {
      const num = Number(value)
      if (!value || num <= 0) return 'Deve ser maior que 0'
      if (num < 0.01) return 'Mínimo R$ 0.01'
      return ''
    }

    case 'estimatedDuration': {
      const num = Number(value)
      if (!value || num <= 0) return 'Deve ser positivo'
      if (!Number.isInteger(num)) return 'Deve ser um inteiro'
      if (num < 1) return 'Mínimo 1 dia'
      if (num > 3650) return 'Máximo 3650 dias'
      return ''
    }

    case 'deliveryNotes': {
      const text = String(value).trim()
      if (text.length > 2000) return 'Máximo 2000 caracteres'
      return ''
    }

    default:
      return ''
  }
}
