# Aggregate Roots — Meraki Platform

> Documentação formal dos Aggregates e suas raízes conforme DDD Tático.

---

## Definição

Um **Aggregate** é um cluster de entidades e value objects tratados como uma unidade de consistência.
O **Aggregate Root** é a única entidade pela qual o mundo externo acessa o agregado.
Repositórios existem **apenas para Aggregate Roots**.

---

## Identity & Access Context

### Aggregate: User (Root)
- **Root:** `User`
- **Filhos:** nenhum (CompanyProfile e SpecialistProfile são agregados independentes)
- **Value Objects:** `Email`, `CPF`, `CNPJ`, `Password`, `Phone`
- **Repositório:** `IUserRepository`
- **Invariantes:** email único, validação de tipo (Company/Specialist)

### Aggregate: CompanyProfile (Root)
- **Root:** `CompanyProfile`
- **Value Objects:** `CNPJ`
- **Repositório:** acesso via `IUserRepository` (extensão)

### Aggregate: SpecialistProfile (Root)
- **Root:** `SpecialistProfile`
- **Value Objects:** `CPF`
- **Repositório:** acesso via `IUserRepository` (extensão)

---

## Project Management Context

### Aggregate: Project (Root)
- **Root:** `Project`
- **Filhos:** `Milestone` (não existe sem Project)
- **Value Objects:** `Budget`, `Deadline`
- **Repositório:** `IProjectRepository`
- **Invariantes:** milestones sequenciais (RN04), escopo validado (RN01)

---

## Bidding Context

### Aggregate: Bid (Root)
- **Root:** `Bid`
- **Filhos:** `BidMessage` (não existe sem Bid)
- **Value Objects:** `ProposedValue`
- **Repositório:** `IBidRepository`
- **Invariantes:** uma proposta por especialista por projeto (RN02), apenas PENDING aceita transições

---

## Delivery Tracking Context

### Aggregate: Delivery (Root)
- **Root:** `Delivery`
- **Filhos:** `KanbanColumn`, `KanbanCard`, `MilestoneComment`
- **Value Objects:** `CardPosition`
- **Repositório:** `IDeliveryRepository`
- **Invariantes:** máquina de estados de entrega, progressão sequencial de milestones (RN04)

### Aggregate: ProjectHistory (Root)
- **Root:** `ProjectHistory`
- **Repositório:** `IProjectHistoryRepository`
- **Invariantes:** registro automático (RN07)

---

## Payment Context

### Aggregate: Payment (Root)
- **Root:** `Payment`
- **Filhos:** nenhum
- **Value Objects:** `Money`
- **Repositório:** `IPaymentRepository`
- **Invariantes:** liberação só após validação (RN05), idempotência (RNF04)

### Aggregate: EscrowAccount (Root)
- **Root:** `EscrowAccount`
- **Repositório:** `IEscrowRepository`
- **Invariantes:** máquina de estados (held → released/refunded)

---

## Portfolio Context

### Aggregate: SpecialistPublicProfile (Root)
- **Root:** `SpecialistPublicProfile`
- **Filhos:** `Certification`, `WorkHistory`, `Review` (via specialistId)
- **Value Objects:** `Rating`
- **Repositório:** `ISpecialistProfileRepository`

### Aggregate: CompanyPublicProfile (Root)
- **Root:** `CompanyPublicProfile`
- **Repositório:** `ICompanyProfileRepository`

### Aggregate: Portfolio (Root)
- **Root:** `Portfolio`
- **Repositório:** `IPortfolioRepository`
- **Invariantes:** precisa de título + descrição para publicar
