# MERAKI - Design dos Microsserviços (DDD)

## 1. Bounded Contexts e Aggregates

Cada serviço representa um Bounded Context no DDD. Cada contexto possui suas próprias Entities, Value Objects e Aggregates.

---

## 1. Identity & Access Context (Bounded Context) - user-service

### Responsabilidade
Gerenciamento de usuários (empresas e especialistas), autenticação e autorização.

### Aggregate Root: User
```typescript
// User Aggregate Root
- id: UUID
- email: string (Value Object - Email)
- passwordHash: string
- name: string
- userType: UserType (COMPANY | SPECIALIST)
- profile: Profile (Value Object)
- companyId: UUID (nullable - preenchido quando userType = COMPANY)
- specialistId: UUID (nullable - preenchido quando userType = SPECIALIST)
- createdAt: DateTime
- updatedAt: DateTime
```

### Value Objects
```typescript
// SpecialistProfile (Value Object)
- id: UUID
- bio: string
- skills: string[]
- experience: number (anos)
- hourlyRate: decimal
- portfolio: string[]
- rating: decimal

// CompanyProfile (Value Object)
- id: UUID
- companyName: string
- industry: string
- companySize: string
- website: string
```

### Repository Interface
```typescript
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserDto): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
```

### Use Cases (Application Services)
- `RegisterUserUseCase` - Criar novo usuário
- `AuthenticateUseCase` - Autenticar usuário (login)
- `GetUserProfileUseCase` - Buscar perfil do usuário
- `UpdateUserProfileUseCase` - Atualizar perfil
- `ValidateTokenUseCase` - Validar JWT token

### Database: `user_db`

```sql
-- Tabelas
users
user_profiles
refresh_tokens
```

### Integration Events (published)
- `user.registered` - Quando um novo usuário se registra (payload: `{ userId, email, userType, companyId, specialistId }`)

---

## 2. Project Context (Bounded Context) - OWNER OF MILESTONE

### Responsabilidade
Gerenciamento de projetos criados por empresas e dos marcos (milestones) associados.

### IMPORTANT: Este contexto É proprietário do Milestone
Segundo o DRS v1.0 e Arquitetura Técnica v1.0, Milestone pertence ao **Project Context**.
Delivery Context referencia via `milestoneId` (referência externa).

### Aggregate Root: Project
```typescript
// Project Aggregate Root
- id: UUID
- title: string
- description: string
- requirements: string[] (Value Object - RequirementList)
- budget: decimal
- deadline: DateTime
- status: ProjectStatus (OPEN | IN_PROGRESS | COMPLETED | CANCELLED)
- companyId: UUID (FK para Identity & Access Context - referência externa)
- specialistId: UUID (nullable - FK para Identity & Access Context)
- bidId: UUID (nullable - FK para Bidding Context)
- createdAt: DateTime
- updatedAt: DateTime
```

### Aggregate Root: Milestone
```typescript
// Milestone Aggregate Root (OWNED by Project Context)
- id: UUID
- projectId: UUID (FK para Project - referência interna)
- title: string
- description: string
- amount: decimal
- status: MilestoneStatus (PENDING | IN_PROGRESS | SUBMITTED | APPROVED | REJECTED)
- order: number
- dueDate: DateTime
- createdAt: DateTime
- updatedAt: DateTime
```

### Invariants (Business Rules)

```typescript
// RN04: Milestones devem ser concluídas sequencialmente
export class Milestone {
  start(allMilestones: Milestone[]): void {
    const previousPending = allMilestones
      .filter(m => m.order < this.order && m.status !== MilestoneStatus.APPROVED);
    if (previousPending.length > 0) {
      throw new DomainException('Cannot start milestone: previous milestones not yet approved (RN04)');
    }
    this.status = MilestoneStatus.IN_PROGRESS;
  }
}
```

### Value Objects
```typescript
// Category (Value Object)
- id: UUID
- name: string
- description: string
```

### Cross-Context References (Anti-Corruption)
```typescript
// Referências para outros contextos (não-owning)
- specialistId: UUID → Identity & Access Context (User)
- bidId: UUID → Bidding Context (Bid)

// Delivery Context consome eventos de milestone deste contexto
// NÃO duplicar Milestone Entity no Delivery Context!
```

