# Meraki — Guia de Deploy em Produção

## Índice
1. [Como as variáveis funcionam](#como-as-variáveis-funcionam)
2. [Referência completa de variáveis](#referência-completa-de-variáveis)
3. [GitHub Secrets (CI/CD)](#github-secrets-cicd)
4. [Passo a passo do primeiro deploy](#passo-a-passo-do-primeiro-deploy)
5. [Deploys seguintes (automático via push)](#deploys-seguintes)
6. [Backup e restore](#backup-e-restore)

---

## Como as variáveis funcionam

```
Desenvolvimento local
  └── backend/.env  →  lido pelo docker-compose.yml
  └── <serviço>/.env  →  lido pelo serviço se rodar fora do Docker

Produção
  └── backend/.env.production  →  lido pelo docker-compose.prod.yml
      O compose injeta as variáveis em cada container.
      Os serviços NÃO precisam de .env próprio em produção.
```

**Você só precisa preencher um arquivo para subir em produção: `.env.production`.**

---

## Referência completa de variáveis

### `.env.production` — todas as variáveis necessárias

| Variável | Onde é usada | Como gerar |
|---|---|---|
| `DOMAIN` | Traefik (rota HTTPS) | URL do seu servidor, ex: `api.meraki.com.br` |
| `ACME_EMAIL` | Traefik (Let's Encrypt) | Qualquer email seu |
| `DB_USER` | Todos os bancos PostgreSQL | Escolha um nome, ex: `meraki_user` |
| `DB_PASS` | Todos os bancos PostgreSQL | `openssl rand -base64 32` |
| `IDENTITY_DB_NAME` | identity-service | Deixar `identity_db` |
| `PROJECT_DB_NAME` | project-service | Deixar `project_db` |
| `BIDDING_DB_NAME` | bidding-service | Deixar `bidding_db` |
| `DELIVERY_DB_NAME` | delivery-service | Deixar `delivery_db` |
| `PAYMENT_DB_NAME` | payment-service | Deixar `payment_db` |
| `PORTFOLIO_DB_NAME` | portfolio-service | Deixar `portfolio_db` |
| `RABBITMQ_USER` | RabbitMQ + todos os serviços | Escolha um nome |
| `RABBITMQ_PASS` | RabbitMQ + todos os serviços | `openssl rand -base64 32` |
| `JWT_SECRET` | identity-service (assina) + todos (validam) | `openssl rand -base64 64` |
| `JWT_EXPIRES_IN` | identity-service | Deixar `7d` |
| `PLATFORM_FEE_RATE` | payment-service | `0.10` = 10% |
| `BACKUP_RETENTION_DAYS` | db-backup | `7` (dias) |

#### Como cada variável chega em cada serviço

```
.env.production
│
├── DOMAIN, ACME_EMAIL
│   └── → traefik (labels no api-gateway)
│
├── DB_USER, DB_PASS
│   ├── → identity-db   (POSTGRES_USER / POSTGRES_PASSWORD)
│   ├── → project-db    (POSTGRES_USER / POSTGRES_PASSWORD)
│   ├── → bidding-db    (POSTGRES_USER / POSTGRES_PASSWORD)
│   ├── → delivery-db   (POSTGRES_USER / POSTGRES_PASSWORD)
│   ├── → payment-db    (POSTGRES_USER / POSTGRES_PASSWORD)
│   ├── → portfolio-db  (POSTGRES_USER / POSTGRES_PASSWORD)
│   │
│   ├── → identity-service  como DB_USERNAME / DB_PASSWORD  ← TypeORM
│   ├── → project-service   como DB_USER / DB_PASS
│   ├── → bidding-service   como DB_USER / DB_PASS
│   ├── → delivery-service  como DB_USER / DB_PASS
│   ├── → payment-service   como DB_USER / DB_PASS
│   ├── → portfolio-service como DB_USER / DB_PASS
│   └── → db-backup         como DB_USER / DB_PASS
│
├── RABBITMQ_USER, RABBITMQ_PASS
│   ├── → rabbitmq (RABBITMQ_DEFAULT_USER / RABBITMQ_DEFAULT_PASS)
│   └── → todos os serviços (montados em RABBITMQ_URL=amqp://user:pass@rabbitmq:5672)
│
├── JWT_SECRET, JWT_EXPIRES_IN
│   └── → api-gateway + identity-service + project-service + bidding-service
│       + delivery-service + payment-service + portfolio-service
│
└── PLATFORM_FEE_RATE
    └── → payment-service
```

> **Detalhe importante:** O `identity-service` usa `DB_USERNAME`/`DB_PASSWORD`
> (convenção do TypeORM), enquanto os demais usam `DB_USER`/`DB_PASS`.
> O `docker-compose.prod.yml` já trata isso corretamente — você não precisa
> fazer nada diferente no `.env.production`.

---

## GitHub Secrets (CI/CD)

Esses valores ficam no GitHub, **não** no `.env.production`.
Acesse: `github.com/<seu-org>/<repo>` → Settings → Secrets and variables → Actions

| Secret | Valor |
|---|---|
| `SERVER_HOST` | IP ou hostname do servidor (ex: `157.230.10.5`) |
| `SERVER_USER` | Usuário SSH no servidor (ex: `ubuntu`, `root`) |
| `SERVER_SSH_KEY` | Conteúdo da chave SSH privada (começa com `-----BEGIN...`) |
| `SERVER_PORT` | Porta SSH (opcional, padrão `22`) |
| `SERVER_PATH` | Caminho absoluto do repositório no servidor (ex: `/home/ubuntu/meraki`) |

### Como gerar e configurar a chave SSH

```bash
# No seu computador local, gere um par de chaves dedicado para o deploy:
ssh-keygen -t ed25519 -C "meraki-deploy" -f ~/.ssh/meraki_deploy

# Copie a chave pública para o servidor:
ssh-copy-id -i ~/.ssh/meraki_deploy.pub usuario@ip-do-servidor

# Adicione o conteúdo da chave PRIVADA ao GitHub Secret SERVER_SSH_KEY:
cat ~/.ssh/meraki_deploy
```

---

## Passo a passo do primeiro deploy

### 1. Servidor — pré-requisitos

```bash
# Instalar Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Reconectar SSH após isso

# Verificar
docker --version
docker compose version
```

### 2. Servidor — clonar o repositório

```bash
git clone https://github.com/<seu-org>/meraki.git ~/meraki
cd ~/meraki/backend
```

### 3. Servidor — criar `.env.production`

```bash
cp .env.production.example .env.production
nano .env.production   # preencha todos os valores
```

Gere os secrets de forma segura:
```bash
# DB_PASS e RABBITMQ_PASS
openssl rand -base64 32

# JWT_SECRET (mais longo)
openssl rand -base64 64
```

### 4. Servidor — primeiro deploy

```bash
chmod +x deploy.sh scripts/backup.sh scripts/restore.sh
./deploy.sh
```

O script irá:
- Validar que todas as variáveis críticas foram preenchidas
- Criar `traefik/letsencrypt/acme.json` com permissão 600
- Subir todos os containers com `docker compose -f docker-compose.prod.yml up -d --build`

### 5. GitHub — configurar os Secrets

Vá em: `github.com/<org>/<repo>/settings/secrets/actions`

Crie os 5 secrets listados na seção [GitHub Secrets](#github-secrets-cicd).

### 6. Testar o CI/CD

Faça qualquer commit na branch `main`:
```bash
git push origin main
```

O GitHub Actions irá:
1. Conectar no servidor via SSH
2. `git pull origin main`
3. `./deploy.sh` (rebuilda só o que mudou)

---

## Deploys seguintes

Após o setup inicial, basta fazer push para `main`. O deploy é automático.

Para deploy manual no servidor:
```bash
cd ~/meraki
git pull origin main
cd backend/
./deploy.sh
```

---

## Backup e restore

### Verificar backups existentes

```bash
docker exec meraki-db-backup find /backups -maxdepth 1 -mindepth 1 -type d | sort
```

### Forçar backup imediato (sem esperar o cron das 02:00)

```bash
docker exec meraki-db-backup /scripts/backup.sh
```

### Ver logs de backup

```bash
docker logs meraki-db-backup
```

### Restaurar um banco específico

```bash
# Sintaxe:
docker compose -f docker-compose.prod.yml exec db-backup \
  /scripts/restore.sh <serviço> <timestamp>

# Exemplo — restaurar payment do backup de 22/03/2024 às 02:00:
docker compose -f docker-compose.prod.yml exec db-backup \
  /scripts/restore.sh payment 20240322_020000
```

Serviços disponíveis: `identity`, `project`, `bidding`, `delivery`, `payment`, `portfolio`

---

## Comandos úteis no servidor

```bash
# Ver status de todos os containers
docker compose -f docker-compose.prod.yml ps

# Ver logs de um serviço
docker compose -f docker-compose.prod.yml logs -f api-gateway

# Reiniciar um serviço sem derrubar os outros
docker compose -f docker-compose.prod.yml restart payment-service

# Parar tudo
docker compose -f docker-compose.prod.yml down

# Parar e apagar volumes (DESTRUTIVO — apaga todos os dados)
docker compose -f docker-compose.prod.yml down -v
```
