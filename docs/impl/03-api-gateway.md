# MERAKI - API Gateway: Log de Implementação

**Data:** 2026-03-21
**Status:** Implementado

---

## Estrutura de Arquivos

```
backend/api-gateway/
├── src/
│   ├── main.ts                                    # Bootstrap (porta 3000)
│   ├── app.module.ts                              # Root module
│   │
│   ├── infrastructure/
│   │   └── auth/
│   │       └── jwt.strategy.ts                   # Passport JWT — valida token localmente
│   │
│   ├── common/
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts                 # Guard JWT (Passport)
│   │   │   └── roles.guard.ts                    # Guard de roles (COMPANY | SPECIALIST)
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts         # @CurrentUser()
│   │   │   └── roles.decorator.ts                # @Roles()
│   │   └── filters/
│   │       └── http-exception.filter.ts          # Formata erros HTTP
│   │
│   ├── proxy/
│   │   └── http-proxy.service.ts                 # Proxy HTTP (axios) para microsserviços
│   │
│   └── modules/
│       ├── auth/                                  # POST /api/auth/register, /api/auth/login
│       ├── users/                                 # GET/PUT /api/users/me, GET /api/users/:id
│       ├── projects/                              # CRUD /api/projects + milestones
│       ├── bids/                                  # CRUD /api/bids/*
│       ├── milestones/                            # /api/milestones/* + /api/projects/:id/kanban
│       └── payments/                              # /api/payments/*
│
├── package.json
├── tsconfig.json
├── nest-cli.json
├── Dockerfile
└── .env.example
```

---

## Endpoints Expostos (porta 3000)

| Método | Rota | Auth | Role | Downstream |
|--------|------|------|------|------------|
| POST | `/api/auth/register` | ❌ | — | identity-service |
| POST | `/api/auth/login` | ❌ | — | identity-service |
| GET | `/api/users/me` | ✅ | — | identity-service |
| GET | `/api/users/:id` | ✅ | — | identity-service |
| PUT | `/api/users/me/profile` | ✅ | — | identity-service |
| POST | `/api/projects` | ✅ | COMPANY | project-service |
| GET | `/api/projects` | ✅ | — | project-service |
| GET | `/api/projects/:id` | ✅ | — | project-service |
| PUT | `/api/projects/:id` | ✅ | COMPANY | project-service |
| DELETE | `/api/projects/:id` | ✅ | COMPANY | project-service |
| POST | `/api/projects/:id/milestones` | ✅ | COMPANY | project-service |
| GET | `/api/projects/:id/milestones` | ✅ | — | project-service |
| GET | `/api/projects/:id/kanban` | ✅ | — | delivery-service (RF08) |
| GET | `/api/projects/:id/history` | ✅ | — | delivery-service (RF11) |
| POST | `/api/bids/project/:projectId` | ✅ | SPECIALIST | bidding-service |
| GET | `/api/bids/project/:projectId` | ✅ | — | bidding-service |
| GET | `/api/bids/my-bids` | ✅ | SPECIALIST | bidding-service |
| GET | `/api/bids/:id` | ✅ | — | bidding-service |
| PUT | `/api/bids/:id/accept` | ✅ | COMPANY | bidding-service |
| PUT | `/api/bids/:id/reject` | ✅ | COMPANY | bidding-service |
| PUT | `/api/bids/:id/withdraw` | ✅ | SPECIALIST | bidding-service |
| POST | `/api/milestones/:id/submit` | ✅ | SPECIALIST | delivery-service |
| PUT | `/api/milestones/:id/approve` | ✅ | COMPANY | delivery-service |
| PUT | `/api/milestones/:id/reject` | ✅ | COMPANY | delivery-service |
| POST | `/api/milestones/:id/comments` | ✅ | — | delivery-service |
| POST | `/api/payments/escrow` | ✅ | COMPANY | payment-service |
| POST | `/api/payments/release` | ✅ | COMPANY | payment-service |
| GET | `/api/payments/project/:projectId` | ✅ | — | payment-service |
| GET | `/api/payments/milestone/:milestoneId` | ✅ | — | payment-service |

**Swagger:** `http://localhost:3000/api/docs`

---

## Decisão de Design

JWT validado **localmente** no gateway com o mesmo `JWT_SECRET` do identity-service — sem chamada HTTP para validar o token. Cada request autenticado repassa o Bearer token original para o serviço downstream via header `Authorization`.

---

## Como Testar (standalone)

```bash
cd backend/api-gateway
npm install
cp .env.example .env

# Rodar o gateway (identity-service precisa estar UP para auth funcionar)
npm run start:dev

# Swagger
# http://localhost:3000/api/docs
```
