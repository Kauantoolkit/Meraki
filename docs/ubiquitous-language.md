# MERAKI — Ubiquitous Language (Linguagem Ubíqua)

> Glossário de termos do domínio. Todos os membros da equipe, código e documentação devem usar estes termos consistentemente.

---

## Glossário Principal

| Português | Inglês (código) | Definição |
|---|---|---|
| Empresa | `Company` | Organização que publica projetos e contrata especialistas |
| Especialista | `Specialist` | Profissional qualificado que submete propostas e executa projetos |
| Projeto | `Project` | Demanda técnica publicada por uma empresa, com escopo, orçamento e prazo |
| Marco | `Milestone` | Etapa sequencial de um projeto com valor e critério de aceitação próprios |
| Proposta | `Bid` | Oferta de um especialista para executar um projeto, com valor e prazo estimado |
| Entrega | `Delivery` | Submissão do trabalho realizado em um milestone pelo especialista |
| Aprovação | `Review` | Avaliação da entrega pela empresa (aprova ou rejeita com feedback) |
| Pagamento | `Payment` | Transferência financeira liberada após aprovação de um milestone |
| Escrow | `EscrowAccount` | Mecanismo de retenção do valor do projeto até aprovação dos milestones |
| Taxa da Plataforma | `PlatformFee` | 10% retido sobre cada pagamento liberado (RN06) |
| Kanban | `KanbanBoard` | Quadro visual de acompanhamento dos milestones por colunas de status |
| Portfólio | `Portfolio` | Coleção de trabalhos publicados pelo especialista em seu perfil público |
| Certificação | `Certification` | Credencial profissional registrada no perfil do especialista |
| Avaliação | `Review` (portfolio) | Nota e comentário dado por uma empresa após conclusão de projeto |
| Histórico Profissional | `WorkHistory` | Registro de projetos concluídos e valores recebidos pelo especialista |
| Perfil Público | `PublicProfile` | Página pública de especialista ou empresa acessível por qualquer usuário |

---

## Status dos Aggregates

### Projeto (`ProjectStatus`)
| Status | Significado |
|---|---|
| `OPEN` | Aguardando propostas |
| `IN_PROGRESS` | Especialista atribuído, execução em andamento |
| `COMPLETED` | Todos os milestones aprovados |
| `CANCELLED` | Cancelado pela empresa |

### Proposta (`BidStatus`)
| Status | Significado |
|---|---|
| `PENDING` | Aguardando avaliação da empresa |
| `ACCEPTED` | Selecionada como vencedora |
| `REJECTED` | Recusada pela empresa ou automaticamente (RN03) |
| `WITHDRAWN` | Retirada pelo especialista |

### Milestone (`MilestoneStatus`)
| Status | Significado |
|---|---|
| `PENDING` | Aguardando início |
| `IN_PROGRESS` | Em execução pelo especialista |
| `SUBMITTED` | Entregue, aguardando aprovação da empresa |
| `APPROVED` | Aprovado — pagamento liberado |
| `REJECTED` | Rejeitado — especialista deve corrigir e reenviar |

### Entrega (`DeliveryStatus`)
| Status | Significado |
|---|---|
| `PENDING` | Aguardando entrega |
| `SUBMITTED` | Entregue, em revisão |
| `APPROVED` | Aprovada |
| `REJECTED` | Rejeitada com feedback |

### Pagamento (`PaymentStatus`)
| Status | Significado |
|---|---|
| `ESCROW_HELD` | Valor retido em escrow |
| `RELEASED` | Liberado ao especialista (menos taxa de 10%) |
| `REFUNDED` | Devolvido à empresa |

---

## Regras de Negócio (RN)

| ID | Nome | Descrição |
|---|---|---|
| RN01 | Qualidade do Escopo | Projeto deve ter título ≥10 chars, budget > 0, deadline futuro e ≥1 requisito |
| RN02 | Uma Proposta Ativa | Especialista pode ter apenas UMA proposta PENDING por projeto |
| RN03 | Um Vencedor | Apenas uma proposta pode ser ACCEPTED por projeto; as demais são rejeitadas automaticamente |
| RN04 | Milestones Sequenciais | Um milestone só pode ser iniciado após todos os anteriores serem APPROVED |
| RN05 | Escrow | O valor do projeto fica retido em escrow até aprovação de cada milestone |
| RN06 | Taxa da Plataforma | A plataforma retém 10% de cada pagamento liberado |
| RN07 | Histórico Automático | Todo evento relevante (início, entrega, aprovação, rejeição) é registrado automaticamente no histórico |

---

## Bounded Contexts e seus Termos

| Contexto | Termos principais |
|---|---|
| **Identity** | User, Company, Specialist, JWT, Registration |
| **Project** | Project, Milestone, Requirement, Budget, Deadline |
| **Bidding** | Bid, Proposal, ProposedValue, EstimatedDuration, BidSelection |
| **Delivery** | Delivery, KanbanBoard, KanbanColumn, KanbanCard, ProjectHistory |
| **Payment** | Payment, EscrowAccount, PlatformFee, MilestoneValidation |
| **Portfolio** | Portfolio, Certification, Review, WorkHistory, PublicProfile, Rating |
