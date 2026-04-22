# Context Map — Meraki Platform

> Mapa de contextos delimitados e seus relacionamentos conforme DDD Estratégico.

---

## Bounded Contexts

| Contexto | Subdomain | Tipo |
|---|---|---|
| Identity & Access | Gestão de usuários, empresas e especialistas | **Generic** |
| Project Management | Criação e gestão de projetos e milestones | **Core** |
| Bidding | Propostas e seleção de especialistas | **Core** |
| Delivery Tracking | Kanban, progresso e validação de milestones | **Supporting** |
| Payment | Pagamentos, escrow e taxas da plataforma | **Core** |
| Portfolio | Perfis públicos e histórico profissional | **Supporting** |

---

## Relacionamentos (Upstream → Downstream)

```
┌──────────────┐        ┌──────────────────┐
│   Identity   │──U──→──│  Project Mgmt    │
│   (Generic)  │        │  (Core)          │
└──────────────┘        └────────┬─────────┘
       │                         │
       │ U                       │ U
       ▼                         ▼
┌──────────────┐        ┌──────────────────┐
│   Portfolio  │        │    Bidding       │
│ (Supporting) │        │    (Core)        │
└──────────────┘        └────────┬─────────┘
                                 │ U
                                 ▼
                        ┌──────────────────┐
                        │   Delivery       │
                        │  (Supporting)    │
                        └────────┬─────────┘
                                 │ U
                                 ▼
                        ┌──────────────────┐
                        │    Payment       │
                        │    (Core)        │
                        └──────────────────┘
```

---

## Detalhamento dos Relacionamentos

### Identity (U) → Project Management (D)
- **Padrão:** Published Language via eventos
- **Evento:** `user.registered`
- **Descrição:** Project Mgmt consome dados de identidade (userId, companyId) para vincular projetos a empresas.

### Identity (U) → Portfolio (D)
- **Padrão:** Published Language via eventos
- **Evento:** `user.registered`
- **Descrição:** Portfolio cria perfil público inicial quando um usuário se registra.

### Project Management (U) → Bidding (D)
- **Padrão:** Published Language via eventos
- **Evento:** `project.created`
- **Descrição:** Bidding abre o período de propostas quando um projeto válido é publicado.

### Bidding (U) → Delivery (D)
- **Padrão:** Published Language via eventos
- **Evento:** `bid.accepted`
- **Descrição:** Delivery cria o board Kanban e inicia tracking quando um especialista é selecionado.

### Delivery (U) → Payment (D)
- **Padrão:** Published Language via eventos
- **Evento:** `milestone.validated`
- **Descrição:** Payment libera o pagamento somente após validação da milestone pela empresa (RN05).

### Delivery (U) → Portfolio (D)
- **Padrão:** Published Language via eventos
- **Evento:** `delivery.submitted`, `project.completed`
- **Descrição:** Portfolio registra automaticamente o histórico de entregas (RN07).

---

## Anti-Corruption Layers

Cada contexto downstream consome eventos do upstream sem expor suas estruturas internas.
Os DTOs de integração são traduzidos em objetos do domínio local via Factories.

Nenhum serviço acessa diretamente o banco de dados de outro serviço.
