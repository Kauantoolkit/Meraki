# MERAKI - Arquitetura do Sistema

## 1. Visão Geral da Arquitetura (DDD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BOUNDED CONTEXTS (DDD)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  IDENTITY & │  │  PROJECT    │  │  BIDDING    │  │  DELIVERY   │      │
│  │ACCESS CONTEXT│  │   CONTEXT   │  │   CONTEXT   │  │   CONTEXT   │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │
│         │                 │                 │                 │             │
│         └─────────────────┼─────────────────┼─────────────────┘             │
│                           │                 │                               │
│                    ┌──────┴──────┐  ┌──────┴──────┐                        │
│                    │  PAYMENT    │  │  PORTFOLIO  │                        │
│                    │   CONTEXT   │  │   CONTEXT   │                        │
│                    └─────────────┘  └─────────────┘                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      FLUTTER MOBILE APP (MVVM)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Auth      │  │  Projects   │  │ Milestones  │  │      Payments       │ │
│  │  Feature    │  │  Feature    │  │  Feature    │  │      Feature         │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                    │                                         │
│  ┌─────────────────────────────────┴─────────────────────────────────────┐   │
│  │                         CORE LAYER                                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │   │
│  │  │ API Client  │  │   Storage   │  │    Auth     │                   │   │
│  │  │    (Dio)    │  │   (Hive)    │  │  Service    │                   │   │
│  │  │             │  │             │  │             │                   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                   │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS/REST
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    NestJS API Gateway                                │    │
│  │   - Anti-Corruption Layer (ACL)                                     │    │
│  │   - Routing                                                        │    │
│  │   - Authentication (JWT)                                           │    │
│  │   - Rate Limiting                                                  │    │
│  │   - Request Validation                                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RABBITMQ MESSAGE BROKER                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Integration Events (Cross-Bounded Context):                        │    │
│  │  - project.created    - bid.submitted    - bid.accepted            │    │
│  │  - milestone.started  - milestone.completed - payment.released    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                 │                 │                 │
        ┌───────────┴───┐   ┌────────┴────────┐  ┌──────┴──────┐  ┌────────┴────────┐
        ▼               ▼   ▼                 ▼  ▼             ▼  ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌─────────────────┐ ┌────────────┐ ┌────────────────┐ ┌───────────────┐
│ User          │ │ Project      │ │ Bidding         │ │ Delivery   │ │ Payment        │ │ Portfolio     │
│ Service       │ │ Management   │ │ Service         │ │ Service    │ │ Service        │ │ Service       │
│               │ │ Service      │ │                 │ │            │ │                │ │               │
│ ┌───────────┐ │ │ ┌───────────┐ │ │ ┌─────────────┐ │ │┌─────────┐ │ │┌────────────┐  │ │ ┌───────────┐ │
│ │  Domain   │ │ │ │  Domain   │ │ │ │  Domain     │ │ ││ Domain │ │ ││  Domain   │  │ │ │  Domain   │ │
│ │  Layer    │ │ │ │  Layer    │ │ │ │  Layer      │ │ ││ Layer  │ │ ││  Layer    │  │ │ │  Layer    │ │
│ └───────────┘ │ │ └───────────┘ │ │ └─────────────┘ │ │└─────────┘ │ │└────────────┘  │ │ └───────────┘ │
│ ┌───────────┐ │ │ ┌───────────┐ │ │ ┌─────────────┐ │ │┌─────────┐ │ │┌────────────┐  │ │ ┌───────────┐ │
│ │Application│ │ │ │Application│ │ │ │ Application │ │ ││Applicat │ │ ││Application │  │ │ │Application│ │
│ │  Layer    │ │ │ │  Layer    │ │ │ │   Layer     │ │ ││ion Layer│ │ ││  Layer     │  │ │ │  Layer    │ │
│ └───────────┘ │ │ └───────────┘ │ │ └─────────────┘ │ │└─────────┘ │ │└────────────┘  │ │ └───────────┘ │
│ ┌───────────┐ │ │ ┌───────────┐ │ │ ┌─────────────┐ │ │┌─────────┐ │ │┌────────────┐  │ │ ┌───────────┐ │
│ │Infrastructure│ │ ││Infrastructure│ │ ││Infrastructure││ ││Infras │ │ ││Infras │  │ │ ││Infrastructure│ │
│ │  Layer    │ │ │ │  Layer    │ │ │ │   Layer     │ │ ││tructure│ │ ││tructure   │  │ │ │  Layer    │ │
│ └───────────┘ │ │ └───────────┘ │ │ └─────────────┘ │ │└─────────┘ │ │└────────────┘  │ │ └───────────┘ │
│ ┌───────────┐ │ │ ┌───────────┐ │ │ ┌─────────────┐ │ │┌─────────┐ │ │┌────────────┐  │ │ ┌───────────┐ │
│ │Interfaces │ │ │ │Interfaces │ │ │ │ Interfaces  │ │ ││Interf  │ │ ││Interfaces │  │ │ │ Interfaces │ │
│ │  Layer    │ │ │ │  Layer    │ │ │ │   Layer     │ │ ││aces    │ │ ││  Layer     │  │ │ │   Layer   │ │
│ └───────────┘ │ │ └───────────┘ │ │ └─────────────┘ │ │└─────────┘ │ │└────────────┘  │ │ └───────────┘ │
└───────────────┘ └───────────────┘ └─────────────────┘ └────────────┘ └────────────────┘ └───────────────┘
        │                   │                 │                 │                 │
        └───────────────────┴─────────────────┴─────────────────┴─────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        POSTGRESQL DATABASES                                 │