### Use Cases (Application Services)
- `CreateProjectUseCase` - Criar novo projeto
- `GetProjectsUseCase` - Listar projetos (com filtros)
- `GetProjectByIdUseCase` - Buscar projeto específico
- `UpdateProjectUseCase` - Atualizar projeto
- `CancelProjectUseCase` - Cancelar projeto
- `AssignSpecialistUseCase` - Atribuir especialista ao projeto (recebido via Integration Event)
- `CloseProjectUseCase` - Encerrar projeto
- `CreateMilestoneUseCase` - Criar marco do projeto (valida RN04)
- `UpdateMilestoneUseCase` - Atualizar marco do projeto
- `GetMilestonesByProjectUseCase` - Listar marcos de um projeto

### Integration Events (consumed)
- `bid.accepted` - Recebido do Bidding Context para atribuir especialista

### Integration Events (published)
- `project.created` - Quando um projeto é criado
- `project.completed` - Quando um projeto é encerrado
- `milestone.created` - Quando um marco é criado (payload: `{ milestoneId, projectId, amount, order }`)
- `milestone.updated` - Quando um marco é atualizado

### Database: `project_db`

```sql
-- Tabelas
projects
categories
project_requirements
milestones
```

---

## 3. Bidding Context (Bounded Context)

### Responsabilidade
Gerenciamento de propostas submetidas por especialistas.

### Aggregate Root: Bid
```typescript
// Bid Aggregate Root
- id: UUID
- projectId: UUID (FK para Project Context - referência externa)
- specialistId: UUID (FK para Identity & Access Context - referência externa)
- proposal: string
- proposedBudget: decimal
- estimatedDuration: number (dias)
- status: BidStatus (PENDING | ACCEPTED | REJECTED | WITHDRAWN)
- createdAt: DateTime
- updatedAt: DateTime
```

### Entity: BidMessage
```typescript
// BidMessage Entity (comunicação entre partes)
- id: UUID
- bidId: UUID
- senderId: UUID
- message: string
- createdAt: DateTime
```

### Invariants (Business Rules)

```typescript
// RN02: Cada especialista pode ter apenas UMA proposta ativa por projeto
export class Bid {
  static submit(projectId: string, specialistId: string, existingBids: Bid[]): Bid {
    const hasActiveBid = existingBids.some(
      b => b.projectId === projectId &&
           b.specialistId === specialistId &&
           b.status === BidStatus.PENDING
    );
    if (hasActiveBid) {
      throw new DomainException('Specialist already has an active bid for this project (RN02)');
    }
    return new Bid({ projectId, specialistId, status: BidStatus.PENDING });
  }
}

// RN03: Apenas um especialista vencedor por projeto
export class AcceptBidUseCase {
  async execute(projectId: string, bidId: string): Promise<void> {
    const hasWinner = await this.bidRepository.findAcceptedByProject(projectId);
    if (hasWinner) {
      throw new DomainException('Project already has a selected specialist (RN03)');
    }
    // ... rest of logic
  }
}
```

### Use Cases (Application Services)
- `SubmitBidUseCase` - Submeter proposta (valida RN02)
- `GetBidsByProjectUseCase` - Listar propostas de um projeto
- `GetBidsBySpecialistUseCase` - Listar propostas de um especialista
- `AcceptBidUseCase` - Aceitar proposta (valida RN03, publica Integration Event)
- `RejectBidUseCase` - Rejeitar proposta
- `WithdrawBidUseCase` - Retirar proposta

### Integration Events (published)
- `bid.submitted` - Quando uma proposta é submetida
- `bid.accepted` - Quando uma proposta é aceita (importante para Project e Delivery)

### Database: `bidding_db`

```sql
-- Tabelas
bids
bid_messages
```

---

## 4. Delivery Context (Bounded Context) - OWNER OF PROJECTHISTORY

### Responsabilidade
Gerenciamento de entregas, progresso do projeto, rastreamento de status via Kanban board (RF08) e registro automático de histórico (RN07). Referencia milestones do Project Context via `milestoneId`.

### Aggregate Root: ProjectHistory
```typescript
// ProjectHistory Aggregate Root (OWNED by Delivery Context)
- id: UUID
- projectId: UUID (FK para Project Context - referência externa)
- specialistId: UUID (FK para Identity & Access Context - referência externa)
- action: string
- description: string
- createdAt: DateTime
```

