#!/bin/bash
# Script de deploy — rode no servidor na primeira vez e a cada atualização.
# Pré-requisitos: Docker, Docker Compose v2, git instalados no servidor.
#
# Primeiro deploy:
#   1. Clone o repositório no servidor
#   2. cd backend/
#   3. cp .env.production.example .env.production
#   4. Edite .env.production com os valores reais
#   5. chmod +x deploy.sh && ./deploy.sh
#
# Deploys seguintes (após git pull):
#   ./deploy.sh

set -e

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

log() {
  echo ""
  echo ">>> $1"
}

# ── Verificações ───────────────────────────────────────────────────────────────

log "Verificando pré-requisitos..."

if ! command -v docker &> /dev/null; then
  echo "ERRO: Docker não encontrado. Instale com: curl -fsSL https://get.docker.com | sh"
  exit 1
fi

if ! docker compose version &> /dev/null; then
  echo "ERRO: Docker Compose v2 não encontrado."
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "ERRO: $ENV_FILE não encontrado."
  echo "      Copie .env.production.example para .env.production e preencha os valores."
  exit 1
fi

# Verifica se as variáveis críticas foram preenchidas
source "$ENV_FILE" 2>/dev/null || true
if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "api.seudominio.com" ]; then
  echo "ERRO: Variável DOMAIN não configurada em $ENV_FILE"
  exit 1
fi
if [ -z "$ACME_EMAIL" ] || [ "$ACME_EMAIL" = "seu@email.com" ]; then
  echo "ERRO: Variável ACME_EMAIL não configurada em $ENV_FILE"
  exit 1
fi
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "TROQUE_POR_SECRET_LONGO_E_ALEATORIO_AQUI" ]; then
  echo "ERRO: JWT_SECRET ainda está com valor padrão. Gere com: openssl rand -base64 64"
  exit 1
fi

# ── Setup de diretórios e arquivos ─────────────────────────────────────────────

log "Preparando estrutura de arquivos..."

mkdir -p traefik
mkdir -p scripts
mkdir -p backups

# acme.json precisa de permissão 600 ou o Traefik rejeita
ACME_FILE="traefik/letsencrypt/acme.json"
mkdir -p "$(dirname "$ACME_FILE")"
if [ ! -f "$ACME_FILE" ]; then
  touch "$ACME_FILE"
fi
chmod 600 "$ACME_FILE"

# Garante que os scripts de backup são executáveis
chmod +x scripts/backup.sh
chmod +x scripts/restore.sh

# ── Deploy ─────────────────────────────────────────────────────────────────────

log "Fazendo build e subindo containers..."

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull --ignore-pull-failures 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

log "Aguardando serviços ficarem healthy..."
sleep 10

# ── Status ─────────────────────────────────────────────────────────────────────

log "Status dos containers:"
docker compose -f "$COMPOSE_FILE" ps

log "Limpando imagens não utilizadas..."
docker image prune -f

echo ""
echo "=================================================="
echo " Deploy concluído!"
echo ""
echo " API:     https://$DOMAIN"
echo " Backup:  Todo dia às 02:00 (ver: docker logs meraki-db-backup)"
echo ""
echo " Comandos úteis:"
echo "   Ver logs:    docker compose -f $COMPOSE_FILE logs -f <serviço>"
echo "   Restaurar:   docker compose -f $COMPOSE_FILE exec db-backup /scripts/restore.sh <serviço> <timestamp>"
echo "   Parar tudo:  docker compose -f $COMPOSE_FILE down"
echo "=================================================="
