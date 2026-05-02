# MERAKI Payment Service - Guia de Inicialização

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- RabbitMQ 3.8+
- npm ou yarn

## Inicialização Rápida

### 1️⃣ Instalar Dependências

```bash
cd payment-service
npm install
```

### 2️⃣ Configurar Banco de Dados

#### Opção A: Usar Docker Compose (Recomendado)

```bash
# Iniciar PostgreSQL e RabbitMQ
docker-compose up -d

# Aguarde ~30 segundos para o banco estar pronto
```

#### Opção B: PostgreSQL Local

```bash
# No PostgreSQL, criar banco:
psql -U postgres -c "CREATE DATABASE meraki_payment;"
```

### 3️⃣ Configurar Variáveis de Ambiente

Criar arquivo `.env`:

```bash
# Copy do template
cp .env.example .env

# Editar .env com seus valores (se necessário)
```

### 4️⃣ Executar Servidor

```bash
# Desenvolvimento (com hot reload)
npm start:dev

# Ou produção
npm run build
npm start:prod
```

O servidor estará disponível em: **http://localhost:3002/api**

---

## Testando a API

### Opção 1: Swagger UI (Browser)

```
http://localhost:3002/api
```

### Opção 2: cURL

```bash
# Criar pagamento
curl -X POST http://localhost:3002/payments/hiring \
  -H "Content-Type: application/json" \
  -d '{
    "specialistId": "550e8400-e29b-41d4-a716-446655440000",
    "companyId": "550e8400-e29b-41d4-a716-446655440001",
    "projectId": "550e8400-e29b-41d4-a716-446655440002",
    "amount": 500
  }'
```

### Opção 3: Script API

#### Linux/Mac:
```bash
chmod +x test-api.sh
./test-api.sh
```

#### Windows:
```bash
test-api.bat
```

### Opção 4: Testes Unitários

```bash
# Executar testes
npm test

# Com cobertura
npm test:cov

# Apenas os testes do payment service
npm test:direct
```

---

## 📊 Verificar Status

### PostgreSQL
```bash
# Ver containers rodando
docker ps

# Entrar no postgres
docker exec -it meraki-payment-db psql -U postgres -d meraki_payment

# Ver tabelas criadas
\dt
```

### RabbitMQ
```
Admin UI: http://localhost:15672
Username: guest
Password: guest
```

### Payment Service
```bash
# Logs em tempo real
npm start:dev

# Swagger
http://localhost:3002/api
```

---

## 🔧 Troubleshooting

### "Connection refused" no PostgreSQL

```bash
# Verificar se container está rodando
docker ps | grep payment-db

# Se não estiver, iniciar
docker-compose up -d payment-db

# Aguardar ~10 segundos
```

### "Port 5672 already in use" (RabbitMQ)

```bash
# Listar processos na porta
lsof -i :5672

# Matar processo
kill -9 <PID>

# Ou usar porta diferente no docker-compose
```

### Erro ao inserir dados no banco

```bash
# Sincronizar schema (desenvolvimento)
# Editar app.module.ts: synchronize: true

# Ou rodar migrations (producação)
npm run typeorm migration:run
```

---

## 📁 Estrutura do Projeto

```
payment-service/
├── src/
│   ├── domain/              # Camada de Domínio (core)
│   │   ├── entities/        # Entidades
│   │   ├── enums/           # Enumerações
│   │   ├── repositories/    # Interfaces de repositório
│   │   └── value-objects/   # Value objects (futura)
│   │
│   ├── application/         # Camada de Aplicação
│   │   ├── use-cases/       # Casos de uso
│   │   ├── services/        # Serviços
│   │   └── dto/             # DTOs
│   │
│   ├── infrastructure/      # Camada de Infraestrutura
│   │   ├── repositories/    # Implementações de repositório
│   │   └── rabbitmq/        # Integração com RabbitMQ
│   │
│   ├── interfaces/          # Camada de Interface
│   │   └── controllers/     # Controllers REST
│   │
│   ├── app.module.ts        # Módulo principal
│   ├── payment.module.ts    # Módulo de pagamento
│   └── main.ts              # Entrada da aplicação
│
├── package.json
├── tsconfig.json
├── docker-compose.yml       # Configuração Docker
├── Dockerfile               # Build Docker
├── .env.example             # Template de variáveis
└── README.md                # Este arquivo
```

---

## 🔄 Fluxo de Desenvolvimento

1. **Fazer mudanças no código**
   ```bash
   npm start:dev
   ```

2. **Código recompila automaticamente**
   - Hot reload está ativo

3. **Testar via Swagger**
   - http://localhost:3002/api

4. **Executar testes**
   ```bash
   npm test:direct
   ```

5. **Fazer commit quando tudo passa**
   ```bash
   git add .
   git commit -m "feat: descrição"
   ```

---

## 📦 Deploy (Futuro)

### Usando Docker

```bash
# Construir imagem
docker build -t meraki/payment-service:1.0 .

# Rodar container
docker run -p 3002:3002 \
  -e DB_HOST=payment-db \
  -e RABBITMQ_URI=amqp://guest:guest@rabbitmq:5672 \
  meraki/payment-service:1.0
```

### Usando Docker Compose (Produção)

```bash
# Descomentar payment-service no docker-compose.yml
# Depois:

docker-compose -f docker-compose.yml up -d payment-service
```

---

## 📚 Documentação

- [README.md](./README.md) - Overview do sistema
- [API_EXAMPLES.md](./API_EXAMPLES.md) - Exemplos de requisições
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Integração com RabbitMQ

---

## 🆘 Precisa de Ajuda?

1. Verificar logs
   ```bash
   npm start:dev # Ver console
   ```

2. Testar conexão com DB
   ```bash
   docker exec meraki-payment-db pg_isready
   ```

3. Verificar RabbitMQ
   ```
   http://localhost:15672
   ```

4. Ler tests
   ```bash
   cat src/payment.service.spec.ts
   ```

---

## ✅ Checklist de Início

- [ ] Node.js instalado (`node --version`)
- [ ] Docker instalado (`docker --version`)
- [ ] Clonar repositório
- [ ] `npm install` na pasta payment-service
- [ ] `docker-compose up -d` para BD e RabbitMQ
- [ ] `npm start:dev` para iniciar servidor
- [ ] Acessar http://localhost:3002/api
- [ ] Executar `npm test:direct` para validar

---

## 🎯 Próximas Etapas

- [ ] Integrar com Payment Gateway real (PIX, Stripe, etc)
- [ ] Adicionar autenticação JWT
- [ ] Implementar rate limiting
- [ ] Adicionar métricas e monitoramento
- [ ] Criar CI/CD pipeline
- [ ] Documentação de API (OpenAPI completado)

Tudo pronto para começar! 🚀
