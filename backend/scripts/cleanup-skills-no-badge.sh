#!/bin/bash
# Remove skills sem badge dos bancos identity_db e portfolio_db.
# Rodar com: bash backend/scripts/cleanup-skills-no-badge.sh

set -e

DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-postgres}"

SQL='UPDATE specialist_profiles
     SET skills = NULL, "skillBadges" = '"'"'{}'"'"'
     WHERE skills IS NOT NULL
       AND skills != '"'"''"'"'
       AND ("skillBadges" IS NULL OR "skillBadges" = '"'"'{}'"'"' OR "skillBadges" = '"'"'null'"'"');'

echo "==> Limpando identity_db..."
PGPASSWORD="$DB_PASS" psql -h localhost -p 5432 -U "$DB_USER" -d identity_db -c "$SQL"

echo "==> Limpando portfolio_db..."
PGPASSWORD="$DB_PASS" psql -h localhost -p 5432 -U "$DB_USER" -d portfolio_db -c "$SQL"

echo "==> Concluído. Skills sem badge removidas de ambos os bancos."
