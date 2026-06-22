# Meraki — Colocar no Ar (Guia Rápido)

Tudo que você precisa para ir de código → produção em ~1 hora.

---

## Estado atual da infraestrutura

| O que já existe | Status |
|-----------------|--------|
| `backend/docker-compose.prod.yml` | ✅ Completo — Traefik + Let's Encrypt + 7 serviços + backup diário |
| `backend/traefik/dynamic.yml` | ✅ Security headers + rate limiting configurados |
| `backend/scripts/backup.sh` | ✅ pg_dump automático às 02:00, retenção 7 dias |
| `frontend/Dockerfile` | ✅ Multi-stage build (Node → nginx) |

**O único gap:** o serviço `frontend` não está no `docker-compose.prod.yml`. Está documentado como Passo 1 abaixo.

---

## Pré-requisitos

### 1. VPS

Recomendação: **Hetzner CX32** (~€8/mês)
- 4 vCPU, 8GB RAM, 80GB SSD
- Ubuntu 24.04

Por que 8GB: 7 serviços NestJS (~200MB cada) + 6 PostgreSQL (~100MB cada) + RabbitMQ + Traefik + nginx = ~3.5GB em uso, 8GB dá margem.

Mínimo absoluto: 4GB RAM (vai ficar apertado).

### 2. Domínio

Você precisa de **1 subdomínio** apontando para o IP da VPS:

```
meraki.seudominio.com   →  IP_DA_VPS    (frontend + API no mesmo host)
```

Registro A no seu DNS. Traefik cuida do SSL automaticamente.
O frontend fica na raiz (`meraki.seudominio.com`) e a API em `/api` (`meraki.seudominio.com/api`).

---

## Passo 1 — Verificar o docker-compose.prod.yml

O `docker-compose.prod.yml` já inclui todos os serviços (frontend, messaging-service, etc.) e está pronto para uso. Apenas verifique que o `.env` tem todas as variáveis documentadas acima.

Subdomínio configurado via Traefik:
- `meraki.${DOMAIN}` → frontend (nginx, porta 80) + API Gateway em `/api` (porta 3000)

---

## Passo 2 — Preparar o .env de produção

Criar `backend/.env.production` (nunca commitar este arquivo):

```env
# ── Domínio ──────────────────────────────────────────────────────────────────
DOMAIN=seudominio.com
ACME_EMAIL=seuemail@dominio.com

# ── JWT (gerar uma vez: openssl rand -base64 64) ──────────────────────────────
JWT_SECRET=GERAR_AQUI
JWT_ACCESS_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# ── Banco de dados (mesma senha para todos, simplifica) ───────────────────────
DB_USER=meraki_user
DB_PASS=GERAR_AQUI_openssl_rand_base64_32

IDENTITY_DB_NAME=identity_db
PROJECT_DB_NAME=project_db
BIDDING_DB_NAME=bidding_db
DELIVERY_DB_NAME=delivery_db
PAYMENT_DB_NAME=payment_db
PORTFOLIO_DB_NAME=portfolio_db
MESSAGING_DB_NAME=messaging_db

# ── RabbitMQ ──────────────────────────────────────────────────────────────────
RABBITMQ_USER=meraki_user
RABBITMQ_PASS=GERAR_AQUI_openssl_rand_base64_32
RABBITMQ_ERLANG_COOKIE=GERAR_AQUI_openssl_rand_base64_32

# ── SMTP (e-mail — Mailtrap ou outro provedor) ───────────────────────────
SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=GERAR_NO_MAILTRAP
SMTP_PASS=GERAR_NO_MAILTRAP

# ── Comunicação interna entre serviços ────────────────────────────────────
INTERNAL_API_KEY=GERAR_AQUI_openssl_rand_base64_32

# ── Mercado Pago ──────────────────────────────────────────────────────────
PAYMENT_PROVIDER=mercadopago
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxx-xxxx  # Pegar em https://www.mercadopago.com.br/developers

# ── Negócio ───────────────────────────────────────────────────────────────────
PLATFORM_FEE_RATE=0.10
BACKUP_RETENTION_DAYS=7
```

Para gerar os valores de senha/secret:
```bash
openssl rand -base64 64   # para JWT_SECRET
openssl rand -base64 32   # para DB_PASS, RABBITMQ_PASS, ERLANG_COOKIE
```

---

## Passo 3 — Configurar a VPS

```bash
# 1. Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 2. Clonar o repositório
git clone https://github.com/Kauantoolkit/Meraki.git
cd Meraki

# 3. Copiar o .env de produção que você preparou localmente
# (via scp, rsync, ou cole manualmente)
cp /caminho/para/.env.production backend/.env
```

