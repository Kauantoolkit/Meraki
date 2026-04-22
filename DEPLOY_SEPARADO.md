# Meraki — Deploy em Repositórios Separados

Guia completo para separar os serviços em repos independentes e fazer deploy
em servidores distintos.

---

## Estrutura de repos recomendada

```
meraki-infra            → RabbitMQ central (docker-compose.infra.yml)
meraki-api-gateway      → api-gateway/
meraki-identity-service → identity-service/
meraki-project-service  → project-service/
meraki-bidding-service  → bidding-service/
meraki-delivery-service → delivery-service/
meraki-payment-service  → payment-service/
meraki-portfolio-service→ portfolio-service/
```

Cada repo contém apenas o conteúdo da pasta correspondente em `backend/`.

---

## Pré-requisito: Docker em todos os servidores

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Reconecte o SSH
docker --version && docker compose version
```

---

## Ordem de deploy

```
1. meraki-infra           (RabbitMQ — todos dependem dele)
2. meraki-identity-service
3. meraki-project-service
4. meraki-bidding-service
5. meraki-delivery-service
6. meraki-payment-service
7. meraki-portfolio-service
8. meraki-api-gateway     (por último — depende dos outros 6)
```

---

## Segredo crítico: JWT_SECRET

O `JWT_SECRET` deve ser **exatamente igual** em todos os 8 repos/servidores.
Gere uma vez e copie para todos:

```bash
openssl rand -base64 64
```

Se divergir entre servidores, requisições serão rejeitadas com `401 Unauthorized`.

---

## 1. meraki-infra

**Conteúdo do repo:** `docker-compose.infra.yml` + `.env.infra.example`

```bash
# No servidor de infra
cp .env.infra.example .env
```

Preencha o `.env`:

```env
RABBITMQ_USER=meraki_user
RABBITMQ_PASS=<openssl rand -base64 32>
RABBITMQ_ERLANG_COOKIE=<openssl rand -base64 32>
```

```bash
docker compose -f docker-compose.infra.yml up -d