│  ┌───────────────┐ ┌───────────────┐ ┌─────────────────┐ ┌────────────────┐ │
│  │   user_db     │ │  project_db   │ │    bidding_db   │ │  delivery_db   │ │
│  └───────────────┘ └───────────────┘ └─────────────────┘ └────────────────┘ │
│                              ┌────────────────┐  ┌────────────────┐        │
│                              │   payment_db   │  │  portfolio_db   │        │
│                              └────────────────┘  └────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Fluxo de Dados

### 2.1 Fluxo de Criação de Projeto
```
Empresa (Web) → API Gateway → Project Service → RabbitMQ (project.created)
                                                      ↓
                                               Todos os serviços interessados
```

### 2.2 Fluxo de Proposta
```
Especialista (Web) → API Gateway → Bidding Service → RabbitMQ (bid.submitted)
                                                           ↓
                                                 Project Service (atualiza status)
```

### 2.3 Fluxo de Execução de Milestone
```
Especialista → Delivery Service → RabbitMQ (milestone.validated)
                                              ↓
                                    Payment Service (prepara liberação)
                                              ↓
                                    Company approve → Payment released
```

---

## 3. Tecnologias

| Componente       | Tecnologia                |
|------------------|---------------------------|
| Backend          | NestJS                   |
| API Gateway      | NestJS + Gateway         |
| Mensageria       | RabbitMQ (ou Kafka)      |
| Banco de Dados   | PostgreSQL               |
| Mobile App       | Flutter + MVVM           |
| State Management| Riverpod                 |
| HTTP Client      | Dio                      |
| Local Storage    | Hive                     |
| Auth             | JWT                      |
| Containerização  | Docker + Docker Compose  |

---

## 4. Context Map (DDD)

O Context Map define as relações entre os Bounded Contexts do sistema.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CONTEXT MAP                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌──────────────┐                           ┌──────────────┐             │
│    │  IDENTITY &  │◄──── Conformista ────────►│   PROJECT    │             │
│    │ACCESS CONTEXT│                           │   CONTEXT    │             │
│    │              │                           │              │             │
│    │  Upstream:   │                           │  Downstream: │             │
│    │  (User data)│                           │  (needs User)│             │
│    └──────────────┘                           └──────┬───────┘             │
│          │                                            │                     │
│          │              ┌──────────────┐              │                     │
│          └─────────────►│   BIDDING    │◄────────────┘                     │
│                         │   CONTEXT    │                                    │
│                         │              │                                    │
│                         │ Downstream:  │                                    │
│                         │ (needs Prj)  │                                    │
│                         └──────────────┘                                    │
│                               │                                             │
│              ┌────────────────┼────────────────┐                          │
│              ▼                ▼                ▼                          │
│    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                  │
│    │  DELIVERY    │   │   PAYMENT    │   │  PORTFOLIO  │                  │
│    │   CONTEXT    │   │   CONTEXT    │   │   CONTEXT   │                  │
│    │              │   │              │   │             │                  │
│    │ Downstream:  │   │ Downstream:  │   │ Downstream: │                  │
│    │ (needs Prj)  │   │ (needs Prj)  │   │ (needs User)│                  │
│    └──────────────┘   └──────────────┘   └──────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Relationships:

