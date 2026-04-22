# MERAKI — Context Mapping

> Mapeamento estratégico dos Bounded Contexts conforme DDD.
> Baseado nos conceitos de Core Domain, Supporting Domain e Generic Domain.

---

## Diagrama de Contextos

```
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY :3000                        │
│              Anti-Corruption Layer (ACL)                        │
│         HTTP Proxy + JWT Guard + Rate Limiting                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP REST (síncrono)
         ┌─────────────────┼──────────────────────┐
         │                 │                      │
         ▼                 ▼                      ▼
┌──────────────┐  ┌──────────────────┐  ┌─────────────────┐
│   IDENTITY   │  │    PROJECT       │  │    BIDDING      │
│   :3001      │  │    :3002         │  │    :3003        │
│ [GENERIC]    │  │ [CORE]           │  │ [CORE]          │
└──────────────┘  └──────────────────┘  └─────────────────┘
       │                  │ milestone.created        │
       │ user.registered  │                          │ bid.accepted
       │                  ▼                          ▼
       │          ┌───────────────────────────────────────────┐
       │          │          RabbitMQ — meraki.events         │
       │          │    Topic Exchange (eventos de integração)  │
       │          └──────────┬──────────────────┬────────────┘
       │                     │                  │
       ▼                     ▼                  ▼
┌──────────────┐  ┌──────────────────┐  ┌─────────────────┐
│  PORTFOLIO   │  │    DELIVERY      │  │    PAYMENT      │
│  :3006       │  │    :3004         │  │    :3005        │
│ [GENERIC]    │  │ [SUPPORTING]     │  │ [SUPPORTING]    │
└──────────────┘  └──────────────────┘  └─────────────────┘
       ▲                                        │
       └────────────────────────────────────────┘
                     payment.released
```

---

## Classificação dos Contextos

### Core Domain (coração do negócio — diferencial competitivo)

| Contexto | Serviço | Porta | Responsabilidade |
|---|---|---|---|
| **Project Context** | `project-service` | :3002 | Criação e gestão de projetos com milestones sequenciais |
| **Bidding Context** | `bidding-service` | :3003 | Submissão e seleção de propostas de especialistas |

> **Por que são Core?** São a essência do modelo de negócio MERAKI: conectar empresas (projetos) com especialistas (propostas). Sem estes, a plataforma não existe.

---

### Supporting Domain (suportam o core mas não são o diferencial)

| Contexto | Serviço | Porta | Responsabilidade |
|---|---|---|---|
| **Delivery Context** | `delivery-service` | :3004 | Kanban board, entregas de milestones, histórico de atividades |
| **Payment Context** | `payment-service` | :3005 | Escrow, liberação de pagamentos com taxa de 10% (RN06) |

> **Por que são Supporting?** Essenciais para o funcionamento, mas são soluções comuns de mercado. O Kanban e o escrow poderiam ser substituídos por ferramentas de terceiros sem perder o diferencial do negócio.

---

### Generic Domain (infraestrutura de negócio — poderia ser comprado)

| Contexto | Serviço | Porta | Responsabilidade |
|---|---|---|---|
| **Identity Context** | `identity-service` | :3001 | Autenticação JWT, cadastro de usuários e perfis |
| **Portfolio Context** | `portfolio-service` | :3006 | Portfólio público, certificações, avaliações, histórico profissional |

> **Por que são Generic?** Autenticação e perfis públicos são soluções padronizadas. Poderiam ser implementadas com Auth0, LinkedIn etc. sem afetar o modelo de negócio.

---

### Anti-Corruption Layer

| Componente | Serviço | Porta | Responsabilidade |
|---|---|---|---|
| **API Gateway** | `api-gateway` | :3000 | Traduz requisições externas para a linguagem interna; protege os BCs de dados externos malformados |

---

## Relações entre Contextos

| Evento | Publisher | Consumer(s) | Tipo |
|---|---|---|---|
| `user.registered` | identity | portfolio | Integration Event (async) |
| `project.created` | project | — | Domain Event |
| `milestone.created` | project | delivery | Integration Event (async) |
| `bid.submitted` | bidding | — | Domain Event |
| `bid.accepted` | bidding | project, delivery | Integration Event (async) |
| `milestone.validated` | delivery | payment | Integration Event (async) |
| `payment.released` | payment | portfolio | Integration Event (async) |

---

## Decisão Arquitetural

- **Comunicação síncrona (HTTP REST):** API Gateway → serviços internos (operações que exigem resposta imediata)
- **Comunicação assíncrona (RabbitMQ):** eventos de integração entre serviços (desacoplamento, tolerância a falhas)
- Cada contexto tem seu próprio banco PostgreSQL (isolamento de dados)
