# Meraki — Diagramas UML

> Diagramas em notação PlantUML. Renderize em [plantuml.com](https://plantuml.com/plantuml) ou com extensão VS Code PlantUML.

---

## 1. Diagrama de Classes Completo

```plantuml
@startuml Meraki_Full_Class_Diagram
!theme plain
skinparam linetype ortho
skinparam classBackgroundColor #FAFAFA
skinparam classBorderColor #999
skinparam packageBackgroundColor #F0F4FF
skinparam packageBorderColor #7090D0
skinparam arrowColor #555
skinparam stereotypeCBackgroundColor #D0E8FF
skinparam stereotypeEBackgroundColor #FFE8D0
skinparam stereotypeIBackgroundColor #E8FFD0
skinparam stereotypeSBackgroundColor #FFD0E8

' ═══════════════════════════════════════
' IDENTITY & ACCESS
' ═══════════════════════════════════════
package "Identity & Access" #E8F0FF {

  enum UserType {
    COMPANY
    SPECIALIST
  }

  class Email <<ValueObject>> {
    - value: string
    + isValid(): boolean
    + equals(other: Email): boolean
    + getValue(): string
  }

  class User <<AggregateRoot>> {
    + id: UUID
    + email: Email
    - passwordHash: string
    + name: string
    + userType: UserType
    + specialistId?: UUID
    + companyId?: UUID
    + isActive: boolean
    + createdAt: Date
    + updatedAt: Date
  }

  class CompanyProfile <<Entity>> {
    + id: UUID
    + userId: UUID
    + companyName: string
    + industry?: string
    + companySize?: string
    + website?: string
    + createdAt: Date
    + updatedAt: Date
  }

  class SpecialistProfile <<Entity>> {
    + id: UUID
    + userId: UUID
    + bio?: string
    + skills: string[]
    + experience: Decimal
    + hourlyRate: Decimal
    + rating: Decimal
    + createdAt: Date
    + updatedAt: Date
  }

  User "1" *-- "0..1" CompanyProfile : companyId >
  User "1" *-- "0..1" SpecialistProfile : specialistId >
  User --> Email : uses
  User --> UserType : type
}

' ═══════════════════════════════════════
' PROJECT MANAGEMENT
' ═══════════════════════════════════════
package "Project Management" #FFF0E8 {

  enum ProjectStatus {
    OPEN
    IN_PROGRESS
    COMPLETED
    CANCELLED
  }

  enum MilestoneStatus {
    PENDING
    IN_PROGRESS
    SUBMITTED
    APPROVED
    REJECTED
  }

  class Budget <<ValueObject>> {
    - amount: Decimal
    + getValue(): Decimal
    + equals(other: Budget): boolean
    ' Invariant: amount > 0 [RN01]
  }

  class Deadline <<ValueObject>> {
    - date: Date
    + getValue(): Date
    + equals(other: Deadline): boolean
    + isBefore(date: Date): boolean
    ' Invariant: date > now [RN01]
  }

  class Project <<AggregateRoot>> {
    + id: UUID
    + title: string
    + description: string
    + requirements: string[]
    + budget: Budget
    + deadline: Deadline
    + status: ProjectStatus
    + companyId: UUID
    + specialistId?: UUID
    + bidId?: UUID
    + createdAt: Date
    + updatedAt: Date
    --
    + assignSpecialist(specialistId, bidId): void
    + complete(): void
    + cancel(): void
  }

  class Milestone <<Entity>> {
    + id: UUID
    + projectId: UUID
    + title: string
    + description: string
    + amount: Decimal
    + order: int
    + status: MilestoneStatus
    + dueDate?: Date
    + createdAt: Date
    + updatedAt: Date
    --
    + start(allMilestones: Milestone[]): void
    + submit(): void
    + approve(): void
    + reject(): void
  }

  Project "1" *-- "1..*" Milestone : contains >
  Project --> Budget : uses
  Project --> Deadline : uses
  Project --> ProjectStatus : status
  Milestone --> MilestoneStatus : status
}

' ═══════════════════════════════════════
' BIDDING
' ═══════════════════════════════════════
package "Bidding" #F0FFE8 {

  enum BidStatus {
    PENDING
    ACCEPTED
    REJECTED
    WITHDRAWN
  }

  class ProposedValue <<ValueObject>> {
    - amount: Decimal
    + getValue(): Decimal
    + equals(other: ProposedValue): boolean
    ' Invariant: amount > 0
  }

  class BidSelectionDomainService <<DomainService>> {
    + selectWinner(bidId: UUID, projectBids: Bid[]): void
    ' [RN03] Garante único vencedor por projeto
  }

  class Bid <<AggregateRoot>> {
    + id: UUID
    + projectId: UUID
    + specialistId: UUID
    + proposal: string
    + proposedBudget: ProposedValue
    + estimatedDuration: int
    + status: BidStatus
    + createdAt: Date
    + updatedAt: Date
    --
    + accept(): void
    + reject(): void
    + withdraw(): void
  }

  class BidMessage <<Entity>> {
    + id: UUID
    + bidId: UUID
    + senderId: UUID
    + message: string
    + createdAt: Date
    ' Negociação empresa <-> especialista
  }

  Bid "1" *-- "0..*" BidMessage : contains >
  Bid --> ProposedValue : uses
  Bid --> BidStatus : status
  BidSelectionDomainService ..> Bid : operates on
}

' ═══════════════════════════════════════
' DELIVERY TRACKING
' ═══════════════════════════════════════
package "Delivery Tracking" #FFF8E8 {

  enum DeliveryStatus {
    PENDING
    SUBMITTED
    APPROVED
    REJECTED
  }

  class MilestoneProgressionDomainService <<DomainService>> {
    + canStart(milestoneOrder: int, allStatuses: MilestoneStatus[]): boolean
    + assertCanStart(milestoneOrder: int, allStatuses: MilestoneStatus[]): void
    ' [RN04] Progressão sequencial de milestones
  }

  class KanbanColumnFactory <<Factory>> {
    + createDefaultColumns(projectId: UUID): KanbanColumn[]
  }

  class Delivery <<AggregateRoot>> {
    + id: UUID
    + milestoneId: UUID
    + projectId: UUID
    + specialistId: UUID
    + status: DeliveryStatus
    + deliveredFiles?: string[]
    + deliveryNotes?: string
    + rejectionReason?: string
    + submittedAt?: Date
    + reviewedAt?: Date
    + createdAt: Date
    + updatedAt: Date
  }

  class KanbanColumn <<AggregateRoot>> {
    + id: UUID
    + projectId: UUID
    + title: string
    + order: int
    + createdAt: Date
  }

  class KanbanCard <<Entity>> {
    + id: UUID
    + columnId: UUID
    + milestoneId: UUID
    + title: string
    + order: int
    + milestoneStatus?: string
    + createdAt: Date
    + updatedAt: Date
  }

  class ProjectHistory <<EventLog>> {
    + id: UUID
    + projectId: UUID
    + specialistId?: UUID
    + action: string
    + description?: string
    + createdAt: Date
    ' Read Model — sem invariantes, só auditoria [RN07]
  }

  class MilestoneComment <<Entity>> {
    + id: UUID
    + milestoneId: UUID
    + userId: UUID
    + comment: string
    + createdAt: Date
    ' Feedback empresa <-> especialista
  }

  KanbanColumn "1" *-- "0..*" KanbanCard : contains >
  Delivery --> DeliveryStatus : status
  KanbanColumnFactory ..> KanbanColumn : creates
}

' ═══════════════════════════════════════
' PAYMENT & ESCROW
' ═══════════════════════════════════════
package "Payment & Escrow" #FFE8F0 {

  enum PaymentStatus {
    ESCROW_HELD
    RELEASED
    REFUNDED
  }

  class FeeCalculationDomainService <<DomainService>> {
    + rate: number
    + calculate(amount: Decimal): FeeResult
    ' [RN06] Taxa padrão: 10%
  }

  class EscrowAccount <<AggregateRoot>> {
    + id: UUID
    + projectId: UUID
    + totalAmount: Decimal
    + heldAmount: Decimal
    + releasedAmount: Decimal
    + createdAt: Date
    + updatedAt: Date
  }

  class Payment <<AggregateRoot>> {
    + id: UUID
    + projectId: UUID
    + milestoneId: UUID
    + specialistId: UUID
    + amount: Decimal
    + specialistAmount?: Decimal
    + platformFee?: Decimal
    + status: PaymentStatus
    + escrowTransactionId?: string
    + releaseTransactionId?: string
    + releasedAt?: Date
    + createdAt: Date
    + updatedAt: Date
    --
    + release(feeRate: number): void
    ' [RN06] Calcula taxa e libera pagamento
  }

  Payment --> PaymentStatus : status
  FeeCalculationDomainService ..> Payment : used by
}

' ═══════════════════════════════════════
' PORTFOLIO
' ═══════════════════════════════════════
package "Portfolio" #F0E8FF {

  class Rating <<ValueObject>> {
    - value: Decimal
    + getValue(): Decimal
    + equals(other: Rating): boolean
    + {static} average(ratings: Rating[]): Rating
    ' Invariant: 0 <= value <= 5
  }

  class SpecialistProfileFactory <<Factory>> {
    + createFromUser(userData): SpecialistPublicProfile
  }

  class SpecialistPublicProfile <<AggregateRoot>> {
    + id: UUID
    + userId: UUID
    + name?: string
    + bio?: string
    + skills?: string[]
    + experience: Decimal
    + hourlyRate: Decimal
    + rating: Rating
    + totalProjects: int
    + completedProjects: int
    ' completedProjects++ via project.completed event
    + createdAt: Date
    + updatedAt: Date
  }

  class CompanyPublicProfile <<AggregateRoot>> {
    + id: UUID
    + userId: UUID
    + companyName?: string
    + description: string
    + website?: string
    + sector?: string
    + totalProjectsCreated: int
    + rating: Rating
    + createdAt: Date
    + updatedAt: Date
  }

  class Portfolio <<AggregateRoot>> {
    + id: UUID
    + specialistId: UUID
    + title: string
    + description: string
    + category?: string
    + images?: string[]
    + projectUrl?: string
    + technologies?: string[]
    + startDate?: Date
    + endDate?: Date
    + isPublished: boolean
    + createdAt: Date
    + updatedAt: Date
  }

  class WorkHistory <<AggregateRoot>> {
    + id: UUID
    + specialistId: UUID
    + projectId: UUID
    + projectTitle?: string
    + companyId?: UUID
    + amountEarned: Decimal
    + completedAt?: Date
    + createdAt: Date
    ' Criado via payment.released event [RF11,RF14]
  }

  class Certification <<AggregateRoot>> {
    + id: UUID
    + specialistId: UUID
    + name: string
    + issuer: string
    + issueDate?: Date
    + expiryDate?: Date
    + credentialId?: string
    + credentialUrl?: string
    + createdAt: Date
  }

  class Review <<AggregateRoot>> {
    + id: UUID
    + specialistId: UUID
    + projectId: UUID
    + reviewerId: UUID
    + rating: Rating
    + comment?: string
    + createdAt: Date
  }

  SpecialistPublicProfile --> Rating : uses
  CompanyPublicProfile --> Rating : uses
  Review --> Rating : uses
  SpecialistProfileFactory ..> SpecialistPublicProfile : creates
}

' ═══════════════════════════════════════
' CROSS-CONTEXT REFERENCES (dashed)
' ═══════════════════════════════════════
User "1" <.. "0..*" Project : companyId
User "1" <.. "0..*" Project : specialistId
User "1" <.. "0..*" Bid : specialistId
Project "1" <.. "0..*" Bid : projectId
Milestone "1" <.. "1" Delivery : milestoneId
Milestone "1" <.. "0..*" KanbanCard : milestoneId
Milestone "1" <.. "1" Payment : milestoneId
Project "1" <.. "1" EscrowAccount : projectId
User "1" <.. "0..*" WorkHistory : specialistId
User "1" <.. "1" SpecialistPublicProfile : userId
User "1" <.. "1" CompanyPublicProfile : userId
Project "1" <.. "0..*" Review : projectId

@enduml
```

---

## 2. Diagrama de Sequência — Fluxo Completo de Projeto

```plantuml
@startuml Meraki_Project_Lifecycle
!theme plain
skinparam sequenceMessageAlign center
skinparam responseMessageBelowArrow true

actor "Empresa" as Company
actor "Especialista" as Specialist
participant "API Gateway\n:3000" as GW
participant "identity-service\n:3001" as Identity
participant "project-service\n:3002" as ProjectSvc
participant "bidding-service\n:3003" as BiddingSvc
participant "delivery-service\n:3004" as DeliverySvc
participant "payment-service\n:3005" as PaymentSvc
participant "portfolio-service\n:3006" as PortfolioSvc
queue "RabbitMQ\nmeraki.events" as MQ

== Registro ==

Company -> GW: POST /auth/register {userType: COMPANY}
GW -> Identity: register(...)
Identity -> MQ: publish(user.registered, {COMPANY})
MQ -> PortfolioSvc: consume user.registered
PortfolioSvc -> PortfolioSvc: createCompanyPublicProfile()
GW --> Company: 201 {token}

Specialist -> GW: POST /auth/register {userType: SPECIALIST}
GW -> Identity: register(...)
Identity -> MQ: publish(user.registered, {SPECIALIST})
MQ -> PortfolioSvc: consume user.registered
PortfolioSvc -> PortfolioSvc: createSpecialistPublicProfile()
GW --> Specialist: 201 {token}

== Criação de Projeto e Milestones ==

Company -> GW: POST /projects
GW -> ProjectSvc: createProject(budget, deadline)
note right : Budget VO e Deadline VO\nvalidam invariantes [RN01]
ProjectSvc -> MQ: publish(project.created)
GW --> Company: 201 {projectId}

Company -> GW: POST /projects/:id/milestones {order: 1}
GW -> ProjectSvc: createMilestone(...)
ProjectSvc -> MQ: publish(milestone.created)
MQ -> DeliverySvc: consume milestone.created
DeliverySvc -> DeliverySvc: createKanbanCard("Pendente")
GW --> Company: 201 {milestoneId}

== Proposta e Negociação ==

Specialist -> GW: POST /bids/project/:id
GW -> BiddingSvc: submitBid(...)
note right : RN02: verifica uma\nproposta ativa por projeto
BiddingSvc -> MQ: publish(bid.submitted)
GW --> Specialist: 201 {bidId}

Specialist -> GW: POST /bids/:id/messages {message}
GW -> BiddingSvc: sendBidMessage(bidId, message)
GW --> Specialist: 201

Company -> GW: GET /bids/:id/messages
GW -> BiddingSvc: getBidMessages(bidId)
GW --> Company: 200 [messages]

== Seleção do Vencedor ==

Company -> GW: PUT /bids/:id/accept
GW -> BiddingSvc: selectWinner(bidId)
BiddingSvc -> BiddingSvc: BidSelectionDomainService\n.selectWinner() [RN03]
BiddingSvc -> MQ: publish(bid.accepted)
MQ -> ProjectSvc: consume bid.accepted
ProjectSvc -> ProjectSvc: Project.assignSpecialist()
MQ -> DeliverySvc: consume bid.accepted
DeliverySvc -> DeliverySvc: KanbanColumnFactory\n.createDefaultColumns()
DeliverySvc -> DeliverySvc: ProjectHistory.create() [RN07]
GW --> Company: 200

== Execução com Comentários ==

Specialist -> GW: POST /milestones/:id/comments
GW -> DeliverySvc: addMilestoneComment(milestoneId, comment)
GW --> Specialist: 201

Company -> GW: GET /milestones/:id/comments
GW --> Company: 200 [comments]

== Validação e Pagamento ==

Specialist -> GW: POST /milestones/:id/submit
GW -> DeliverySvc: submitDelivery(milestoneId)
GW --> Specialist: 201

Company -> GW: PUT /milestones/:id/approve {amount}
GW -> DeliverySvc: approveDelivery(milestoneId)
note right : MilestoneProgressionDomainService\nvalida sequência [RN04]
DeliverySvc -> MQ: publish(milestone.validated)
MQ -> PaymentSvc: consume milestone.validated
PaymentSvc -> PaymentSvc: FeeCalculationDomainService\n.calculate() [RN06]
PaymentSvc -> PaymentSvc: Payment.release(feeRate)
PaymentSvc -> MQ: publish(payment.released)
MQ -> PortfolioSvc: consume payment.released
PortfolioSvc -> PortfolioSvc: WorkHistory.create() [RF11]
GW --> Company: 204

== Conclusão do Projeto ==

Company -> GW: PUT /projects/:id/complete
GW -> ProjectSvc: completeProject(id)
note right : Valida todas as\nmilestones APPROVED
ProjectSvc -> ProjectSvc: Project.complete()
ProjectSvc -> MQ: publish(project.completed)
MQ -> PortfolioSvc: consume project.completed
PortfolioSvc -> PortfolioSvc: profile.completedProjects++
GW --> Company: 204

@enduml
```

---

## 3. Diagrama de Componentes — Arquitetura de Microserviços

```plantuml
@startuml Meraki_Components
!theme plain
skinparam componentStyle rectangle
skinparam linetype ortho

cloud "Cliente Mobile\n(Flutter)" as Flutter

node "API Gateway :3000" as GW {
  [JWT Validator]
  [Rate Limiter]
  [HTTP Proxy]
}

node "identity-service :3001" {
  [AuthController]
  [UserController]
  database "PostgreSQL\nidentity_db" as IdentityDB
}

node "project-service :3002" {
  [ProjectController]
  [MilestoneController]
  database "PostgreSQL\nproject_db" as ProjectDB
}

node "bidding-service :3003" {
  [BidController\n+Messages]
  database "PostgreSQL\nbidding_db" as BiddingDB
}

node "delivery-service :3004" {
  [DeliveryController]
  [KanbanController]
  [CommentController]
  database "PostgreSQL\ndelivery_db" as DeliveryDB
}

node "payment-service :3005" {
  [PaymentController]
  [EscrowController]
  database "PostgreSQL\npayment_db" as PaymentDB
}

node "portfolio-service :3006" {
  [PortfolioController]
  [ProfileController]
  database "PostgreSQL\nportfolio_db" as PortfolioDB
}

queue "RabbitMQ\nExchange: meraki.events\n(Topic, Durable)" as RMQ

Flutter --> GW : HTTPS
GW --> "identity-service :3001" : HTTP
GW --> "project-service :3002" : HTTP
GW --> "bidding-service :3003" : HTTP
GW --> "delivery-service :3004" : HTTP
GW --> "payment-service :3005" : HTTP
GW --> "portfolio-service :3006" : HTTP

"identity-service :3001" --> RMQ : user.registered
"project-service :3002" --> RMQ : project.* / milestone.*\nproject.completed
"bidding-service :3003" --> RMQ : bid.*
"delivery-service :3004" --> RMQ : delivery.* / milestone.validated
"payment-service :3005" --> RMQ : payment.released

RMQ --> "project-service :3002" : bid.accepted
RMQ --> "delivery-service :3004" : bid.accepted / milestone.created
RMQ --> "payment-service :3005" : milestone.validated
RMQ --> "portfolio-service :3006" : user.registered\npayment.released\nproject.completed

@enduml
```

---

## 4. Diagrama de Estados

```plantuml
@startuml Meraki_State_Diagrams
!theme plain

state "Project Lifecycle" as ProjGroup {
  [*] --> OPEN : create
  OPEN --> IN_PROGRESS : assignSpecialist()\n[bid.accepted]
  IN_PROGRESS --> COMPLETED : complete()\n[todas APPROVED]\npublica project.completed
  OPEN --> CANCELLED : cancel()
  IN_PROGRESS --> CANCELLED : cancel()
}

state "Milestone Lifecycle" as MilGroup {
  [*] --> PENDING_M : create
  PENDING_M --> IN_PROGRESS_M : start()\n[RN04: anterior APPROVED]
  IN_PROGRESS_M --> SUBMITTED_M : submit()
  SUBMITTED_M --> APPROVED_M : approve()
  SUBMITTED_M --> REJECTED_M : reject()
  REJECTED_M --> IN_PROGRESS_M : (retry)
  APPROVED_M --> [*]
}

state "Bid Lifecycle" as BidGroup {
  [*] --> PENDING_B : submit
  PENDING_B --> ACCEPTED_B : accept()\n[RN03: único por projeto]
  PENDING_B --> REJECTED_B : reject()
  PENDING_B --> WITHDRAWN_B : withdraw()
}

state "Payment Lifecycle" as PayGroup {
  [*] --> ESCROW_HELD : create
  ESCROW_HELD --> RELEASED : release(feeRate)\n[RN06: 10% taxa]
  ESCROW_HELD --> REFUNDED : refund()
}

PENDING_M : PENDING
IN_PROGRESS_M : IN_PROGRESS
SUBMITTED_M : SUBMITTED
APPROVED_M : APPROVED
REJECTED_M : REJECTED

PENDING_B : PENDING
ACCEPTED_B : ACCEPTED
REJECTED_B : REJECTED
WITHDRAWN_B : WITHDRAWN

@enduml
```

---

## 5. Rotas REST — Mapa Completo (via API Gateway)

```plantuml
@startuml Meraki_API_Routes
!theme plain
skinparam packageBackgroundColor #FAFAFA
skinparam packageBorderColor #888

package "Auth — /auth" {
  class Routes {
    POST /register
    POST /login
    GET  /me
  }
}

package "Projects — /projects" {
  class Routes2 as Routes {
    POST   /                 «COMPANY»
    GET    /
    GET    /:id
    PUT    /:id              «COMPANY»
    DELETE /:id              «COMPANY»
    PUT    /:id/complete     «COMPANY»
    POST   /:id/milestones   «COMPANY»
    GET    /:id/milestones
    GET    /:id/kanban
    GET    /:id/history
  }
}

package "Bids — /bids" {
  class Routes3 as Routes {
    POST /project/:projectId  «SPECIALIST»
    GET  /project/:projectId
    GET  /my-bids             «SPECIALIST»
    GET  /:id
    PUT  /:id/accept          «COMPANY»
    PUT  /:id/reject          «COMPANY»
    PUT  /:id/withdraw        «SPECIALIST»
    POST /:id/messages
    GET  /:id/messages
  }
}

package "Milestones — /milestones" {
  class Routes4 as Routes {
    POST /:id/submit    «SPECIALIST»
    PUT  /:id/approve   «COMPANY»
    PUT  /:id/reject    «COMPANY»
    POST /:id/comments
    GET  /:id/comments
  }
}

package "Payments — /payments" {
  class Routes5 as Routes {
    GET /project/:projectId
    GET /:id
  }
}

package "Portfolio — /portfolio & /profiles" {
  class Routes6 as Routes {
    GET  /profiles/specialist/:id
    GET  /profiles/company/:id
    POST /portfolio
    GET  /portfolio/my
    POST /certifications
    GET  /certifications/my
    POST /reviews
  }
}

@enduml
```

---

## Como renderizar

### VS Code
Instale a extensão **PlantUML** e pressione `Alt+D` em qualquer bloco `@startuml...@enduml`.

### Online
Acesse [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/) e cole o conteúdo entre `@startuml` e `@enduml`.

### CLI
```bash
npm install -g node-plantuml
puml generate docs/UML_CLASS_DIAGRAM.md --output docs/
```