| Context          | Relationship | Downstream Depends On | Notes |
|-----------------|--------------|----------------------|-------|
| Identity & Access → Project | Conformista  | Project reads User data | |
| Identity & Access → Bidding  | Conformista  | Bidding reads User data | |
| Identity & Access → Portfolio | Conformista | Portfolio reads Specialist | RF12, RF14 |
| Project → Bidding   | Conformista  | Bidding reads Project | |
| Project → Delivery  | Cliente-Fornecedor | Project owns Milestone, Delivery references | |
| Project → Payment   | Cliente-Fornecedor | Payment tracks Project | |
| Project → Portfolio | Cliente-Fornecedor | Portfolio tracks completed projects | RF11 |
| Bidding → Delivery | Cliente-Fornecedor | Delivery notified of accepted bid | |
| Bidding → Payment  | Cliente-Fornecedor | Payment notified | |
| Delivery → Payment | Cliente-Fornecedor | Payment releases after approval | |

---

## 5. Ubiquitous Language (DDD)

Glossário de termos ubíquos usados consistentemente em todos os contextos:

| Termo              | Contexto        | Definição                                    |
|-------------------|-----------------|----------------------------------------------|
| **User**          | Identity & Access | Usuário do sistema (Empresa ou Especialista) |
| **Company**       | Identity & Access | User com userType = COMPANY                  |
| **Specialist**    | Identity & Access | User com userType = SPECIALIST               |
| **Project**       | Project         | Trabalho a ser executado                     |
| **Milestone**     | Project         | Marco/entrega de um projeto (OWNED by Project) |
| **Bid**           | Bidding         | Proposta de um especialista para um projeto |
| **Delivery**      | Delivery        | Entrega de um milestone                      |
| **ProjectHistory**| Delivery        | Registro histórico de ações no projeto       |
| **Payment**       | Payment         | Transação financeira                         |
| **Escrow**        | Payment         | Fundo retido até aprovação                   |
| **Portfolio**     | Portfolio       | Trabalhos anteriores do especialista         |
| **Review**        | Portfolio       | Avaliação de um projeto                      |

### Important DDD Rules:

1. **Milestone é do Project Context** - Delivery Context referencia via `milestoneId` (referência externa)
2. **User é do Identity & Access Context** - Todos os outros contextos referenciam via `userId`
3. **Bid pertence ao Bidding Context** - Project armazena `bidId` como referência
4. **ProjectHistory é do Delivery Context** - registra automaticamente ações sobre milestones (RN07)

---

## 6. Estrutura de Diretórios do Projeto

```
meraki/
├── backend/
│   ├── api-gateway/
│   ├── user-service/
│   ├── project-service/
│   ├── bidding-service/
│   ├── delivery-service/
│   ├── payment-service/
│   └── portfolio-service/
│
├── frontend/
│   └── meraki-web/
│       ├── app/
│       │   ├── (auth)/
│       │   ├── (projects)/
│       │   ├── (bidding)/
│       │   ├── (delivery)/
│       │   ├── (payments)/
│       │   └── (portfolio)/
│       ├── components/
│       ├── lib/
│       ├── hooks/
│       └── services/
│
└── docs/
    ├── 01-arquitetura-sistema.md
    └── ...
```

---

## 7. Próximos Passos

- [ ] 02 - Design dos Microsserviços
- [ ] 03 - Implementação Backend NestJS
- [ ] 04 - Configuração RabbitMQ (ou Kafka)
- [ ] 05 - API Gateway
- [ ] 06 - Arquitetura Flutter MVVM
- [ ] 07 - Implementação Flutter/Dart
- [ ] 08 - Integração API com Dio
- [ ] 09 - Armazenamento Local com Hive
- [ ] 10 - Relatório Técnico