### Entity: Delivery
```typescript
// Delivery Entity
- id: UUID
- milestoneId: UUID (FK para Project Context - referência externa)
- deliveredFiles: string[]
- deliveryNotes: string
- submittedAt: DateTime
```

### Entity: MilestoneComment
```typescript
// MilestoneComment Entity
- id: UUID
- milestoneId: UUID (FK para Project Context - referência externa)
- userId: UUID
- comment: string
- createdAt: DateTime
```

### Kanban Board (RF08)
Este contexto gerencia o board visual de acompanhamento (Kanban) do projeto. O board é composto por colunas e cards que refletem o status dos milestones referenciados do Project Context.

```typescript
// KanbanColumn (Entity)
- id: UUID
- projectId: UUID
- title: string
- order: number

// KanbanCard (Entity)
- id: UUID
- columnId: UUID
- milestoneId: UUID (referência externa → Project Context)
- title: string
- order: number
```

### Use Cases (Application Services)
- `StartMilestoneUseCase` - Iniciar marco (consome `milestone.created` do project-service)
- `SubmitDeliveryUseCase` - Submeter entrega
- `ApproveDeliveryUseCase` - Aprovar entrega
- `RejectDeliveryUseCase` - Rejeitar entrega
- `AddMilestoneCommentUseCase` - Adicionar comentário
- `GetKanbanBoardUseCase` - Obter board Kanban do projeto (RF08)
- `RecordProjectHistoryUseCase` - Registrar histórico automático (RN07)

### Integration Events (consumed)
- `bid.accepted` - Recebido do Bidding Context para inicializar acompanhamento
- `milestone.created` - Recebido do Project Context para criar card no Kanban

### Integration Events (published)
- `milestone.started` - Quando um marco inicia
- `milestone.validated` - Quando um marco é validado/aprovado (substitui milestone.completed)
- `history.recorded` - Quando um registro de histórico é criado (RN07)

### Database: `delivery_db`

```sql
-- Tabelas
deliveries
milestone_comments
project_histories
kanban_columns
kanban_cards
```

---

## 5. Payment Context (Bounded Context)

### Responsabilidade
Gerenciamento de pagamentos, bloqueios e liberações de fundos.

### Aggregate Root: Payment
```typescript
// Payment Aggregate Root
- id: UUID
- projectId: UUID (FK para Project Context)
- milestoneId: UUID (FK para Project Context - referência externa)
- amount: decimal
- status: PaymentStatus (ESCROW_HELD | RELEASED | REFUNDED)
- escrowTransactionId: string
- releaseTransactionId: string
- releasedAt: DateTime
- createdAt: DateTime
```

### Entity: EscrowAccount
```typescript
// EscrowAccount Entity
- id: UUID
- projectId: UUID
- totalAmount: decimal
- heldAmount: decimal
- releasedAmount: decimal
```

### Entity: Invoice
```typescript
// Invoice Entity
- id: UUID
- projectId: UUID
- milestoneId: UUID
- amount: decimal
- tax: decimal
- total: decimal
- status: InvoiceStatus (PENDING | PAID | CANCELLED)
- dueDate: DateTime
```

### Invariants (Business Rules)

```typescript
// RN06: Plataforma retém taxa percentual sobre cada pagamento liberado
const PLATFORM_FEE_RATE = 0.10; // 10%

export class Payment {
  release(): { specialistAmount: decimal; platformFee: decimal } {
    if (this.status !== PaymentStatus.ESCROW_HELD) {
      throw new DomainException('Only payments in ESCROW_HELD status can be released (RN06)');
    }
    const platformFee = this.amount * PLATFORM_FEE_RATE;
    const specialistAmount = this.amount - platformFee;
    this.status = PaymentStatus.RELEASED;
    this.releasedAt = new Date();
    return { specialistAmount, platformFee };
  }
}
```

### Use Cases (Application Services)
- `CreateEscrowUseCase` - Criar bloqueio de fundos
- `ReleasePaymentUseCase` - Liberar pagamento com retenção de taxa (RN06)
- `GetPaymentByMilestoneUseCase` - Buscar pagamento do marco
- `GetProjectPaymentsUseCase` - Listar pagamentos do projeto
- `CalculateProjectTotalUseCase` - Calcular total do projeto

