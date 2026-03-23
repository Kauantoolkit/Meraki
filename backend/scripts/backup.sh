#!/bin/sh
# Backup automático de todos os bancos PostgreSQL do Meraki
# Executado pelo crond do container db-backup todo dia às 02:00
# Mantém backups dos últimos BACKUP_RETENTION_DAYS dias

set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DAY_DIR="$BACKUP_DIR/$TIMESTAMP"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

mkdir -p "$DAY_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

backup_db() {
  local label="$1"
  local host="$2"
  local dbname="$3"
  local outfile="$DAY_DIR/${label}.dump"

  log "Iniciando backup: $label ($dbname @ $host)"

  if PGPASSWORD="$DB_PASS" pg_dump \
      -h "$host" \
      -U "$DB_USER" \
      -d "$dbname" \
      --format=custom \
      --no-password \
      -f "$outfile"; then
    local size
    size=$(du -sh "$outfile" | cut -f1)
    log "OK  $label — $size"
  else
    log "ERRO $label — falha no pg_dump"
    rm -f "$outfile"
    return 1
  fi
}

log "========================================"
log "Meraki Backup — $TIMESTAMP"
log "Retenção: $RETENTION_DAYS dias"
log "========================================"

ERRORS=0

backup_db "identity"  "identity-db"  "$IDENTITY_DB_NAME"  || ERRORS=$((ERRORS + 1))
backup_db "project"   "project-db"   "$PROJECT_DB_NAME"   || ERRORS=$((ERRORS + 1))
backup_db "bidding"   "bidding-db"   "$BIDDING_DB_NAME"   || ERRORS=$((ERRORS + 1))
backup_db "delivery"  "delivery-db"  "$DELIVERY_DB_NAME"  || ERRORS=$((ERRORS + 1))
backup_db "payment"   "payment-db"   "$PAYMENT_DB_NAME"   || ERRORS=$((ERRORS + 1))
backup_db "portfolio" "portfolio-db" "$PORTFOLIO_DB_NAME" || ERRORS=$((ERRORS + 1))

log "----------------------------------------"
log "Limpando backups com mais de $RETENTION_DAYS dias..."
find "$BACKUP_DIR" -maxdepth 1 -mindepth 1 -type d -mtime "+$RETENTION_DAYS" | while read -r old_dir; do
  log "Removendo: $old_dir"
  rm -rf "$old_dir"
done

log "========================================"
if [ "$ERRORS" -eq 0 ]; then
  log "Backup concluído com sucesso."
else
  log "Backup concluído com $ERRORS erro(s). Verifique os logs acima."
fi

log "Backups disponíveis:"
find "$BACKUP_DIR" -maxdepth 1 -mindepth 1 -type d | sort | while read -r d; do
  total=$(du -sh "$d" 2>/dev/null | cut -f1)
  log "  $(basename "$d")  ($total)"
done
log "========================================"

exit "$ERRORS"