---

## Passo 4 — Subir tudo

```bash
cd backend

# Build + subir todos os serviços (primeira vez demora ~10-15min pelo build)
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

# Acompanhar logs durante a subida
docker compose -f docker-compose.prod.yml logs -f
```

**Ordem automática:** Docker Compose respeita `depends_on` com healthcheck. Os bancos e o RabbitMQ sobem primeiro, depois os serviços.

---

## Passo 5 — Verificar que está no ar

```bash
# Ver status de todos os containers
docker compose -f docker-compose.prod.yml ps

# Todos devem estar "running" ou "healthy"
# Se algum reiniciando: docker compose logs <nome-do-servico>
```

### Smoke test manual

```bash
# 1. API respondendo
curl https://meraki.seudominio.com/api/health
# Esperado: 200 OK ou qualquer resposta (não 502/503)

# 2. Frontend carregando
curl -I https://meraki.seudominio.com
# Esperado: HTTP/2 200

# 3. Criar conta de empresa via API
curl -X POST https://meraki.seudominio.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"empresa@test.com","password":"Test@1234","name":"Empresa Teste","userType":"COMPANY"}'

# 4. Login e pegar token
curl -X POST https://meraki.seudominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"empresa@test.com","password":"Test@1234"}'
# Deve retornar accessToken
```

Se o smoke test passar, o sistema está no ar.

---

## Comandos do dia a dia

```bash
# Atualizar após novo push na main
cd ~/Meraki
git pull
cd backend
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

# Ver logs de um serviço específico
docker compose -f docker-compose.prod.yml logs -f identity-service

# Reiniciar um serviço específico (ex: após hotfix)
docker compose -f docker-compose.prod.yml restart api-gateway

# Parar tudo (mantém dados nos volumes)
docker compose -f docker-compose.prod.yml down

# Ver uso de recursos
docker stats
```

---

## Backup e restore

Backups rodam automaticamente todo dia às 02:00 em `/backups/` dentro do volume `db-backups`.

Para ver os backups:
```bash
docker exec meraki-db-backup ls /backups/
```

Para restaurar um banco:
```bash
docker exec -e PGPASSWORD=SUA_SENHA meraki-identity-db \
  pg_restore -h localhost -U meraki_user -d identity_db /backups/TIMESTAMP/identity.dump
```

---

## Problemas comuns

| Sintoma | Causa | Fix |
|---------|-------|-----|
| `502 Bad Gateway` | Serviço ainda subindo | Aguardar healthcheck; ver `docker compose ps` |
| `401` em tudo | `JWT_SECRET` errado | Confirmar que é o mesmo em todos os serviços; restartar gateway |
| Frontend não conecta na API | `VITE_API_URL` errado no build | Rebuildar frontend com a URL correta: `docker compose up -d --build frontend` |
| Banco não sobe | Volume corrompido ou senha errada | Ver `docker compose logs identity-db` |
| Let's Encrypt falha | DNS ainda não propagou | Aguardar até 48h após criar o registro A; testar com `dig app.seudominio.com` |
| `connection refused` no RabbitMQ | RabbitMQ ainda inicializando | Aguardar ~30s; os serviços têm retry automático |

---

## Requisitos mínimos de firewall

```bash
# Portas que devem estar abertas para o mundo
ufw allow 80/tcp    # HTTP (Traefik redireciona para HTTPS)
ufw allow 443/tcp   # HTTPS

# Portas que devem estar FECHADAS (acesso só interno entre containers)
# 3000-3006, 5432, 5672, 15672 — não expor
ufw enable
```

---

## O que NÃO está incluído neste deploy

| Feature | Motivo | Alternativa |
|---------|--------|-------------|
| Verificação de e-mail real | Fora de escopo (#55) | Cadastro sem verificação funciona |
| Upload de fotos | Fora de escopo (#51) | Avatares não exibem |
| Pagamento real (Pix) | Integrado via Mercado Pago sandbox | Definir `PAYMENT_PROVIDER=mercadopago` e `MERCADOPAGO_ACCESS_TOKEN` no .env |
| Notificações push | Fora de escopo (#50) | — |
| App mobile em produção | Flutter precisa rebuild com URL de produção | Build separado (ver abaixo) |

### Mobile: rebuild para produção

```bash
cd mobile
# Trocar BASE_URL no ApiClient para https://api.seudominio.com/api
flutter build apk --release
# ou
flutter build ios --release
```
