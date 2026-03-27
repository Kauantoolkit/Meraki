export enum WithdrawalStatus {
  PENDING = 'PENDING', // Aguardando aprovação
  APPROVED = 'APPROVED', // Aprovado para processamento
  PROCESSING = 'PROCESSING', // Em processamento
  COMPLETED = 'COMPLETED', // Completado
  REJECTED = 'REJECTED', // Rejeitado
  FAILED = 'FAILED', // Falhou no processamento
}
