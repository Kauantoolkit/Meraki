# MERAKI - Identity Service: Log de Implementação

**Data:** 2026-03-19
**Status:** Implementado

---

## Estrutura de Arquivos

```
backend/identity-service/
├── src/
│   ├── main.ts                                      # Bootstrap da aplicação
│   ├── app.module.ts                                # Root module (TypeORM config)
│   ├── identity.module.ts                           # Módulo principal do contexto
│   │
│   ├── domain/
│   │   ├── enums/
│   │   │   └── user-type.enum.ts                   # UserType: COMPANY | SPECIALIST
│   │   ├── entities/
│   │   │   ├── user.entity.ts                      # Aggregate Root
│   │   │   ├── specialist-profile.entity.ts        # Perfil do especialista
│   │   │   └── company-profile.entity.ts           # Perfil da empresa
│   │   ├── value-objects/
│   │   │   └── email.value-object.ts               # Validação e normalização de email
│   │   ├── repositories/
│   │   │   └── user.repository.interface.ts        # Contrato (abstração)
│   │   └── events/
│   │       ├── base.event.ts                       # Classe base para eventos
│   │       └── user-registered.event.ts            # Evento publicado ao registrar
│   │
│   ├── application/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts                  # Body do registro
│   │   │   ├── login.dto.ts                        # Body do login
│   │   │   ├── user-response.dto.ts                # Resposta padrão + AuthResponse
│   │   │   └── update-profile.dto.ts               # Update de perfil (specialist/company)
│   │   └── use-cases/
│   │       ├── register-user.use-case.ts           # Criar usuário + perfil + evento
│   │       ├── authenticate.use-case.ts            # Login + JWT
│   │       ├── get-user-profile.use-case.ts        # Buscar perfil completo
│   │       └── update-user-profile.use-case.ts     # Atualizar perfil
│   │
│   ├── infrastructure/
│   │   ├── auth/
│   │   │   └── jwt.strategy.ts                     # Passport JWT Strategy
│   │   ├── database/
│   │   │   └── typeorm.config.ts                   # Config TypeORM (env-driven)
│   │   ├── rabbitmq/
│   │   │   ├── rabbitmq.module.ts                  # Módulo global RabbitMQ
│   │   │   ├── rabbitmq-config.service.ts          # Conexão + publish/subscribe
│   │   │   └── event-publisher.service.ts          # Publicadores de eventos tipados
│   │   └── repositories/
│   │       └── user.repository.ts                  # Implementação TypeORM
│   │
│   └── interfaces/
│       ├── controllers/
│       │   ├── auth.controller.ts                  # POST /api/auth/register, /api/auth/login
│       │   └── user.controller.ts                  # GET/PUT /api/users/me
│       ├── guards/
│       │   └── jwt-auth.guard.ts                   # Guard JWT (Passport)
│       ├── decorators/
│       │   └── current-user.decorator.ts           # @CurrentUser() param decorator
│       └── filters/
│           └── http-exception.filter.ts            # Formata erros HTTP
│
├── package.json
├── tsconfig.json
├── nest-cli.json
├── Dockerfile
└── .env.example
```

---

## Endpoints Expostos (porta 3001)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/register` | ❌ | Registrar novo usuário |
| POST | `/api/auth/login` | ❌ | Login, retorna JWT |
| GET | `/api/users/me` | ✅ JWT | Perfil do usuário autenticado |
| GET | `/api/users/:id` | ✅ JWT | Buscar usuário por ID (uso interno) |
| PUT | `/api/users/me/profile` | ✅ JWT | Atualizar perfil |

**Swagger:** `http://localhost:3001/api/docs`

---

## Banco de Dados: `identity_db`

```
Tabelas criadas automaticamente pelo TypeORM (synchronize: true em dev):
- users
- specialist_profiles
- company_profiles
```

---

## Eventos RabbitMQ Publicados

| Evento | Routing Key | Payload |
|--------|-------------|---------|
| UserRegisteredEvent | `user.registered` | `{ userId, email, name, userType, companyId?, specialistId? }` |

---

## Como Testar (standalone)

```bash
cd backend/identity-service
npm install
cp .env.example .env

# Subir só o banco e o RabbitMQ
docker-compose -f ../docker-compose.yml up identity-db rabbitmq -d

# Rodar o serviço
npm run start:dev

# Acessar Swagger
# http://localhost:3001/api/docs
```

---

## Regras de Negócio Implementadas

- **Email único** — ConflictException se email já existe
- **Email normalizado** — lowercase + trim via Value Object
- **Company exige companyName** — BadRequestException se ausente
- **Senha hasheada** — bcrypt com salt 10
- **Perfil criado automaticamente** — junto com o User no registro
- **JWT expira em 7 dias** — configurável via `JWT_EXPIRES_IN`