### Integration Events (consumed)
- `milestone.validated` - Recebido do Delivery Context para preparar e liberar pagamento

### Integration Events (published)
- `payment.released` - Quando um pagamento é liberado

### Database: `payment_db`

```sql
-- Tabelas
payments
escrow_accounts
invoices
```

---

## 6. Portfolio Context (Bounded Context)

### Responsabilidade
Gerenciamento de portfólios, trabalhos anteriores, certificações e avaliações de especialistas. Também gerencia o perfil público de empresas (RF13).

**Este contexto é essencial para RF11, RF12, RF13 e RF14 do documento MERAKI v1.0**

### Aggregate Root: Portfolio
```typescript
// Portfolio Aggregate Root
- id: UUID
- specialistId: UUID (FK para Identity & Access Context - referência externa)
- title: string
- description: string
- category: string
- images: string[]
- projectUrl: string
- technologies: string[]
- startDate: DateTime
- endDate: DateTime
- isPublished: boolean
- createdAt: DateTime
- updatedAt: DateTime
```

### Entity: Certification
```typescript
// Certification Entity
- id: UUID
- specialistId: UUID
- name: string
- issuer: string
- issueDate: DateTime
- expiryDate: DateTime
- credentialId: string
- credentialUrl: string
```

### Entity: Review
```typescript
// Review Entity
- id: UUID
- specialistId: UUID
- projectId: UUID
- reviewerId: UUID
- rating: number (1-5)
- comment: string
- createdAt: DateTime
```

### Entity: SpecialistProfile (Value Object)
```typescript
// SpecialistProfile - Perfil público do especialista (RF12)
- id: UUID
- userId: UUID
- bio: string
- skills: string[]
- experience: number (anos)
- hourlyRate: decimal
- rating: decimal
- totalProjects: number
- completedProjects: number
```

### Entity: CompanyProfile
```typescript
// CompanyProfile - Perfil público da empresa (RF13)
- id: UUID
- companyId: UUID (FK para Identity & Access Context - referência externa)
- companyName: string
- industry: string
- website: string
- description: string
- totalProjectsPosted: number
- completedProjects: number
- createdAt: DateTime
- updatedAt: DateTime
```

### Use Cases (Application Services)
- `CreatePortfolioUseCase` - Criar item de portfólio
- `GetPortfolioBySpecialistUseCase` - Buscar portfólio do especialista
- `UpdatePortfolioUseCase` - Atualizar portfólio
- `DeletePortfolioUseCase` - Deletar item do portfólio
- `AddCertificationUseCase` - Adicionar certificação
- `GetSpecialistReviewsUseCase` - Buscar avaliações do especialista
- `SubmitReviewUseCase` - Enviar avaliação
- `GetSpecialistHistoryUseCase` - Buscar histórico profissional (RF11, RF14)
- `GetPublicSpecialistProfileUseCase` - Buscar perfil público (RF12)
- `GetPublicCompanyProfileUseCase` - Buscar perfil público da empresa (RF13)

### Integration Events (consumed)
- `user.registered` - Recebido do Identity & Access Context para criar perfil inicial
- `project.completed` - Recebido do Project Context para registrar histórico e atualizar histórico (RF11, RN07)
- `payment.released` - Recebido do Payment Context para atualizar estatísticas

### Integration Events (published)
- `portfolio.created` - Quando um item de portfólio é criado
- `review.submitted` - Quando uma avaliação é submetida

### Database: `portfolio_db`

```sql
-- Tabelas
portfolios
certifications
reviews
specialist_profiles
company_profiles
```

### API Endpoints (Portfolio Service)

| Method | Endpoint | Description | Requisito |
|--------|----------|-------------|-----------|
| GET | /portfolio/:specialistId | Get specialist portfolio | - |
| POST | /portfolio | Create portfolio item | - |
| PUT | /portfolio/:id | Update portfolio item | - |
| DELETE | /portfolio/:id | Delete portfolio item | - |
| GET | /portfolio/:specialistId/certifications | Get certifications | - |
| POST | /portfolio/certification | Add certification | - |
| GET | /portfolio/:specialistId/reviews | Get specialist reviews | - |
| POST | /portfolio/review | Submit review | - |
| GET | /profile/:specialistId | Get public specialist profile | RF12 |
| GET | /company-profile/:companyId | Get public company profile | RF13 |
| GET | /history/:specialistId | Get specialist work history | RF11, RF14 |