# Verificar
docker compose -f docker-compose.infra.yml ps
# Management UI: http://<IP_INFRA>:15672
# Proteja :15672 com firewall — só para acesso interno/administrativo
```

A `RABBITMQ_URL` que todos os outros serviços usarão:
```
amqp://meraki_user:<RABBITMQ_PASS>@<IP_INFRA>:5672
```

---

## 2. identity-service

**Porta:** `3001` | **Banco:** `identity_db`

```bash
cp .env.example .env
```

```env
NODE_ENV=production
PORT=3001
DB_NAME=identity_db
DB_USER=meraki_user
DB_PASS=<openssl rand -base64 32>
JWT_SECRET=<mesmo valor gerado anteriormente>
JWT_EXPIRES_IN=7d
RABBITMQ_URL=amqp://meraki_user:<RABBITMQ_PASS>@<IP_INFRA>:5672
```

```bash
docker compose up -d
docker compose logs -f identity-service
# Swagger: http://<IP>:3001/api/docs
```

---

## 3. project-service

**Porta:** `3002` | **Banco:** `project_db`

```bash
cp .env.example .env
```

```env
NODE_ENV=production
PORT=3002
DB_NAME=project_db
DB_USER=meraki_user
DB_PASS=<openssl rand -base64 32>
JWT_SECRET=<mesmo JWT_SECRET>
RABBITMQ_URL=amqp://meraki_user:<RABBITMQ_PASS>@<IP_INFRA>:5672
```

```bash
docker compose up -d
# Swagger: http://<IP>:3002/api/docs
```

---

## 4. bidding-service

**Porta:** `3003` | **Banco:** `bidding_db`

```bash
cp .env.example .env
```

```env
NODE_ENV=production
PORT=3003
DB_NAME=bidding_db
DB_USER=meraki_user
DB_PASS=<openssl rand -base64 32>
JWT_SECRET=<mesmo JWT_SECRET>
RABBITMQ_URL=amqp://meraki_user:<RABBITMQ_PASS>@<IP_INFRA>:5672
```

```bash
docker compose up -d
# Swagger: http://<IP>:3003/api/docs
```

---

## 5. delivery-service

**Porta:** `3004` | **Banco:** `delivery_db`

```bash
cp .env.example .env
```

```env
NODE_ENV=production
PORT=3004
DB_NAME=delivery_db
DB_USER=meraki_user
DB_PASS=<openssl rand -base64 32>
JWT_SECRET=<mesmo JWT_SECRET>
RABBITMQ_URL=amqp://meraki_user:<RABBITMQ_PASS>@<IP_INFRA>:5672
```

```bash
docker compose up -d
# Swagger: http://<IP>:3004/api/docs
```

---

## 6. payment-service

**Porta:** `3005` | **Banco:** `payment_db`

```bash
cp .env.example .env
```

```env
NODE_ENV=production
PORT=3005
DB_NAME=payment_db
DB_USER=meraki_user
DB_PASS=<openssl rand -base64 32>
JWT_SECRET=<mesmo JWT_SECRET>
PLATFORM_FEE_RATE=0.10
RABBITMQ_URL=amqp://meraki_user:<RABBITMQ_PASS>@<IP_INFRA>:5672
```

```bash
docker compose up -d
# Swagger: http://<IP>:3005/api/docs
```

---

## 7. portfolio-service

**Porta:** `3006` | **Banco:** `portfolio_db`

```bash
cp .env.example .env
```

```env
NODE_ENV=production
PORT=3006
DB_NAME=portfolio_db
DB_USER=meraki_user
DB_PASS=<openssl rand -base64 32>
JWT_SECRET=<mesmo JWT_SECRET>
RABBITMQ_URL=amqp://meraki_user:<RABBITMQ_PASS>@<IP_INFRA>:5672
```

```bash
docker compose up -d
# Swagger: http://<IP>:3006/api/docs
```

---

## 8. api-gateway (por último)

**Porta:** `3000` | **Sem banco**

```bash
cp .env.example .env
```

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<mesmo JWT_SECRET>
IDENTITY_SERVICE_URL=http://<IP_IDENTITY>:3001
PROJECT_SERVICE_URL=http://<IP_PROJECT>:3002
BIDDING_SERVICE_URL=http://<IP_BIDDING>:3003
DELIVERY_SERVICE_URL=http://<IP_DELIVERY>:3004
PAYMENT_SERVICE_URL=http://<IP_PAYMENT>:3005
PORTFOLIO_SERVICE_URL=http://<IP_PORTFOLIO>:3006
```

```bash
docker compose up -d
# Swagger: http://<IP>:3000/api/docs
# Ponto de entrada da API: http://<IP>:3000/api/
```

---

## Verificação final

Após subir todos os serviços, teste o fluxo básico pelo gateway:

```bash
# Registrar um usuário
curl -X POST http://<IP_GATEWAY>:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@1234","name":"Test","userType":"COMPANY"}'

# Login
curl -X POST http://<IP_GATEWAY>:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@1234"}'
```

---

## Troubleshooting

**Serviço recusa subir com "Variáveis obrigatórias não configuradas"**
→ Revise o `.env` — todas as variáveis listadas devem estar preenchidas.

**Erro 401 em todas as requisições**
→ `JWT_SECRET` diverge entre o gateway e o serviço que está respondendo.
Confirme que o valor é idêntico em todos os `.env`.

**RabbitMQ: "número máximo de tentativas atingido"**
→ `RABBITMQ_URL` está incorreta ou a porta 5672 não está acessível.
Verifique firewall no servidor de infra: `ufw allow 5672/tcp`.

**Serviço sobe mas banco falha**
→ O container `<service>-db` pode não ter terminado de inicializar.
Aguarde o healthcheck: `docker compose ps` deve mostrar `(healthy)` antes do serviço conectar.

**Gateway retorna 502 Bad Gateway**
→ A `*_SERVICE_URL` aponta para um servidor que ainda não está rodando
ou a porta está bloqueada por firewall.
