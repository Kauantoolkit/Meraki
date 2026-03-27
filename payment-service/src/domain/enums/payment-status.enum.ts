export enum PaymentStatus {
  PENDING = 'PENDING', // Aguardando confirmação de pagamento
  PROCESSING = 'PROCESSING', // Em processamento
  COMPLETED = 'COMPLETED', // Pagamento concluído
  FAILED = 'FAILED', // Pagamento falhou
  CANCELLED = 'CANCELLED', // Pagamento cancelado
}
