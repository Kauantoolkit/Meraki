# MERAKI - Project Service: Log de Implementação

**Data:** 2026-03-21
**Status:** Implementado

---

## Estrutura de Arquivos

```
backend/project-service/
├── src/
│   ├── main.ts                                          # Bootstrap (porta 3002)
│   ├── app.module.ts                                    # Root module
│   ├── project.module.ts                                # Módulo principal do contexto
│   │
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── project.entity.ts                       # Aggregate Root — com invariantes
│   │   │   └── milestone.entity.ts                     # Aggregate Root — RN04 enforced
│   │   ├── enums/
│   │   │   ├── project-status.enum.ts
│   │   │   └── milestone-status.enum.ts
│   │   ├── exceptions/
│   │   │   └── domain.exception.ts
│   │   ├── factories/
│   │   │   ├── project.factory.ts                      # Valida RN01 na criação
│   │   │   └── milestone.factory.ts                    # Cria milestones com ordem sequencial
│   │   ├── repositories/
│   │   │   ├── project.repository.interface.ts
│   │   │   └── milestone.repository.interface.ts
│   │   └── events/
│   │       ├── base.event.ts
│   │       ├── project-created.event.ts
│   │       ├── project-completed.event.ts
│   │       ├── milestone-created.event.ts
│   │       └── milestone-updated.event.ts
│   │
│   ├── application/
│   │   ├── dto/
│   │   │   ├── create-project.dto.ts
│   │   │   ├── update-project.dto.ts
│   │   │   └── create-milestone.dto.ts
│   │   └── use-cases/
│   │       ├── create-project.use-case.ts
│   │       ├── get-projects.use-case.ts
│   │       ├── get-project-by-id.use-case.ts
│   │       ├── update-project.use-case.ts
│   │       ├── cancel-project.use-case.ts
│   │       ├── assign-specialist.use-case.ts           # Consumido via bid.accepted
│   │       ├── create-milestone.use-case.ts
│   │       ├── get-milestones-by-project.use-case.ts
│   │       └── update-milestone-status.use-case.ts     # start|submit|approve|reject + RN04
│   │
│   ├── infrastructure/
│   │   ├── auth/
│   │   │   └── jwt.strategy.ts                         # Valida JWT localmente
│   │   ├── database/
│   │   │   └── typeorm.config.ts                       # project_db (porta 5433)
│   │   ├── rabbitmq/
│   │   │   ├── rabbitmq.module.ts
│   │   │   ├── rabbitmq-config.service.ts
│   │   │   ├── event-publisher.service.ts              # Publica 4 tipos de eventos
│   │   │   └── bid-accepted.consumer.ts                # Consome bid.accepted → assignSpecialist
│   │   └── repositories/
│   │       ├── project.repository.ts
│   │       └── milestone.repository.ts
│   │
│   └── interfaces/
│       ├── controllers/
│       │   ├── project.controller.ts                   # CRUD /api/projects
│       │   └── milestone.controller.ts                 # /api/projects/:id/milestones
│       ├── guards/
│       │   └── jwt-auth.guard.ts
│       ├── decorators/
│       │   └── current-user.decorator.ts
│       └── filters/
│           └── http-exception.filter.ts
```

---

## Endpoints Expostos (porta 3002)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/projects` | ✅ JWT | Criar projeto (valida RN01 via Factory) |
| GET | `/api/projects` | ✅ JWT | Listar (filtra por role: empresa vê seus, especialista os seus) |
| GET | `/api/projects/:id` | ✅ JWT | Detalhes + milestones |
| PUT | `/api/projects/:id` | ✅ JWT | Atualizar (só COMPANY dona, só OPEN) |
| DELETE | `/api/projects/:id` | ✅ JWT | Cancelar (invariante no domain) |
| POST | `/api/projects/:id/milestones` | ✅ JWT | Criar milestone (auto-incrementa order) |
| GET | `/api/projects/:id/milestones` | ✅ JWT | Listar milestones (ordenados por order) |
| PUT | `/api/projects/milestones/:id/start` | ✅ JWT | Iniciar — **RN04 enforced** |
| PUT | `/api/projects/milestones/:id/submit` | ✅ JWT | Submeter entrega |
| PUT | `/api/projects/milestones/:id/approve` | ✅ JWT | Aprovar |
| PUT | `/api/projects/milestones/:id/reject` | ✅ JWT | Rejeitar |

**Swagger:** `http://localhost:3002/api/docs`

---

## Banco de Dados: `project_db` (PostgreSQL porta 5433)

Tabelas criadas via TypeORM sync:
- `projects`
- `milestones`

---

## Eventos RabbitMQ

| Tipo | Evento | Routing Key |
|------|--------|-------------|
| Publicado | ProjectCreatedEvent | `project.created` |
| Publicado | ProjectCompletedEvent | `project.completed` |
| Publicado | MilestoneCreatedEvent | `milestone.created` |
| Publicado | MilestoneUpdatedEvent | `milestone.updated` |
| Consumido | — | `bid.accepted` → `AssignSpecialistUseCase` |

---

## Regras de Negócio Implementadas

- **RN01** — `ProjectFactory.create()`: título ≥ 10 chars, budget > 0, deadline futuro, ≥ 1 requisito
- **RN04** — `Milestone.start()`: não pode iniciar se milestone anterior não está APPROVED
- `Project.assignSpecialist()`: só projetos OPEN
- `Project.cancel()`: não cancela projetos COMPLETED
- `Project.complete()`: só projetos IN_PROGRESS
