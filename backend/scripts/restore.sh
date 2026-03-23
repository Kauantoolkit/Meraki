#!/bin/sh
# Restaura um banco específico a partir de um backup
#
# Uso:
#   docker compose -f docker-compose.prod.yml exec db-backup \
#     /scripts/restore.sh <serviço> <timestamp>
#
# Exemplo:
#   docker compose -f docker-compose.prod.yml exec db-backup \
#     /scripts/restore.sh payment 20240322_020000
#
# Serviços disponíveis: identity, project, bidding, delivery, payment, portfolio

set -e

SERVICE="$1"
TIMESTAMP="$2"
BACKUP_DIR="/backups"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Validação de argumentos
if [ -z "$SERVICE" ] || [ -z "$TIMESTAMP" ]; then
  echo ""
  echo "Uso: $0 <serviço> <timestamp>"
  echo ""
  echo "Serviços disponíveis: identity, project, bidding, delivery, payment, portfolio"
  echo ""
  echo "Backups disponíveis:"
  if [ -d "$BACKUP_DIR" ]; then
    find "$BACKUP_DIR" -maxdepth 1 -mindepth 1 -type d | sort | while read -r d; do
      ts=$(basename "$d")
      echo "  $ts"
      find "$d" -name "*.dump" | while read -r f; do
        size=$(du -sh "$f" | cut -f1)
        echo "    └─ $(basename "$f" .dump)  ($size)"
      done
    done
  else
    echo "  (nenhum backup encontrado)"
  fi
  echo ""
  exit 1
fi

# Mapear serviço → host e banco
case "$SERVICE" in
  identity)
    DB_HOST="identity-db"
    DBNAME="$IDENTITY_DB_NAME"
    ;;
  project)
    DB_HOST="project-db"
    DBNAME="$PROJECT_DB_NAME"
    ;;
  bidding)
    DB_HOST="bidding-db"
    DBNAME="$BIDDING_DB_NAME"
    ;;
  delivery)
    DB_HOST="delivery-db"
    DBNAME="$DELIVERY_DB_NAME"
    ;;
  payment)
    DB_HOST="payment-db"
    DBNAME="$PAYMENT_DB_NAME"
    ;;
  portfolio)
    DB_HOST="portfolio-db"
    DBNAME="$PORTFOLIO_DB_NAME"
    ;;
  *)
    echo "Serviço inválido: '$SERVICE'"
    echo "Serviços disponíveis: identity, project, bidding, delivery, payment, portfolio"
    exit 1
    ;;
esac

DUMP_FILE="$BACKUP_DIR/$TIMESTAMP/${SERVICE}.dump"

if [ ! -f "$DUMP_FILE" ]; then
  log "ERRO: Arquivo de backup não encontrado: $DUMP_FILE"
  log "Execute '$0' sem argumentos para ver os backups disponíveis."
  exit 1
fi

DUMP_SIZE=$(du -sh "$DUMP_FILE" | cut -f1)

log "========================================"
log "RESTORE — Meraki"
log "========================================"
log "Serviço   : $SERVICE"
log "Banco     : $DBNAME"
log "Host      : $DB_HOST"
log "Arquivo   : $DUMP_FILE ($DUMP_SIZE)"
log "========================================"
log "ATENÇÃO: Esta operação vai sobrescrever os dados atuais de '$DBNAME'."
log "Cancele com Ctrl+C nos próximos 10 segundos..."
sleep 10

log "Iniciando restore..."

PGPASSWORD="$DB_PASS" pg_restore \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -d "$DBNAME" \
  --clean \
  --if-exists \
  --no-password \
  "$DUMP_FILE"

log "========================================"
log "Restore de '$SERVICE' concluído com sucesso."
log "========================================"
