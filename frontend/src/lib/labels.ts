// Rótulos em português para os valores de status do backend (exibição na UI).
// Centraliza a tradução para não vazar valores crus (OPEN, IN_PROGRESS...) na tela.

export const projectStatusLabel: Record<string, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}

export const milestoneStatusLabel: Record<string, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Andamento',
  SUBMITTED: 'Submetido',
  APPROVED: 'Aprovado',
}

export const bidStatusLabel: Record<string, string> = {
  PENDING: 'Pendente',
  ACCEPTED: 'Aceite',
  REJECTED: 'Rejeitado',
  WITHDRAWN: 'Retirado',
}

export const paymentStatusLabel: Record<string, string> = {
  PENDING: 'Pendente',
  RELEASED: 'Liberado',
  REFUNDED: 'Reembolsado',
}

/** Rótulo genérico: procura em todos os mapas e cai no próprio valor se não achar. */
export function statusLabel(value?: string): string {
  if (!value) return '—'
  return (
    projectStatusLabel[value] ??
    milestoneStatusLabel[value] ??
    bidStatusLabel[value] ??
    paymentStatusLabel[value] ??
    value
  )
}