---

## 7. Integration Events Summary

### Event Schema (Cross-Bounded Context)

```typescript
// Base Integration Event
{
  eventId: UUID
  eventType: string
  timestamp: DateTime
  payload: any
}
```

### All Integration Events

| Event Name | Publisher | Payload | Consumers |
|------------|-----------|---------|-----------|
| `user.registered` | Identity & Access Context | `{ userId, email, userType, companyId, specialistId }` | Project, Bidding, Portfolio |
| `project.created` | Project Context | `{ projectId, title, budget, companyId }` | Bidding |
| `project.completed` | Project Context | `{ projectId, specialistId }` | Portfolio |
| `milestone.created` | Project Context | `{ milestoneId, projectId, amount, order }` | Delivery |
| `milestone.updated` | Project Context | `{ milestoneId, projectId, status }` | Delivery |
| `bid.submitted` | Bidding Context | `{ bidId, projectId, specialistId }` | Project |
| `bid.accepted` | Bidding Context | `{ bidId, projectId, specialistId }` | Project, Delivery |
| `milestone.started` | Delivery Context | `{ milestoneId, projectId }` | - |
| `milestone.validated` | Delivery Context | `{ milestoneId, projectId, amount }` | Payment |
| `history.recorded` | Delivery Context | `{ historyId, projectId, specialistId, action }` | Portfolio |
| `payment.released` | Payment Context | `{ paymentId, milestoneId, amount, specialistId }` | Project, Portfolio |
| `portfolio.created` | Portfolio Context | `{ portfolioId, specialistId }` | - |
| `review.submitted` | Portfolio Context | `{ reviewId, specialistId, rating }` | Identity & Access |

### RabbitMQ Queues

```
exchange: meraki.events (topic)

queues:
- user.events           (user.*)
- project.events        (project.*, milestone.created, milestone.updated)
- bidding.events        (bid.*)
- delivery.events       (milestone.started, milestone.validated, history.recorded)
- payment.events        (payment.*)
- portfolio.events      (portfolio.*, review.*)
```

---

## 8. Factory Pattern (DDD)

Factories encapsulam a lógica de criação de Aggregates complexos, centralizando validações de negócio que devem ocorrer na instanciação.

### ProjectFactory

```typescript
@Injectable()
export class ProjectFactory {
  create(data: CreateProjectDto, companyId: string): Project {
    // Validações de negócio na criação (RN01 - qualidade do escopo)
    if (!data.title || data.title.trim().length < 10) {
      throw new DomainException('Project title must have at least 10 characters (RN01)');
    }
    if (data.budget <= 0) {
      throw new DomainException('Budget must be greater than zero');
    }
    if (data.deadline <= new Date()) {
      throw new DomainException('Deadline must be in the future');
    }
    if (!data.requirements || data.requirements.length === 0) {
      throw new DomainException('Project must have at least one requirement (RN01)');
    }

    return new Project({
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      budget: data.budget,
      deadline: data.deadline,
      companyId: companyId,
      status: ProjectStatus.OPEN,
    });
  }
}
```

### MilestoneFactory (Project Context)

```typescript
// MilestoneFactory pertence ao Project Context (project-service)
@Injectable()
export class MilestoneFactory {
  createFromBid(bid: Bid, milestones: CreateMilestoneDto[]): Milestone[] {
    if (!milestones || milestones.length === 0) {
      throw new DomainException('Project must have at least one milestone');
    }
    // Atribui ordem sequencial — necessário para validação RN04
    return milestones.map((m, index) =>
      new Milestone({
        ...m,
        order: index + 1,
        projectId: bid.projectId,
        specialistId: bid.specialistId,
        status: MilestoneStatus.PENDING,
      })
    );
  }
}
```

---

## 9. Próximos Passos

- [ ] 03 - Implementação Backend NestJS
- [ ] 04 - Configuração RabbitMQ (ou Kafka)
- [ ] 05 - API Gateway
- [ ] 06 - Arquitetura Flutter MVVM
- [ ] 07 - Implementação Flutter/Dart

