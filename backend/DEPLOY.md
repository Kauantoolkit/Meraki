# Meraki — Guia de Deploy Distribuído

Cada microserviço roda em seu próprio servidor (ou VM). Um servidor de infra
separado hospeda o RabbitMQ, que é o único ponto compartilhado entre todos.

## Índice

1. [Arquitetura de deploy](#arquitetura-de-deploy)
2. [Servidor de infra (RabbitMQ)](#1-servidor-de-infra-rabbitmq)
3. [Deploy de cada microserviço](#2-deploy-de-cada-microserviço)
4. [Deploy do api-gateway](#3-deploy-do-api-gateway)
5. [Segredo compartilhado: JWT_SECRET](#segredo-compartilhado-jwt_secret)
6. [Alternativa: monorepo local (desenvolvimento)](#alternativa-monorepo-local-desenvolvimento)
7. [Comandos úteis](#comandos-úteis)

---

## Arquitetura de deploy

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Internet / Clientes                          │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS :443 / :3000
                    ┌───────────▼──────────┐
                    │     api-gateway       │  (stateless, sem banco)
                    │   Servidor Gateway    │
                    └──┬───┬───┬───┬───┬───┘
                       │   │   │   │   │   └─────────────────────────────────┐
                       │   │   │   │   └──── PORTFOLIO_SERVICE_URL           │
                       │   │   │   └──────── PAYMENT_SERVICE_URL             │
                       │   │   └──────────── DELIVERY_SERVICE_URL            │
                       │   └────────────────  BIDDING_SERVICE_URL            │
                       └──────────────────── PROJECT_SERVICE_URL             │
                                             IDENTITY_SERVICE_URL            │
                                                                              │
   ┌──────────────┐  ┌───────────────┐  ┌──────────────┐  ┌───────────────┐  │
   │  identity    │  │   project     │  │   bidding    │  │   delivery    │  │
   │  Servidor 1  │  │  Servidor 2   │  │  Servidor 3  │  │  Servidor 4   │  │
   │  :3001       │  │  :3002        │  │  :3003       │  │  :3004        │  │
   │  PostgreSQL  │  │  PostgreSQL   │  │  PostgreSQL  │  │  PostgreSQL   │  │
   └──────┬───────┘  └──────┬────────┘  └──────┬───────┘  └──────┬────────┘  │
          │                 │                  │                  │           │
   ┌──────────────┐  ┌──────────────┐          │                  │           │
   │   payment    │  │  portfolio   │          │                  │           │
   │  Servidor 5  │  │  Servidor 6  │          │                  │           │
   │  :3005       │  │  :3006       │          │                  │           │
   │  PostgreSQL  │  │  PostgreSQL  │          │                  │           │
   └──────┬───────┘  └──────┬───────┘          │                  │           │
          │                 │                  │                  │           │
          └─────────────────┴──────────────────┴──────────────────┴───────────┘
                                               │ AMQP :5672
                                  ┌────────────▼──────────┐
                                  │     Servidor Infra     │
                                  │  RabbitMQ :5672        │
                                  │  Management UI :15672  │
                                  └───────────────────────┘
```

---

## 1. Servidor de Infra (RabbitMQ)

Suba este servidor primeiro. Todos os microserviços dependem dele.

### Pré-requisitos

```bash
# Instalar Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Reconecte o SSH após isso
```

### Deploy

```bash
git clone https://github.com/<seu-org>/meraki.git ~/meraki
cd ~/meraki/backend

cp .env.infra.example .env
nano .env   # preencha RABBITMQ_USER, RABBITMQ_PASS, RABBITMQ_ERLANG_COOKIE

docker compose -f docker-compose.infra.yml up -d
```

### Verificar

```bash
docker compose -f docker-compose.infra.yml ps
# Management UI disponível em http://<IP_DO_SERVIDOR_INFRA>:15672
# Proteja a porta 15672 com firewall em produção — exposta só para uso interno
```

### Variáveis (.env para o servidor de infra)

| Variável | Descrição | Como gerar |
|---|---|---|
| `RABBITMQ_USER` | Usuário do RabbitMQ | Escolha um nome, ex: `meraki_user` |
| `RABBITMQ_PASS` | Senha do RabbitMQ | `openssl rand -base64 32` |
| `RABBITMQ_ERLANG_COOKIE` | Cookie interno do cluster Erlang | `openssl rand -base64 32` |

---

## 2. Deploy de cada microserviço

Repita este processo para cada um dos 6 serviços:
`identity-service`, `project-service`, `bidding-service`,
`delivery-service`, `payment-service`, `portfolio-service`

### Pré-requisitos (mesmo que o servidor de infra)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### Deploy

```bash
# Clone apenas o diretório do serviço (ou o repo inteiro)
git clone https://github.com/<seu-org>/meraki.git ~/meraki
cd ~/meraki/backend/<nome-do-serviço>

cp .env.example .env
nano .env   # preencha conforme a tabela abaixo

docker compose up -d
```

### Variáveis por serviço

Todas têm o mesmo conjunto base, exceto onde indicado:

| Variável | Descrição | Como gerar |
|---|---|---|
| `NODE_ENV` | Ambiente | `production` |
| `PORT` | Porta do serviço | Ver tabela de portas abaixo |
| `DB_NAME` | Nome do banco | Ver tabela de portas abaixo |
| `DB_USER` | Usuário PostgreSQL | Escolha um nome |
| `DB_PASS` | Senha PostgreSQL | `openssl rand -base64 32` |
| `JWT_SECRET` | Chave de assinatura JWT | `openssl rand -base64 64` — **idêntico em todos** |
| `JWT_EXPIRES_IN` | Validade do token | `7d` (só no identity-service) |
| `RABBITMQ_URL` | URL do RabbitMQ central | `amqp://user:pass@IP_INFRA:5672` |
| `PLATFORM_FEE_RATE` | Taxa da plataforma | `0.10` (só no payment-service) |

### Tabela de portas e nomes de banco

| Serviço | Porta padrão | DB_NAME |
|---|---|---|
| identity-service | 3001 | identity_db |
| project-service | 3002 | project_db |
| bidding-service | 3003 | bidding_db |
| delivery-service | 3004 | delivery_db |
| payment-service | 3005 | payment_db |
| portfolio-service | 3006 | portfolio_db |

### Verificar

```bash
docker compose ps
docker compose logs -f <nome-do-serviço>
# Swagger disponível em http://<IP_DO_SERVIDOR>:<PORTA>/api/docs
```

---

## 3. Deploy do api-gateway

O api-gateway é stateless — não tem banco de dados. Ele apenas roteia
requisições para os outros serviços via HTTP.

```bash
cd ~/meraki/backend/api-gateway

cp .env.example .env
nano .env   # preencha JWT_SECRET e as URLs de cada serviço

docker compose up -d
```

### Variáveis

| Variável | Valor |
|---|---|
| `JWT_SECRET` | **Idêntico** ao dos outros serviços |
| `IDENTITY_SERVICE_URL` | `http://<IP_SERVIDOR_1>:3001` |
| `PROJECT_SERVICE_URL` | `http://<IP_SERVIDOR_2>:3002` |
| `BIDDING_SERVICE_URL` | `http://<IP_SERVIDOR_3>:3003` |
| `DELIVERY_SERVICE_URL` | `http://<IP_SERVIDOR_4>:3004` |
| `PAYMENT_SERVICE_URL` | `http://<IP_SERVIDOR_5>:3005` |
| `PORTFOLIO_SERVICE_URL` | `http://<IP_SERVIDOR_6>:3006` |

---

## Segredo compartilhado: JWT_SECRET

O `JWT_SECRET` é o único valor que precisa ser **exatamente igual** em todos
os 7 servidores (api-gateway + 6 microserviços). O identity-service emite os
tokens; todos os outros os validam com a mesma chave.

```bash
# Gere uma vez e copie para todos os .env:
openssl rand -base64 64
```

Se esse valor divergir entre servidores, requisições serão rejeitadas com 401.

---

## Alternativa: monorepo local (desenvolvimento)

Para rodar tudo em uma única máquina durante desenvolvimento, use o
`docker-compose.yml` na raiz da pasta `backend/`:

```bash
cd backend/
cp .env.example .env        # ajuste as variáveis se necessário
docker compose up -d        # sobe todos os serviços + bancos + RabbitMQ
```

Este compose é apenas para desenvolvimento local — não é recomendado para produção.

---

## Comandos úteis

```bash
# Ver status do serviço
docker compose ps

# Ver logs em tempo real
docker compose logs -f <nome-do-serviço>

# Reiniciar apenas o serviço (sem derrubar o banco)
docker compose restart <nome-do-serviço>

# Parar tudo
docker compose down

# Parar e apagar volume do banco (DESTRUTIVO)
docker compose down -v

# Rebuild após mudança de código
docker compose up -d --build
```
